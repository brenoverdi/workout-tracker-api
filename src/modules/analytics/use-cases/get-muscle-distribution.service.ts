import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionExercise } from '../../session/model';
import { MuscleGroup } from '../../exercise/model';
import { RedisService } from '../../../services/redis.service';

export interface MuscleDistribution {
  muscleGroup: MuscleGroup;
  totalSets: number;
  totalVolume: number;
  percentage: number;
}

@Injectable()
export class GetMuscleDistributionService {
  constructor(
    @InjectRepository(SessionExercise)
    private sessionExerciseRepository: Repository<SessionExercise>,
    private redisService: RedisService,
  ) {}

  async execute(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<MuscleDistribution[]> {
    const cacheKey = `analytics:muscle:${userId}:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'now'}`;

    const cached = await this.redisService.get<MuscleDistribution[]>(cacheKey);
    if (cached) {
      return cached;
    }

    let dateFilter = '';
    const params: any[] = [userId];

    if (startDate && endDate) {
      dateFilter = 'AND ws."session_date" BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND ws."session_date" >= $2';
      params.push(startDate);
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = 'AND ws."session_date" >= $2';
      params.push(thirtyDaysAgo);
    }

    const query = `
      SELECT 
        e."muscle_groups" as "muscleGroup",
        COUNT(DISTINCT sl.id) as "totalSets",
        COALESCE(SUM(sl.weight * sl.reps), 0) as "totalVolume"
      FROM sessions_exercises se
      JOIN sessions ws ON se."session_id" = ws.id
      JOIN exercises e ON se."exercise_id" = e.id
      LEFT JOIN session_sets sl ON sl."session_exercise_id" = se.id AND sl.completed = true
      WHERE ws."user_id" = $1 ${dateFilter}
      GROUP BY e."muscle_groups"
      ORDER BY "totalSets" DESC
    `;

    const results = await this.sessionExerciseRepository.query(query, params);

    const totalSets = results.reduce(
      (sum: number, r: any) => sum + parseInt(r.totalSets || 0),
      0,
    );

    const distribution: MuscleDistribution[] = results.map((r: any) => ({
      muscleGroup: r.muscleGroup,
      totalSets: parseInt(r.totalSets || 0),
      totalVolume: Math.round(parseFloat(r.totalVolume || 0)),
      percentage:
        totalSets > 0
          ? Math.round((parseInt(r.totalSets || 0) / totalSets) * 100)
          : 0,
    }));

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, distribution, 300);

    return distribution;
  }
}
