import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Exercise } from '../model';
import { FindExercisesDto } from '../exercise.dto';
import { RedisService } from '../../../services/redis.service';

@Injectable()
export class FindExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private redisService: RedisService,
  ) {}

  async execute(
    dto: FindExercisesDto,
  ): Promise<{ exercises: Exercise[]; total: number }> {
    const {
      search,
      muscleGroups,
      equipmentType,
      difficultyLevel,
      page = 1,
      limit = 20,
    } = dto;

    // Create cache key from query parameters
    const cacheKey = `exercises:list:${JSON.stringify({ search, muscleGroups, equipmentType, difficultyLevel, page, limit })}`;

    // Try cache first
    const cached = await this.redisService.get<{
      exercises: Exercise[];
      total: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: FindOptionsWhere<Exercise> = {};

    if (muscleGroups) {
      where.muscleGroups = muscleGroups;
    }

    if (equipmentType) {
      where.equipmentType = equipmentType;
    }

    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [exercises, total] = await this.exerciseRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    const result = { exercises, total };

    // Cache for 1 hour (exercises are relatively static)
    await this.redisService.set(cacheKey, result, 3600);

    return result;
  }

  async findById(id: string): Promise<Exercise | null> {
    const cacheKey = `exercises:detail:${id}`;

    // Try cache first
    const cached = await this.redisService.get<Exercise>(cacheKey);
    if (cached) {
      return cached;
    }

    const exercise = await this.exerciseRepository.findOne({
      where: { id },
    });

    if (exercise) {
      // Cache for 2 hours (individual exercises are very static)
      await this.redisService.set(cacheKey, exercise, 7200);
    }

    return exercise;
  }

  async findAll(): Promise<Exercise[]> {
    const cacheKey = 'exercises:all';

    // Try cache first
    const cached = await this.redisService.get<Exercise[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const exercises = await this.exerciseRepository.find({
      order: { name: 'ASC' },
    });

    // Cache for 2 hours (full list is very static)
    await this.redisService.set(cacheKey, exercises, 7200);

    return exercises;
  }

  // Helper method to invalidate exercise caches
  async invalidateCache(exerciseId?: string): Promise<void> {
    // Invalidate all list caches (pattern matching would be better, but this works)
    const patterns = ['exercises:list:*', 'exercises:all'];

    if (exerciseId) {
      patterns.push(`exercises:detail:${exerciseId}`);
    }

    // Note: Redis pattern deletion would require a different approach
    // For now, we'll let TTL handle expiration, or implement a more sophisticated invalidation
    // In production, consider using Redis keys command with pattern matching
  }
}
