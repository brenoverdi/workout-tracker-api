import { Controller, Get, Query } from '@nestjs/common';
import { SearchExercisesService } from './use-cases/search-exercises.service';
import { MuscleGroup, Equipment, Difficulty } from '../exercise/model';
import { ResponseUtil } from '../../utils/response.util';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchExercisesService: SearchExercisesService,
  ) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('muscleGroups') muscleGroups: MuscleGroup,
    @Query('equipmentType') equipmentType: Equipment,
    @Query('difficultyLevel') difficultyLevel: Difficulty,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const { results, total } = await this.searchExercisesService.execute({
      query,
      muscleGroups,
      equipmentType,
      difficultyLevel,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return ResponseUtil.paginated(
      results,
      total,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('suggestions')
  async suggestions(@Query('q') query: string) {
    const suggestions =
      await this.searchExercisesService.searchSuggestions(query);
    return ResponseUtil.success(suggestions);
  }
}
