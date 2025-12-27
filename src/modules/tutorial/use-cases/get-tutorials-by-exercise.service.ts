import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorial } from '../model';
import { RedisService } from '../../../services/redis.service';
import { TutorialListItemDto } from '../tutorial.dto';

@Injectable()
export class GetTutorialsByExerciseService {
  constructor(
    @InjectRepository(Tutorial)
    private tutorialRepository: Repository<Tutorial>,
    private redisService: RedisService,
  ) {}

  async execute(exerciseId: string): Promise<TutorialListItemDto[]> {
    const cacheKey = `tutorials:exercise:${exerciseId}`;

    // Try cache first
    const cached = await this.redisService.get<TutorialListItemDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query PostgreSQL
    const tutorials = await this.tutorialRepository
      .createQueryBuilder('tutorial')
      .innerJoin(
        'tutorial.tutorialExercises',
        'te',
        'te.exerciseId = :exerciseId',
        { exerciseId },
      )
      .leftJoinAndSelect('tutorial.tutorialExercises', 'te2')
      .leftJoinAndSelect('te2.exercise', 'exercise')
      .leftJoinAndSelect('tutorial.tutorialMuscleGroups', 'tmg')
      .leftJoinAndSelect('tutorial.tutorialMedia', 'tm')
      .where('tutorial.isPublished = :isPublished', { isPublished: true })
      .orderBy('tutorial.priority', 'DESC')
      .addOrderBy('tutorial.createdAt', 'DESC')
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

    // Cache for 1 hour
    await this.redisService.set(cacheKey, tutorialList, 3600);

    return tutorialList;
  }
}
