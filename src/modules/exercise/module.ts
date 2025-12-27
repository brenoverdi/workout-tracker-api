import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './model';
import { ExerciseController } from './controller';
import { CreateExerciseService } from './use-cases/create-exercise.service';
import { FindExercisesService } from './use-cases/find-exercises.service';
import { UpdateExerciseService } from './use-cases/update-exercise.service';
import { DeleteExerciseService } from './use-cases/delete-exercise.service';
import { RedisService } from '../../services/redis.service';
import { SearchModule } from '../search/module';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise]), SearchModule],
  controllers: [ExerciseController],
  providers: [
    CreateExerciseService,
    FindExercisesService,
    UpdateExerciseService,
    DeleteExerciseService,
    RedisService,
  ],
  exports: [FindExercisesService],
})
export class ExerciseModule {}
