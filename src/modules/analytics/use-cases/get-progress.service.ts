import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { WorkoutSession, SessionSet } from '../../session/model';
import { RedisService } from '../../../services/redis.service';

export interface ProgressData {
  period: string;
  totalVolume: number;
  totalSessions: number;
  totalSets: number;
  averageDuration: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Date;
}

@Injectable()
export class GetProgressService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
    @InjectRepository(SessionSet)
    private sessionSetRepository: Repository<SessionSet>,
    private redisService: RedisService,
  ) {}

  async execute(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    progress: ProgressData[];
    personalRecords: PersonalRecord[];
    summary: {
      totalVolume: number;
      totalSessions: number;
      totalSets: number;
      averageDuration: number;
      streak: number;
    };
  }> {
    const cacheKey = `analytics:progress:${userId}:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'now'}`;

    const cached = await this.redisService.get<any>(cacheKey);
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
      relations: [
        'sessionExercises',
        'sessionExercises.exercise',
        'sessionExercises.sessionSets',
      ],
      order: { sessionDate: 'ASC' },
    });

    // Calculate progress by week
    const progressByWeek = new Map<string, ProgressData>();
    let totalVolume = 0;
    let totalSets = 0;
    let totalDuration = 0;

    for (const session of sessions) {
      const weekKey = this.getWeekKey(session.sessionDate);

      if (!progressByWeek.has(weekKey)) {
        progressByWeek.set(weekKey, {
          period: weekKey,
          totalVolume: 0,
          totalSessions: 0,
          totalSets: 0,
          averageDuration: 0,
        });
      }

      const weekData = progressByWeek.get(weekKey)!;

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

      weekData.totalVolume += sessionVolume;
      weekData.totalSessions += 1;
      weekData.totalSets += sessionSets;
      weekData.averageDuration =
        (weekData.averageDuration * (weekData.totalSessions - 1) +
          (session.duration || 0)) /
        weekData.totalSessions;

      totalVolume += sessionVolume;
      totalSets += sessionSets;
      totalDuration += session.duration || 0;
    }

    // Find personal records
    const personalRecords = await this.findPersonalRecords(userId);

    // Calculate streak
    const streak = this.calculateStreak(sessions);

    const result = {
      progress: Array.from(progressByWeek.values()),
      personalRecords,
      summary: {
        totalVolume,
        totalSessions: sessions.length,
        totalSets,
        averageDuration:
          sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
        streak,
      },
    };

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, result, 300);

    return result;
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor(
      (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  private async findPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const query = `
      SELECT DISTINCT ON (se."exercise_id")
        se."exercise_id" as "exerciseId",
        e.name as "exerciseName",
        sl.weight,
        sl.reps,
        sl."created_at" as date
      FROM session_sets sl
      JOIN sessions_exercises se ON sl."session_exercise_id" = se.id
      JOIN sessions ws ON se."session_id" = ws.id
      JOIN exercises e ON se."exercise_id" = e.id
      WHERE ws."user_id" = $1 AND sl.completed = true
      ORDER BY se."exercise_id", sl.weight DESC, sl.reps DESC
    `;

    const result = await this.sessionSetRepository.query(query, [userId]);
    return result.slice(0, 10).map((r) => ({
      ...r,
      weight: Number(r.weight),
    }));
  }

  private calculateStreak(sessions: WorkoutSession[]): number {
    if (sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const currentDate = new Date(today);

    const sessionDates = new Set(
      sessions.map((s) => {
        const d = new Date(s.sessionDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }),
    );

    // Check from today backwards
    while (true) {
      if (sessionDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (currentDate.getTime() === today.getTime()) {
        // Today hasn't been worked out yet, check yesterday
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}
