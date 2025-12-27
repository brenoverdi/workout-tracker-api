import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSession, SessionExercise, SessionSet } from '../session/model';
import { Exercise } from '../exercise/model';
import { Program, ProgramExercise, UserProgram } from '../program/model';
import { DashboardController } from './controller';
import { GetDashboardService } from './use-cases/get-dashboard.service';
import { RedisService } from '../../services/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutSession,
      SessionExercise,
      SessionSet,
      Exercise,
      Program,
      ProgramExercise,
      UserProgram,
    ]),
  ],
  controllers: [DashboardController],
  providers: [GetDashboardService, RedisService],
  exports: [],
})
export class DashboardModule {}
