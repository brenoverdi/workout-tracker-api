import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSession, SessionExercise, SessionSet } from '../session/model';
import { AnalyticsController } from './controller';
import { GetProgressService } from './use-cases/get-progress.service';
import { GetMuscleDistributionService } from './use-cases/get-muscle-distribution.service';
import { GetWorkoutStatsService } from './use-cases/get-workout-stats.service';
import { RedisService } from '../../services/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutSession, SessionExercise, SessionSet]),
  ],
  controllers: [AnalyticsController],
  providers: [
    GetProgressService,
    GetMuscleDistributionService,
    GetWorkoutStatsService,
    RedisService,
  ],
  exports: [],
})
export class AnalyticsModule {}
