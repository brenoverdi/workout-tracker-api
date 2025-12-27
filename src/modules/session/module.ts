import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSession, SessionExercise, SessionSet } from './model';
import { Exercise } from '../exercise/model';
import { SessionController } from './controller';
import { StartSessionService } from './use-cases/start-session.service';
import { LogExerciseService } from './use-cases/log-exercise.service';
import { CompleteSessionService } from './use-cases/complete-session.service';
import { GetSessionHistoryService } from './use-cases/get-session-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutSession,
      SessionExercise,
      SessionSet,
      Exercise,
    ]),
  ],
  controllers: [SessionController],
  providers: [
    StartSessionService,
    LogExerciseService,
    CompleteSessionService,
    GetSessionHistoryService,
  ],
  exports: [GetSessionHistoryService],
})
export class SessionModule {}
