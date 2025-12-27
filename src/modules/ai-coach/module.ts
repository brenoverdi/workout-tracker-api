import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSession, SessionExercise, SessionSet } from '../session/model';
import { User } from '../user/model';
import { Program, ProgramExercise, UserProgram } from '../program/model';
import { Exercise } from '../exercise/model';
import { AiCoachController } from './controller';
import { GenerateWorkoutService } from './use-cases/generate-workout.service';
import { AnalyzeProgressService } from './use-cases/analyze-progress.service';
import { ChatService } from './use-cases/chat.service';
import { GroqService } from '../../services/groq.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutSession,
      SessionExercise,
      SessionSet,
      User,
      Program,
      ProgramExercise,
      UserProgram,
      Exercise,
    ]),
  ],
  controllers: [AiCoachController],
  providers: [
    GenerateWorkoutService,
    AnalyzeProgressService,
    ChatService,
    GroqService,
  ],
  exports: [],
})
export class AiCoachModule {}
