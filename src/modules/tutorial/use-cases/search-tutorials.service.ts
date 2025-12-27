import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Tutorial, TutorialType, TutorialDifficulty } from '../model';
import { Exercise } from '../../exercise/model';
import { MuscleGroup } from '../../exercise/model';
import { ElasticsearchService } from '../../../services/elasticsearch.service';
import { SearchTutorialsDto, TutorialListItemDto } from '../tutorial.dto';

@Injectable()
export class SearchTutorialsService {
  constructor(
    @InjectRepository(Tutorial)
    private tutorialRepository: Repository<Tutorial>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async execute(
    dto: SearchTutorialsDto,
  ): Promise<{ tutorials: TutorialListItemDto[]; total: number }> {
    try {
      // Try Elasticsearch first
      return await this.searchWithElasticsearch(dto);
    } catch (error) {
      console.warn(
        'Elasticsearch search failed, falling back to PostgreSQL:',
        error.message,
      );
      // Fallback to PostgreSQL
      return await this.searchWithPostgreSQL(dto);
    }
  }

  private async searchWithElasticsearch(dto: SearchTutorialsDto): Promise<{
    tutorials: TutorialListItemDto[];
    total: number;
  }> {
    const {
      q,
      type,
      difficulty,
      exerciseId,
      muscleGroup,
      hasVideo,
      page = 1,
      limit = 20,
    } = dto;

    const must: any[] = [];
    const filter: any[] = [];

    // Full-text search
    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['title^2', 'summary', 'content'],
          fuzziness: 'AUTO',
        },
      });
    }

    // Filters
    if (type) {
      filter.push({ term: { type } });
    }

    if (difficulty) {
      filter.push({ term: { difficulty } });
    }

    if (exerciseId) {
      filter.push({ term: { exerciseIds: exerciseId } });
    }

    if (muscleGroup) {
      filter.push({ term: { muscleGroups: muscleGroup } });
    }

    if (hasVideo !== undefined) {
      filter.push({ term: { hasVideo } });
    }

    const query: any = {
      query: {
        bool: {
          ...(must.length > 0 && { must }),
          ...(filter.length > 0 && { filter }),
        },
      },
      sort: [{ _score: { order: 'desc' } }, { createdAt: { order: 'desc' } }],
      from: (page - 1) * limit,
      size: limit,
    };

    // Note: ElasticsearchService.search doesn't return total count, so we'll use getClient for now
    // In production, you might want to add a searchWithTotal method to ElasticsearchService
    const client = this.elasticsearchService.getClient();
    const results = await client.search({
      index: 'tutorials',
      body: query,
    });

    const hits = (results as any).body?.hits ||
      (results as any).hits || { hits: [], total: { value: 0 } };
    const total =
      typeof hits.total === 'number' ? hits.total : hits.total?.value || 0;

    const tutorials: TutorialListItemDto[] = hits.hits.map((hit: any) => ({
      id: hit._id || hit.id,
      title: hit._source?.title || hit.title,
      summary: hit._source?.summary || hit.summary,
      type: hit._source?.type || hit.type,
      difficulty: hit._source?.difficulty || hit.difficulty,
      tags: hit._source?.tags || hit.tags || [],
      thumbnailUrl: hit._source?.thumbnailUrl || hit.thumbnailUrl,
      hasVideo: hit._source?.hasVideo || hit.hasVideo || false,
      videoDuration: hit._source?.videoDuration || hit.videoDuration,
      videoUrl: hit._source?.videoUrl || hit.videoUrl || null,
      exerciseIds: hit._source?.exerciseIds || hit.exerciseIds || [],
      exerciseNames: hit._source?.exerciseNames || hit.exerciseNames || [],
      muscleGroups: hit._source?.muscleGroups || hit.muscleGroups || [],
    }));

    return {
      tutorials,
      total,
    };
  }

  private async searchWithPostgreSQL(dto: SearchTutorialsDto): Promise<{
    tutorials: TutorialListItemDto[];
    total: number;
  }> {
    const {
      q,
      type,
      difficulty,
      exerciseId,
      muscleGroup,
      hasVideo,
      page = 1,
      limit = 20,
    } = dto;

    const queryBuilder = this.tutorialRepository
      .createQueryBuilder('tutorial')
      .leftJoinAndSelect('tutorial.tutorialExercises', 'te')
      .leftJoinAndSelect('te.exercise', 'exercise')
      .leftJoinAndSelect('tutorial.tutorialMuscleGroups', 'tmg')
      .leftJoinAndSelect('tutorial.tutorialMedia', 'tm')
      .where('tutorial.isPublished = :isPublished', { isPublished: true });

    // Text search
    if (q) {
      queryBuilder.andWhere(
        '(tutorial.title ILIKE :q OR tutorial.summary ILIKE :q OR tutorial.content ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    // Filters
    if (type) {
      queryBuilder.andWhere('tutorial.type = :type', { type });
    }

    if (difficulty) {
      queryBuilder.andWhere('tutorial.difficulty = :difficulty', {
        difficulty,
      });
    }

    if (exerciseId) {
      queryBuilder.andWhere('exercise.id = :exerciseId', { exerciseId });
    }

    if (muscleGroup) {
      queryBuilder.andWhere('tmg.muscleGroup = :muscleGroup', { muscleGroup });
    }

    if (hasVideo !== undefined) {
      if (hasVideo) {
        queryBuilder.andWhere('tm.id IS NOT NULL');
      } else {
        queryBuilder.andWhere('tm.id IS NULL');
      }
    }

    const [tutorials, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('tutorial.priority', 'DESC')
      .addOrderBy('tutorial.createdAt', 'DESC')
      .getManyAndCount();

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
        videoUrl: primaryMedia?.url || null,
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

    return {
      tutorials: tutorialList,
      total,
    };
  }
}
