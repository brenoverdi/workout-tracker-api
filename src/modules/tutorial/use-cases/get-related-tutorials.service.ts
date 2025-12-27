import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorial } from '../model';
import { ElasticsearchService } from '../../../services/elasticsearch.service';
import { RedisService } from '../../../services/redis.service';
import { TutorialListItemDto } from '../tutorial.dto';

@Injectable()
export class GetRelatedTutorialsService {
  constructor(
    @InjectRepository(Tutorial)
    private tutorialRepository: Repository<Tutorial>,
    private elasticsearchService: ElasticsearchService,
    private redisService: RedisService,
  ) {}

  async execute(
    tutorialId: string,
    limit: number = 5,
  ): Promise<TutorialListItemDto[]> {
    const cacheKey = `tutorials:related:${tutorialId}`;

    // Try cache first
    const cached = await this.redisService.get<TutorialListItemDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Try Elasticsearch "more like this" query
      return await this.getRelatedWithElasticsearch(
        tutorialId,
        limit,
        cacheKey,
      );
    } catch (error) {
      console.warn(
        'Elasticsearch related query failed, falling back to PostgreSQL:',
        error.message,
      );
      // Fallback to PostgreSQL
      return await this.getRelatedWithPostgreSQL(tutorialId, limit, cacheKey);
    }
  }

  private async getRelatedWithElasticsearch(
    tutorialId: string,
    limit: number,
    cacheKey: string,
  ): Promise<TutorialListItemDto[]> {
    const query: any = {
      query: {
        more_like_this: {
          fields: ['exerciseIds', 'muscleGroups', 'tags', 'type'],
          like: [
            {
              _index: 'tutorials',
              _id: tutorialId,
            },
          ],
          min_term_freq: 1,
          min_doc_freq: 1,
        },
      },
      size: limit,
    };

    const client = this.elasticsearchService.getClient();
    const results = await client.search({
      index: 'tutorials',
      body: query,
    });

    const hits = (results as any).body?.hits ||
      (results as any).hits || { hits: [] };
    const tutorials: TutorialListItemDto[] = hits.hits.map((hit: any) => ({
      id: hit._id,
      title: hit._source.title,
      summary: hit._source.summary,
      type: hit._source.type,
      difficulty: hit._source.difficulty,
      tags: hit._source.tags || [],
      thumbnailUrl: hit._source.thumbnailUrl,
      hasVideo: hit._source.hasVideo || false,
      videoDuration: hit._source.videoDuration,
      exerciseIds: hit._source.exerciseIds || [],
      exerciseNames: hit._source.exerciseNames || [],
      muscleGroups: hit._source.muscleGroups || [],
    }));

    // Cache for 2 hours
    await this.redisService.set(cacheKey, tutorials, 7200);

    return tutorials;
  }

  private async getRelatedWithPostgreSQL(
    tutorialId: string,
    limit: number,
    cacheKey: string,
  ): Promise<TutorialListItemDto[]> {
    // Get the tutorial first to find shared exercises and muscle groups
    const tutorial = await this.tutorialRepository.findOne({
      where: { id: tutorialId },
      relations: ['tutorialExercises', 'tutorialMuscleGroups'],
    });

    if (!tutorial) {
      return [];
    }

    const exerciseIds =
      tutorial.tutorialExercises?.map((te) => te.exerciseId) || [];
    const muscleGroups =
      tutorial.tutorialMuscleGroups?.map((tmg) => tmg.muscleGroup) || [];

    if (exerciseIds.length === 0 && muscleGroups.length === 0) {
      return [];
    }

    // Find tutorials with shared exercises or muscle groups
    const queryBuilder = this.tutorialRepository
      .createQueryBuilder('tutorial')
      .leftJoinAndSelect('tutorial.tutorialExercises', 'te')
      .leftJoinAndSelect('te.exercise', 'exercise')
      .leftJoinAndSelect('tutorial.tutorialMuscleGroups', 'tmg')
      .leftJoinAndSelect('tutorial.tutorialMedia', 'tm')
      .where('tutorial.id != :tutorialId', { tutorialId })
      .andWhere('tutorial.isPublished = :isPublished', { isPublished: true });

    if (exerciseIds.length > 0 && muscleGroups.length > 0) {
      queryBuilder.andWhere(
        '(te.exerciseId IN (:...exerciseIds) OR tmg.muscleGroup IN (:...muscleGroups))',
        { exerciseIds, muscleGroups },
      );
    } else if (exerciseIds.length > 0) {
      queryBuilder.andWhere('te.exerciseId IN (:...exerciseIds)', {
        exerciseIds,
      });
    } else if (muscleGroups.length > 0) {
      queryBuilder.andWhere('tmg.muscleGroup IN (:...muscleGroups)', {
        muscleGroups,
      });
    }

    const tutorials = await queryBuilder
      .orderBy('tutorial.createdAt', 'DESC')
      .take(limit)
      .getMany();

    const tutorialList: TutorialListItemDto[] = tutorials.map((t) => {
      const primaryMedia = t.tutorialMedia?.find((m) => m.isPrimary);
      return {
        id: t.id,
        title: t.title,
        summary: t.summary,
        type: t.type,
        difficulty: t.difficulty,
        tags: t.tags,
        thumbnailUrl: primaryMedia?.thumbnailUrl || null,
        hasVideo: t.tutorialMedia && t.tutorialMedia.length > 0,
        videoDuration: primaryMedia?.duration || null,
        exerciseIds: t.tutorialExercises?.map((te) => te.exerciseId) || [],
        exerciseNames:
          t.tutorialExercises?.map((te) => te.exercise?.name).filter(Boolean) ||
          [],
        muscleGroups:
          t.tutorialMuscleGroups?.map((tmg) => tmg.muscleGroup) || [],
      };
    });

    // Cache for 2 hours
    await this.redisService.set(cacheKey, tutorialList, 7200);

    return tutorialList;
  }
}
