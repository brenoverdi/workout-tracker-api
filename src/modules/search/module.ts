import { Module } from '@nestjs/common';
import { SearchController } from './controller';
import { IndexExerciseService } from './use-cases/index-exercise.service';
import { SearchExercisesService } from './use-cases/search-exercises.service';
import { ElasticsearchService } from '../../services/elasticsearch.service';

@Module({
  controllers: [SearchController],
  providers: [
    IndexExerciseService,
    SearchExercisesService,
    ElasticsearchService,
  ],
  exports: [IndexExerciseService, SearchExercisesService],
})
export class SearchModule {}
