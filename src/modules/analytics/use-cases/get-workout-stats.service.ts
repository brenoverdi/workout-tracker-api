import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { WorkoutSession } from '../../session/model';
import { RedisService } from '../../../services/redis.service';

export interface WorkoutStats {
  totalWorkouts: number;
  totalDurationMinutes: number;
  totalVolume: number;
  totalSets: number;
  averageSessionDuration: number;
  averageVolumePerSession: number;
  workoutsPerWeek: number;
  mostActiveDay: string;
  bestSession: {
    date: Date;
    volume: number;
    duration: number;
  } | null;
}

@Injectable()
export class GetWorkoutStatsService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
    private redisService: RedisService,
  ) {}

  async execute(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<WorkoutStats> {
    const cacheKey = `analytics:stats:${userId}:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'now'}`;

    const cached = await this.redisService.get<WorkoutStats>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = {
      userId,
    };

    if (startDate && endDate) {
      where.sessionDate = Between(startDate, endDate);
    } else if (startDate) {
      where.sessionDate = MoreThanOrEqual(startDate);
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.sessionDate = MoreThanOrEqual(thirtyDaysAgo);
    }

    const sessions = await this.sessionRepository.find({
      where,
      relations: ['sessionExercises', 'sessionExercises.sessionSets'],
      order: { sessionDate: 'ASC' },
    });

    if (sessions.length === 0) {
      return {
        totalWorkouts: 0,
        totalDurationMinutes: 0,
        totalVolume: 0,
        totalSets: 0,
        averageSessionDuration: 0,
        averageVolumePerSession: 0,
        workoutsPerWeek: 0,
        mostActiveDay: 'N/A',
        bestSession: null,
      };
    }

    let totalDuration = 0;
    let totalVolume = 0;
    let totalSets = 0;
    let bestSession: WorkoutSession | null = null;
    let bestSessionVolume = 0;
    const dayCount: Record<string, number> = {};
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    for (const session of sessions) {
      totalDuration += session.duration || 0;

      let sessionVolume = 0;
      let sessionSets = 0;

      if (session.sessionExercises) {
        for (const exercise of session.sessionExercises) {
          if (exercise.sessionSets) {
            for (const set of exercise.sessionSets) {
              sessionVolume += Number(set.weight || 0) * (set.reps || 0);
              sessionSets++;
            }
          }
        }
      }

      totalVolume += sessionVolume;
      totalSets += sessionSets;

      const dayName = days[session.sessionDate.getDay()];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;

      if (!bestSession || sessionVolume > bestSessionVolume) {
        bestSession = session;
        bestSessionVolume = sessionVolume;
      }
    }

    // Calculate weeks span
    const firstDate = sessions[0].sessionDate;
    const lastDate = sessions[sessions.length - 1].sessionDate;
    const weeksSpan = Math.max(
      1,
      Math.ceil(
        (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
      ),
    );

    const mostActiveDay =
      Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const stats: WorkoutStats = {
      totalWorkouts: sessions.length,
      totalDurationMinutes: totalDuration,
      totalVolume,
      totalSets,
      averageSessionDuration: Math.round(totalDuration / sessions.length),
      averageVolumePerSession: Math.round(totalVolume / sessions.length),
      workoutsPerWeek: Math.round((sessions.length / weeksSpan) * 10) / 10,
      mostActiveDay,
      bestSession: bestSession
        ? {
            date: bestSession.sessionDate,
            volume: bestSessionVolume,
            duration: bestSession.duration || 0,
          }
        : null,
    };

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, stats, 300);

    return stats;
  }
}
