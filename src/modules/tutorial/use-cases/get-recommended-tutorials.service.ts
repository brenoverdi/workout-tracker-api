import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSession, SessionExercise } from '../../session/model';
import { Exercise } from '../../exercise/model';
import { Tutorial } from '../model';
import { ElasticsearchService } from '../../../services/elasticsearch.service';
import { RedisService } from '../../../services/redis.service';
import { RecommendedTutorialDto } from '../tutorial.dto';

@Injectable()
export class GetRecommendedTutorialsService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
    @InjectRepository(SessionExercise)
    private sessionExerciseRepository: Repository<SessionExercise>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(Tutorial)
    private tutorialRepository: Repository<Tutorial>,
    private elasticsearchService: ElasticsearchService,
    private redisService: RedisService,
  ) {}

  async execute(
    userId: string,
    limit: number = 10,
  ): Promise<RecommendedTutorialDto[]> {
    const cacheKey = `tutorials:recommended:user:${userId}`;

    // Try cache first
    const cached =
      await this.redisService.get<RecommendedTutorialDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get user's recent training data from PostgreSQL
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId })
      .andWhere('session.sessionDate >= :date', { date: thirtyDaysAgo })
      .andWhere('session.duration IS NOT NULL')
      .leftJoinAndSelect('session.sessionExercises', 'se')
      .leftJoinAndSelect('se.exercise', 'exercise')
      .orderBy('session.sessionDate', 'DESC')
      .take(50)
      .getMany();

    // Extract exercise IDs and muscle groups
    const exerciseIds = new Set<string>();
    const muscleGroups = new Set<string>();

    for (const session of recentSessions) {
      for (const se of session.sessionExercises || []) {
        if (se.exerciseId) {
          exerciseIds.add(se.exerciseId);
        }
        if (se.exercise?.muscleGroups) {
          muscleGroups.add(se.exercise.muscleGroups);
        }
      }
    }

    // Find under-trained muscle groups (simplified - could be enhanced)
    const allMuscleGroups = [
      'chest',
      'back',
      'shoulders',
      'biceps',
      'triceps',
      'abs',
      'quadriceps',
      'hamstrings',
      'glutes',
      'calves',
    ];
    const underTrainedMuscleGroups = allMuscleGroups.filter(
      (mg) => !muscleGroups.has(mg),
    );

    // Query Elasticsearch for relevant tutorials
    try {
      const recommendations = await this.getRecommendationsFromES(
        Array.from(exerciseIds),
        Array.from(muscleGroups),
        underTrainedMuscleGroups,
        limit,
      );

      // Cache for 30 minutes
      await this.redisService.set(cacheKey, recommendations, 1800);

      return recommendations;
    } catch (error) {
      console.warn(
        'Elasticsearch recommendations failed, using PostgreSQL fallback:',
        error.message,
      );
      // Fallback to PostgreSQL
      return await this.getRecommendationsFromPostgreSQL(
        Array.from(exerciseIds),
        limit,
      );
    }
  }

  private async getRecommendationsFromES(
    exerciseIds: string[],
    muscleGroups: string[],
    underTrainedMuscleGroups: string[],
    limit: number,
  ): Promise<RecommendedTutorialDto[]> {
    const should: any[] = [];

    // Prioritize tutorials for frequently trained exercises
    if (exerciseIds.length > 0) {
      should.push({
        terms: { exerciseIds: exerciseIds.slice(0, 10) },
        boost: 2.0,
      });
    }

    // Include tutorials for trained muscle groups
    if (muscleGroups.length > 0) {
      should.push({
        terms: { muscleGroups: Array.from(muscleGroups) },
        boost: 1.5,
      });
    }

    // Include tutorials for under-trained muscle groups (mobility/recovery focus)
    if (underTrainedMuscleGroups.length > 0) {
      should.push({
        bool: {
          must: [
            { terms: { muscleGroups: underTrainedMuscleGroups } },
            { terms: { type: ['mobility', 'recovery'] } },
          ],
        },
        boost: 1.0,
      });
    }

    const query: any = {
      query: {
        bool: {
          should: should.length > 0 ? should : [{ match_all: {} }],
          must_not: [{ term: { type: 'theory' } }], // Exclude theory tutorials from recommendations
        },
      },
      sort: [{ _score: { order: 'desc' } }],
      size: limit,
    };

    const client = this.elasticsearchService.getClient();
    const results = await client.search({
      index: 'tutorials',
      body: query,
    });

    const hits = (results as any).body?.hits ||
      (results as any).hits || { hits: [] };
    return hits.hits.map((hit: any, index: number) => {
      const source = hit._source || hit;
      let reason = 'Recommended for you';
      let priority: 'high' | 'medium' | 'low' = 'medium';

      if (
        source.exerciseIds &&
        exerciseIds.some((id) => source.exerciseIds.includes(id))
      ) {
        reason = "You've been training exercises related to this tutorial";
        priority = 'high';
      } else if (
        source.muscleGroups &&
        muscleGroups.some((mg) => source.muscleGroups.includes(mg))
      ) {
        reason = `Relevant to your ${source.muscleGroups[0]} training`;
        priority = 'medium';
      } else if (
        source.muscleGroups &&
        underTrainedMuscleGroups.some((mg) => source.muscleGroups.includes(mg))
      ) {
        reason = `Consider adding ${source.muscleGroups[0]} work to your routine`;
        priority = 'low';
      }

      return {
        tutorialId: hit._id || hit.id,
        title: source.title,
        summary: source.summary,
        type: source.type,
        reason,
        priority,
        thumbnailUrl: source.thumbnailUrl,
        hasVideo: source.hasVideo || false,
      };
    });
  }

  private async getRecommendationsFromPostgreSQL(
    exerciseIds: string[],
    limit: number,
  ): Promise<RecommendedTutorialDto[]> {
    if (exerciseIds.length === 0) {
      return [];
    }

    const tutorials = await this.tutorialRepository
      .createQueryBuilder('tutorial')
      .innerJoin(
        'tutorial.tutorialExercises',
        'te',
        'te.exerciseId IN (:...exerciseIds)',
        {
          exerciseIds: exerciseIds.slice(0, 10),
        },
      )
      .leftJoinAndSelect('tutorial.tutorialMedia', 'tm')
      .where('tutorial.isPublished = :isPublished', { isPublished: true })
      .andWhere('tutorial.type != :type', { type: 'theory' })
      .orderBy('tutorial.priority', 'DESC')
      .addOrderBy('tutorial.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return tutorials.map((tutorial) => {
      const primaryMedia = tutorial.tutorialMedia?.find((m) => m.isPrimary);
      return {
        tutorialId: tutorial.id,
        title: tutorial.title,
        summary: tutorial.summary,
        type: tutorial.type,
        reason: "You've been training exercises related to this tutorial",
        priority: 'medium' as const,
        thumbnailUrl: primaryMedia?.thumbnailUrl || null,
        hasVideo: tutorial.tutorialMedia && tutorial.tutorialMedia.length > 0,
      };
    });
  }
}
