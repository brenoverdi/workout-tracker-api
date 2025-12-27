import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Tutorial,
  TutorialExercise,
  TutorialMuscleGroup,
  TutorialMedia,
} from './model';
import { Exercise } from '../exercise/model';
import { WorkoutSession, SessionExercise } from '../session/model';
import { TutorialController } from './controller';
import {
  SearchTutorialsService,
  GetTutorialsByExerciseService,
  GetTutorialsByMuscleService,
  GetRecommendedTutorialsService,
  GetTutorialDetailService,
  GetRelatedTutorialsService,
  IndexTutorialService,
} from './use-cases';
import { RedisService } from '../../services/redis.service';
import { ElasticsearchService } from '../../services/elasticsearch.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tutorial,
      TutorialExercise,
      TutorialMuscleGroup,
      TutorialMedia,
      Exercise,
      WorkoutSession,
      SessionExercise,
    ]),
  ],
  controllers: [TutorialController],
  providers: [
    SearchTutorialsService,
    GetTutorialsByExerciseService,
    GetTutorialsByMuscleService,
    GetRecommendedTutorialsService,
    GetTutorialDetailService,
    GetRelatedTutorialsService,
    IndexTutorialService,
    RedisService,
    ElasticsearchService,
  ],
  exports: [IndexTutorialService],
})
export class TutorialModule {}
