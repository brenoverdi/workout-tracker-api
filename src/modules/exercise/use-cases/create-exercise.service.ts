import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../model';
import { CreateExerciseDto } from '../exercise.dto';
import { RedisService } from '../../../services/redis.service';

@Injectable()
export class CreateExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private redisService: RedisService,
  ) {}

  async execute(dto: CreateExerciseDto): Promise<Exercise> {
    const exercise = this.exerciseRepository.create(dto);
    const savedExercise = await this.exerciseRepository.save(exercise);

    // Invalidate exercise caches
    await this.invalidateCaches();

    return savedExercise;
  }

  private async invalidateCaches(): Promise<void> {
    // Delete all exercise-related caches
    await this.redisService.delete('exercises:all');
    // Delete all list query caches (they use pattern: exercises:list:*)
    await this.redisService.deletePattern('exercises:list:*');
  }
}
