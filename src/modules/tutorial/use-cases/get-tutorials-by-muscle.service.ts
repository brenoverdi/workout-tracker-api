import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorial } from '../model';
import { MuscleGroup } from '../../exercise/model';
import { ElasticsearchService } from '../../../services/elasticsearch.service';
import { RedisService } from '../../../services/redis.service';
import { TutorialListItemDto } from '../tutorial.dto';

@Injectable()
export class GetTutorialsByMuscleService {
  constructor(
    @InjectRepository(Tutorial)
    private tutorialRepository: Repository<Tutorial>,
    private elasticsearchService: ElasticsearchService,
    private redisService: RedisService,
  ) {}

  async execute(
    muscleGroup: MuscleGroup,
    type?: string,
  ): Promise<TutorialListItemDto[]> {
    const cacheKey = type
      ? `tutorials:muscle:${muscleGroup}:type:${type}`
      : `tutorials:muscle:${muscleGroup}`;

    // Try cache first
    const cached = await this.redisService.get<TutorialListItemDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Try Elasticsearch first
      return await this.searchWithElasticsearch(muscleGroup, type, cacheKey);
    } catch (error) {
      console.warn(
        'Elasticsearch search failed, falling back to PostgreSQL:',
        error.message,
      );
      // Fallback to PostgreSQL
      return await this.searchWithPostgreSQL(muscleGroup, type, cacheKey);
    }
  }

  private async searchWithElasticsearch(
    muscleGroup: MuscleGroup,
    type: string | undefined,
    cacheKey: string,
  ): Promise<TutorialListItemDto[]> {
    const query: any = {
      query: {
        bool: {
          must: [{ term: { muscleGroups: muscleGroup } }],
        },
      },
      sort: [{ createdAt: { order: 'desc' } }],
      size: 100,
    };

    if (type) {
      query.query.bool.filter = [{ term: { type } }];
    }

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

  private async searchWithPostgreSQL(
    muscleGroup: MuscleGroup,
    type: string | undefined,
    cacheKey: string,
  ): Promise<TutorialListItemDto[]> {
    const queryBuilder = this.tutorialRepository
      .createQueryBuilder('tutorial')
      .innerJoin(
        'tutorial.tutorialMuscleGroups',
        'tmg',
        'tmg.muscleGroup = :muscleGroup',
        {
          muscleGroup,
        },
      )
      .leftJoinAndSelect('tutorial.tutorialExercises', 'te')
      .leftJoinAndSelect('te.exercise', 'exercise')
      .leftJoinAndSelect('tutorial.tutorialMuscleGroups', 'tmg2')
      .leftJoinAndSelect('tutorial.tutorialMedia', 'tm')
      .where('tutorial.isPublished = :isPublished', { isPublished: true });

    if (type) {
      queryBuilder.andWhere('tutorial.type = :type', { type });
    }

    const tutorials = await queryBuilder
      .orderBy('tutorial.createdAt', 'DESC')
      .getMany();

    const tutorialList: TutorialListItemDto[] = tutorials.map((tutorial) => {
      const primaryMedia = tutorial.tutorialMedia?.find((m) => m.isPrimary);
      return {
        id: tutorial.id,
        title: tutorial.title,
        summary: tutorial.summary,
        type: tutorial.type,
        difficulty: tutorial.difficulty,
        tags: tutorial.tags,
        thumbnailUrl: primaryMedia?.thumbnailUrl || null,
        hasVideo: tutorial.tutorialMedia && tutorial.tutorialMedia.length > 0,
        videoDuration: primaryMedia?.duration || null,
        exerciseIds:
          tutorial.tutorialExercises?.map((te) => te.exerciseId) || [],
        exerciseNames:
          tutorial.tutorialExercises
            ?.map((te) => te.exercise?.name)
            .filter(Boolean) || [],
        muscleGroups:
          tutorial.tutorialMuscleGroups?.map((tmg) => tmg.muscleGroup) || [],
      };
    });

    // Cache for 2 hours
    await this.redisService.set(cacheKey, tutorialList, 7200);

    return tutorialList;
  }
}
