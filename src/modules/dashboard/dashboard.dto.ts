// DTOs for dashboard responses (no input validation needed - read-only endpoint)

export interface TrainingSummaryDto {
  recentActivity: {
    last7Days: number;
    last30Days: number;
    currentWeek: number;
  };
  weeklyCompletion: {
    currentWeek: {
      completed: number;
      planned: number;
      rate: number;
    };
    lastWeek: {
      completed: number;
      planned: number;
      rate: number;
    };
  };
  lastSessions: Array<{
    id: string;
    date: string;
    duration: number | null;
    exerciseCount: number;
    totalVolume: number;
    status: string;
  }>;
}

export interface MuscleBalanceDto {
  period: string;
  distribution: Record<
    string,
    {
      volume: number;
      sessions: number;
      percentage: number;
    }
  >;
  balance: {
    mostTrained: string;
    leastTrained: string;
    imbalanceScore: number;
    recommendations: string[];
  };
}

export interface StrengthTrendDto {
  exerciseId: string;
  exerciseName: string;
  period: string;
  oneRM: {
    current: number;
    previous: number;
    change: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    dataPoints: Array<{
      date: string;
      estimated1rm: number;
    }>;
  };
  volume: {
    current: number;
    previous: number;
    change: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface ConsistencyDto {
  period: string;
  consistency: {
    averageSessionsPerWeek: number;
    consistencyScore: number;
    weeks: Array<{
      week: string;
      sessions: number;
      volume: number;
    }>;
  };
  fatigue: {
    riskLevel: 'low' | 'medium' | 'high';
    indicators: {
      decliningPerformance: boolean;
      highRpeTrend: boolean;
      insufficientRest: boolean;
    };
    recommendations: string[];
  };
}

export interface AdherenceDto {
  programId: string;
  programName: string;
  period: string;
  adherence: {
    scheduledSessions: number;
    completedSessions: number;
    completionRate: number;
    sessions: Array<{
      scheduledDate: string;
      actualDate: string | null;
      status: 'completed' | 'missed' | 'pending';
      exercises: {
        planned: number;
        completed: number;
        substituted: number;
      };
    }>;
  };
  exercises: {
    totalPlanned: number;
    totalCompleted: number;
    completionRate: number;
    substitutions: number;
  };
}

export interface InsightDto {
  type: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  actionable: boolean;
  data?: Record<string, any>;
}

export interface DashboardDto {
  summary: TrainingSummaryDto;
  muscleBalance: MuscleBalanceDto;
  trends: StrengthTrendDto[];
  consistency: ConsistencyDto;
  adherence: AdherenceDto[];
  insights: InsightDto[];
  cached: boolean;
  cacheExpiresAt?: string;
}
