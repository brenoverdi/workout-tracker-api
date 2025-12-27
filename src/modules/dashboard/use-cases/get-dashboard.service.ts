import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  IsNull,
  Not,
} from 'typeorm';
import {
  WorkoutSession,
  SessionExercise,
  SessionSet,
} from '../../session/model';
import { Exercise, MuscleGroup } from '../../exercise/model';
import { Program, ProgramExercise, UserProgram } from '../../program/model';
import { RedisService } from '../../../services/redis.service';
import {
  DashboardDto,
  TrainingSummaryDto,
  MuscleBalanceDto,
  StrengthTrendDto,
  ConsistencyDto,
  AdherenceDto,
  InsightDto,
} from '../dashboard.dto';

@Injectable()
export class GetDashboardService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
    @InjectRepository(SessionExercise)
    private sessionExerciseRepository: Repository<SessionExercise>,
    @InjectRepository(SessionSet)
    private sessionSetRepository: Repository<SessionSet>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(UserProgram)
    private userProgramRepository: Repository<UserProgram>,
    @InjectRepository(ProgramExercise)
    private programExerciseRepository: Repository<ProgramExercise>,
    private redisService: RedisService,
  ) {}

  async execute(userId: string): Promise<DashboardDto> {
    const cacheKey = `dashboard:summary:user:${userId}`;

    // Try to get from cache
    const cached = await this.redisService.get<DashboardDto>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Compute all dashboard features
    const [summary, muscleBalance, trends, consistency, adherence, insights] =
      await Promise.all([
        this.getTrainingSummary(userId),
        this.getMuscleBalance(userId),
        this.getStrengthTrends(userId),
        this.getConsistency(userId),
        this.getAdherence(userId),
        this.getInsights(userId),
      ]);

    const dashboard: DashboardDto = {
      summary,
      muscleBalance,
      trends,
      consistency,
      adherence,
      insights,
      cached: false,
    };

    // Cache for 1 hour
    await this.redisService.set(cacheKey, dashboard, 3600);

    return dashboard;
  }

  private async getTrainingSummary(
    userId: string,
  ): Promise<TrainingSummaryDto> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get start of current week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get start of last week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(startOfWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

    // Count sessions (consider sessions with duration or sets as completed)
    const [last7Days, last30Days, currentWeek, lastWeek] = await Promise.all([
      this.sessionRepository.count({
        where: {
          userId,
          sessionDate: MoreThanOrEqual(sevenDaysAgo),
          duration: Not(IsNull()),
        },
      }),
      this.sessionRepository.count({
        where: {
          userId,
          sessionDate: MoreThanOrEqual(thirtyDaysAgo),
          duration: Not(IsNull()),
        },
      }),
      this.sessionRepository.count({
        where: {
          userId,
          sessionDate: MoreThanOrEqual(startOfWeek),
          duration: Not(IsNull()),
        },
      }),
      this.sessionRepository.count({
        where: {
          userId,
          sessionDate: Between(startOfLastWeek, endOfLastWeek),
          duration: Not(IsNull()),
        },
      }),
    ]);

    // Get last 5 sessions with details (sessions with duration or sets)
    const lastSessions = await this.sessionRepository.find({
      where: { userId, duration: Not(IsNull()) },
      order: { sessionDate: 'DESC' },
      take: 5,
      relations: ['sessionExercises', 'sessionExercises.sessionSets'],
    });

    const lastSessionsData = await Promise.all(
      lastSessions.map(async (session) => {
        const exerciseCount = session.sessionExercises?.length || 0;
        let totalVolume = 0;

        for (const se of session.sessionExercises || []) {
          for (const set of se.sessionSets || []) {
            if (set.completed) {
              totalVolume += Number(set.weight) * set.reps;
            }
          }
        }

        return {
          id: session.id,
          date: session.sessionDate.toISOString(),
          duration: session.duration,
          exerciseCount,
          totalVolume: Math.round(totalVolume),
          status: session.duration ? 'completed' : 'in_progress',
        };
      }),
    );

    // Estimate planned sessions (simplified - could be improved with program schedule)
    const activePrograms = await this.userProgramRepository.count({
      where: { userId, isActive: true },
    });
    const estimatedPlanned = activePrograms > 0 ? 4 : 0; // Assume 4 sessions per week if on a program

    return {
      recentActivity: {
        last7Days,
        last30Days,
        currentWeek,
      },
      weeklyCompletion: {
        currentWeek: {
          completed: currentWeek,
          planned: estimatedPlanned,
          rate: estimatedPlanned > 0 ? currentWeek / estimatedPlanned : 0,
        },
        lastWeek: {
          completed: lastWeek,
          planned: estimatedPlanned,
          rate: estimatedPlanned > 0 ? lastWeek / estimatedPlanned : 0,
        },
      },
      lastSessions: lastSessionsData,
    };
  }

  private async getMuscleBalance(userId: string): Promise<MuscleBalanceDto> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const query = `
      SELECT 
        e."muscle_groups" as "muscleGroup",
        COUNT(DISTINCT ws.id) as "sessions",
        COALESCE(SUM(sl.weight * sl.reps), 0) as "volume"
      FROM sessions_exercises se
      JOIN sessions ws ON se."session_id" = ws.id
      JOIN exercises e ON se."exercise_id" = e.id
      LEFT JOIN session_sets sl ON sl."session_exercise_id" = se.id AND sl.completed = true
      WHERE ws."user_id" = $1 
        AND ws."session_date" >= $2
        AND ws.duration IS NOT NULL
      GROUP BY e."muscle_groups"
      ORDER BY "volume" DESC
    `;

    const results = await this.sessionExerciseRepository.query(query, [
      userId,
      thirtyDaysAgo,
    ]);

    const totalVolume = results.reduce(
      (sum: number, r: any) => sum + parseFloat(r.volume || 0),
      0,
    );
    const distribution: Record<string, any> = {};
    let mostTrained = '';
    let leastTrained = '';
    let maxVolume = 0;
    let minVolume = Infinity;

    results.forEach((r: any) => {
      const volume = Math.round(parseFloat(r.volume || 0));
      const percentage = totalVolume > 0 ? (volume / totalVolume) * 100 : 0;

      distribution[r.muscleGroup] = {
        volume,
        sessions: parseInt(r.sessions || 0),
        percentage: Math.round(percentage * 10) / 10,
      };

      if (volume > maxVolume) {
        maxVolume = volume;
        mostTrained = r.muscleGroup;
      }
      if (volume < minVolume && volume > 0) {
        minVolume = volume;
        leastTrained = r.muscleGroup;
      }
    });

    // Calculate imbalance score (0-1, higher = more imbalanced)
    const volumes = Object.values(distribution).map(
      (d: any) => d.volume,
    ) as number[];
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const variance =
      volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) /
      volumes.length;
    const imbalanceScore = Math.min(1, variance / (avgVolume * avgVolume + 1));

    const recommendations: string[] = [];
    if (imbalanceScore > 0.7) {
      recommendations.push('Consider balancing training across muscle groups');
    }
    if (leastTrained && distribution[leastTrained]?.percentage < 5) {
      recommendations.push(`Consider adding more ${leastTrained} training`);
    }

    return {
      period: '30d',
      distribution,
      balance: {
        mostTrained: mostTrained || 'N/A',
        leastTrained: leastTrained || 'N/A',
        imbalanceScore: Math.round(imbalanceScore * 100) / 100,
        recommendations,
      },
    };
  }

  private async getStrengthTrends(userId: string): Promise<StrengthTrendDto[]> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get top 5 most trained exercises
    const topExercisesQuery = `
      SELECT 
        e.id,
        e.name,
        COUNT(DISTINCT ws.id) as "sessionCount"
      FROM sessions_exercises se
      JOIN sessions ws ON se."session_id" = ws.id
      JOIN exercises e ON se."exercise_id" = e.id
      WHERE ws."user_id" = $1 
        AND ws."session_date" >= $2
        AND ws.duration IS NOT NULL
      GROUP BY e.id, e.name
      ORDER BY "sessionCount" DESC
      LIMIT 5
    `;

    const topExercises = await this.sessionExerciseRepository.query(
      topExercisesQuery,
      [userId, ninetyDaysAgo],
    );

    const trends: StrengthTrendDto[] = [];

    for (const exercise of topExercises) {
      // Get all sets for this exercise
      const setsQuery = `
        SELECT 
          ws."session_date" as "date",
          sl.weight,
          sl.reps,
          sl.rpe
        FROM session_sets sl
        JOIN sessions_exercises se ON sl."session_exercise_id" = se.id
        JOIN sessions ws ON se."session_id" = ws.id
        WHERE ws."user_id" = $1
          AND se."exercise_id" = $2
          AND ws."session_date" >= $3
          AND ws.duration IS NOT NULL
          AND sl.completed = true
        ORDER BY ws."session_date" ASC
      `;

      const sets = await this.sessionSetRepository.query(setsQuery, [
        userId,
        exercise.id,
        ninetyDaysAgo,
      ]);

      if (sets.length === 0) continue;

      // Calculate 1RM estimates (Epley formula: weight * (1 + reps/30))
      const oneRMData = sets.map((s: any) => ({
        date: s.date,
        estimated1rm: Number(s.weight) * (1 + s.reps / 30),
      }));

      // Group by week for trend analysis
      const weeklyData: Record<string, number[]> = {};
      oneRMData.forEach((d: any) => {
        const week = new Date(d.date).toISOString().substring(0, 10);
        if (!weeklyData[week]) weeklyData[week] = [];
        weeklyData[week].push(d.estimated1rm);
      });

      const dataPoints = Object.entries(weeklyData).map(([date, values]) => ({
        date,
        estimated1rm: Math.round(
          values.reduce((a, b) => a + b, 0) / values.length,
        ),
      }));

      const current1rm =
        dataPoints.length > 0
          ? dataPoints[dataPoints.length - 1].estimated1rm
          : 0;
      const previous1rm =
        dataPoints.length > 1
          ? dataPoints[dataPoints.length - 2].estimated1rm
          : current1rm;
      const change =
        previous1rm > 0 ? ((current1rm - previous1rm) / previous1rm) * 100 : 0;

      // Calculate volume
      const currentVolume = sets
        .slice(-10)
        .reduce((sum: number, s: any) => sum + Number(s.weight) * s.reps, 0);
      const previousVolume =
        sets.length > 10
          ? sets
              .slice(-20, -10)
              .reduce(
                (sum: number, s: any) => sum + Number(s.weight) * s.reps,
                0,
              )
          : currentVolume;
      const volumeChange =
        previousVolume > 0
          ? ((currentVolume - previousVolume) / previousVolume) * 100
          : 0;

      trends.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        period: '90d',
        oneRM: {
          current: Math.round(current1rm),
          previous: Math.round(previous1rm),
          change: Math.round(change * 10) / 10,
          trend:
            change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
          dataPoints: dataPoints.slice(-8), // Last 8 weeks
        },
        volume: {
          current: Math.round(currentVolume),
          previous: Math.round(previousVolume),
          change: Math.round(volumeChange * 10) / 10,
          trend:
            volumeChange > 10
              ? 'increasing'
              : volumeChange < -10
                ? 'decreasing'
                : 'stable',
        },
      });
    }

    return trends;
  }

  private async getConsistency(userId: string): Promise<ConsistencyDto> {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        sessionDate: MoreThanOrEqual(fourWeeksAgo),
        duration: Not(IsNull()),
      },
      order: { sessionDate: 'ASC' },
      relations: ['sessionExercises', 'sessionExercises.sessionSets'],
    });

    // Group by week
    const weeklyData: Record<string, { sessions: number; volume: number }> = {};

    for (const session of sessions) {
      const weekStart = new Date(session.sessionDate);
      weekStart.setDate(
        session.sessionDate.getDate() - session.sessionDate.getDay() + 1,
      );
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().substring(0, 10);

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { sessions: 0, volume: 0 };
      }

      weeklyData[weekKey].sessions += 1;

      // Calculate volume
      let volume = 0;
      for (const se of session.sessionExercises || []) {
        for (const set of se.sessionSets || []) {
          if (set.completed) {
            volume += Number(set.weight) * set.reps;
          }
        }
      }
      weeklyData[weekKey].volume += volume;
    }

    const weeks = Object.entries(weeklyData).map(([week, data]) => ({
      week,
      sessions: data.sessions,
      volume: Math.round(data.volume),
    }));

    const totalSessions = weeks.reduce((sum, w) => sum + w.sessions, 0);
    const averageSessionsPerWeek =
      weeks.length > 0 ? totalSessions / weeks.length : 0;

    // Calculate consistency score (0-1, based on variance)
    const variance =
      weeks.length > 0
        ? weeks.reduce(
            (sum, w) => sum + Math.pow(w.sessions - averageSessionsPerWeek, 2),
            0,
          ) / weeks.length
        : 0;
    const consistencyScore = Math.max(
      0,
      1 - variance / (averageSessionsPerWeek * averageSessionsPerWeek + 1),
    );

    // Check for fatigue indicators
    const recentSessions = sessions.slice(-10);
    const recentRpe = recentSessions
      .flatMap((s) => s.sessionExercises || [])
      .flatMap((se) => se.sessionSets || [])
      .map((set) => set.rpe)
      .filter((rpe): rpe is number => rpe !== null && rpe !== undefined);

    const avgRpe =
      recentRpe.length > 0
        ? recentRpe.reduce((a, b) => a + Number(b), 0) / recentRpe.length
        : 0;

    const highRpeTrend = avgRpe > 8;
    const decliningPerformance =
      weeks.length >= 2 &&
      weeks[weeks.length - 1].volume < weeks[weeks.length - 2].volume * 0.8;

    // Check rest days
    const restGaps: number[] = [];
    for (let i = 1; i < sessions.length; i++) {
      const daysBetween =
        (sessions[i].sessionDate.getTime() -
          sessions[i - 1].sessionDate.getTime()) /
        (1000 * 60 * 60 * 24);
      restGaps.push(daysBetween);
    }
    const avgRestDays =
      restGaps.length > 0
        ? restGaps.reduce((a, b) => a + b, 0) / restGaps.length
        : 0;
    const insufficientRest = avgRestDays < 1;

    const riskLevel =
      highRpeTrend && insufficientRest
        ? 'high'
        : highRpeTrend || insufficientRest
          ? 'medium'
          : 'low';

    const recommendations: string[] = [];
    if (highRpeTrend) {
      recommendations.push(
        'Consider reducing training intensity - RPE trending high',
      );
    }
    if (insufficientRest) {
      recommendations.push('Ensure adequate rest between sessions');
    }
    if (decliningPerformance) {
      recommendations.push('Performance declining - consider deload week');
    }

    return {
      period: '4w',
      consistency: {
        averageSessionsPerWeek: Math.round(averageSessionsPerWeek * 10) / 10,
        consistencyScore: Math.round(consistencyScore * 100) / 100,
        weeks,
      },
      fatigue: {
        riskLevel,
        indicators: {
          decliningPerformance,
          highRpeTrend,
          insufficientRest,
        },
        recommendations,
      },
    };
  }

  private async getAdherence(userId: string): Promise<AdherenceDto[]> {
    const activePrograms = await this.userProgramRepository.find({
      where: { userId, isActive: true },
      relations: ['program', 'program.programExercises'],
    });

    if (activePrograms.length === 0) {
      return [];
    }

    const adherenceData: AdherenceDto[] = [];

    for (const userProgram of activePrograms) {
      const program = userProgram.program;
      const programExercises = program.programExercises || [];

      // Get current week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      // Estimate scheduled sessions (simplified - assumes program schedule)
      const scheduleDays = programExercises
        .map((pe) => pe.daysOfTheWeek)
        .filter((d, i, arr) => arr.indexOf(d) === i);

      const scheduledSessions = scheduleDays.length;

      // Get actual sessions for this program in current week
      const actualSessions = await this.sessionRepository.find({
        where: {
          userId,
          programId: program.id,
          sessionDate: MoreThanOrEqual(startOfWeek),
          duration: Not(IsNull()),
        },
        relations: ['sessionExercises'],
      });

      const completedSessions = actualSessions.length;

      // Calculate exercise completion
      let totalPlanned = 0;
      let totalCompleted = 0;
      let substitutions = 0;

      for (const session of actualSessions) {
        const sessionExercises = session.sessionExercises || [];
        const plannedExerciseIds = programExercises.map((pe) => pe.exerciseId);

        totalPlanned += programExercises.length;
        totalCompleted += sessionExercises.filter((se) =>
          plannedExerciseIds.includes(se.exerciseId),
        ).length;
        substitutions += sessionExercises.filter(
          (se) => !plannedExerciseIds.includes(se.exerciseId),
        ).length;
      }

      adherenceData.push({
        programId: program.id,
        programName: program.name,
        period: 'current_week',
        adherence: {
          scheduledSessions,
          completedSessions,
          completionRate:
            scheduledSessions > 0 ? completedSessions / scheduledSessions : 0,
          sessions: actualSessions.map((s) => ({
            scheduledDate: s.sessionDate.toISOString(),
            actualDate: s.sessionDate.toISOString(),
            status: 'completed' as const,
            exercises: {
              planned: programExercises.length,
              completed: s.sessionExercises?.length || 0,
              substituted: 0,
            },
          })),
        },
        exercises: {
          totalPlanned: totalPlanned || programExercises.length,
          totalCompleted,
          completionRate: totalPlanned > 0 ? totalCompleted / totalPlanned : 0,
          substitutions,
        },
      });
    }

    return adherenceData;
  }

  private async getInsights(userId: string): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    // Get muscle balance data
    const muscleBalance = await this.getMuscleBalance(userId);
    const leastTrained = muscleBalance.balance.leastTrained;
    
    if (leastTrained && leastTrained !== 'N/A') {
      const daysSinceLastTraining =
        await this.getDaysSinceLastMuscleGroupTraining(
          userId,
          leastTrained as MuscleGroup,
        );

      if (daysSinceLastTraining > 7) {
        insights.push({
          type: 'muscle_imbalance',
          priority: 'high',
          message: `You haven't trained ${leastTrained} in ${daysSinceLastTraining} days. Consider adding a ${leastTrained} session.`,
          actionable: true,
          data: {
            muscleGroup: leastTrained,
            daysSinceLastTraining,
          },
        });
      }
    }

    // Get strength trends
    const trends = await this.getStrengthTrends(userId);
    for (const trend of trends.slice(0, 2)) {
      if (trend.oneRM.change > 5) {
        insights.push({
          type: 'strength_progression',
          priority: 'medium',
          message: `Your ${trend.exerciseName} 1RM increased ${trend.oneRM.change.toFixed(1)}% this period. Great progress!`,
          actionable: false,
          data: {
            exerciseId: trend.exerciseId,
            improvement: trend.oneRM.change,
          },
        });
      }
    }

    // Get consistency
    const consistency = await this.getConsistency(userId);
    if (consistency.consistency.consistencyScore > 0.8) {
      insights.push({
        type: 'consistency',
        priority: 'low',
        message: `You've maintained ${consistency.consistency.averageSessionsPerWeek.toFixed(1)} sessions per week consistently. Excellent work!`,
        actionable: false,
      });
    }

    // Fatigue warning
    if (consistency.fatigue.riskLevel === 'high') {
      insights.push({
        type: 'fatigue_warning',
        priority: 'high',
        message:
          'High fatigue risk detected. Consider reducing training intensity or taking a rest day.',
        actionable: true,
        data: {
          indicators: consistency.fatigue.indicators,
        },
      });
    }

    return insights;
  }

  private async getDaysSinceLastMuscleGroupTraining(
    userId: string,
    muscleGroup: MuscleGroup,
  ): Promise<number> {
    const query = `
      SELECT MAX(ws."session_date") as "lastDate"
      FROM sessions_exercises se
      JOIN sessions ws ON se."session_id" = ws.id
      JOIN exercises e ON se."exercise_id" = e.id
      WHERE ws."user_id" = $1 
        AND e."muscle_groups" = $2
        AND ws.duration IS NOT NULL
    `;

    const result = await this.sessionExerciseRepository.query(query, [
      userId,
      muscleGroup,
    ]);

    if (!result[0]?.lastDate) {
      return 999; // Never trained
    }

    const lastDate = new Date(result[0].lastDate);
    const now = new Date();
    const diffTime = now.getTime() - lastDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}
