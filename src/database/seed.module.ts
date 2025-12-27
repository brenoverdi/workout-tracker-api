import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Exercise } from '../modules/exercise/model';
import {
  Program,
  ProgramExercise,
  UserProgram,
} from '../modules/program/model';
import { User } from '../modules/user/model';
import {
  Tutorial,
  TutorialExercise,
  TutorialMuscleGroup,
  TutorialMedia,
} from '../modules/tutorial/model';
import { SearchModule } from '../modules/search/module';
import { TutorialModule } from '../modules/tutorial/module';
import { RedisService } from '../services/redis.service';
import { ElasticsearchService } from '../services/elasticsearch.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exercise,
      Program,
      ProgramExercise,
      User,
      UserProgram,
      Tutorial,
      TutorialExercise,
      TutorialMuscleGroup,
      TutorialMedia,
    ]),
    SearchModule,
    TutorialModule,
  ],
  controllers: [SeedController],
  providers: [SeedService, RedisService, ElasticsearchService],
})
export class SeedModule {}
