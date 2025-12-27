import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../model';
import { UpdateExerciseDto } from '../exercise.dto';
import { RedisService } from '../../../services/redis.service';
import { IndexExerciseService } from '../../search/use-cases/index-exercise.service';

@Injectable()
export class UpdateExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private redisService: RedisService,
    private indexExerciseService: IndexExerciseService,
  ) {}

  async execute(id: string, dto: UpdateExerciseDto): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    Object.assign(exercise, dto);
    const savedExercise = await this.exerciseRepository.save(exercise);

    // Invalidate caches for this exercise
    await this.invalidateCaches(id);

    // Update in Elasticsearch (non-blocking)
    try {
      await this.indexExerciseService.updateExercise(savedExercise);
    } catch (error) {
      console.warn(
        'Failed to update exercise in Elasticsearch:',
        error.message,
      );
    }

    return savedExercise;
  }

  private async invalidateCaches(exerciseId: string): Promise<void> {
    // Delete specific exercise cache
    await this.redisService.delete(`exercises:detail:${exerciseId}`);
    // Delete all exercises list cache
    await this.redisService.delete('exercises:all');
    // Delete all list query caches (they use pattern: exercises:list:*)
    await this.redisService.deletePattern('exercises:list:*');
  }
}
