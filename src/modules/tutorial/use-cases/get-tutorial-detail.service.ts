import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorial } from '../model';
import { RedisService } from '../../../services/redis.service';
import { TutorialDetailDto } from '../tutorial.dto';

@Injectable()
export class GetTutorialDetailService {
  constructor(
    @InjectRepository(Tutorial)
    private tutorialRepository: Repository<Tutorial>,
    private redisService: RedisService,
  ) {}

  async execute(tutorialId: string): Promise<TutorialDetailDto> {
    const cacheKey = `tutorials:detail:${tutorialId}`;

    // Try cache first
    const cached = await this.redisService.get<TutorialDetailDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query PostgreSQL
    const tutorial = await this.tutorialRepository.findOne({
      where: { id: tutorialId, isPublished: true },
      relations: [
        'tutorialExercises',
        'tutorialExercises.exercise',
        'tutorialMuscleGroups',
        'tutorialMedia',
      ],
    });

    if (!tutorial) {
      throw new NotFoundException('Tutorial not found');
    }

    const detail: TutorialDetailDto = {
      id: tutorial.id,
      title: tutorial.title,
      summary: tutorial.summary,
      content: tutorial.content,
      type: tutorial.type,
      difficulty: tutorial.difficulty,
      tags: tutorial.tags,
      priority: tutorial.priority,
      exercises:
        tutorial.tutorialExercises?.map((te) => ({
          id: te.exerciseId,
          name: te.exercise?.name || 'Unknown',
        })) || [],
      muscleGroups:
        tutorial.tutorialMuscleGroups?.map((tmg) => tmg.muscleGroup) || [],
      media:
        tutorial.tutorialMedia?.map((tm) => ({
          id: tm.id,
          provider: tm.provider,
          url: tm.url,
          cdnUrl: tm.cdnUrl,
          thumbnailUrl: tm.thumbnailUrl,
          duration: tm.duration,
          isPrimary: tm.isPrimary,
          transcript: tm.transcript,
        })) || [],
      createdAt: tutorial.createdAt,
      updatedAt: tutorial.updatedAt,
    };

    // Cache for 1 hour
    await this.redisService.set(cacheKey, detail, 3600);

    return detail;
  }
}
