import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { SearchTutorialsService } from './use-cases/search-tutorials.service';
import { GetTutorialsByExerciseService } from './use-cases/get-tutorials-by-exercise.service';
import { GetTutorialsByMuscleService } from './use-cases/get-tutorials-by-muscle.service';
import { GetRecommendedTutorialsService } from './use-cases/get-recommended-tutorials.service';
import { GetTutorialDetailService } from './use-cases/get-tutorial-detail.service';
import { GetRelatedTutorialsService } from './use-cases/get-related-tutorials.service';
import { IndexTutorialService } from './use-cases/index-tutorial.service';
import { SearchTutorialsDto } from './tutorial.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { ResponseUtil } from '../../utils/response.util';
import { MuscleGroup } from '../exercise/model';
import { Post, InjectRepository } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tutorial } from './model';

@Controller('tutorials')
export class TutorialController {
  constructor(
    private readonly searchTutorialsService: SearchTutorialsService,
    private readonly getTutorialsByExerciseService: GetTutorialsByExerciseService,
    private readonly getTutorialsByMuscleService: GetTutorialsByMuscleService,
    private readonly getRecommendedTutorialsService: GetRecommendedTutorialsService,
    private readonly getTutorialDetailService: GetTutorialDetailService,
    private readonly getRelatedTutorialsService: GetRelatedTutorialsService,
    private readonly indexTutorialService: IndexTutorialService,
    @InjectRepository(Tutorial)
    private readonly tutorialRepository: Repository<Tutorial>,
  ) {}

  @Post('reindex')
  async reindex() {
    await this.indexTutorialService.createIndex();
    const tutorials = await this.tutorialRepository.find();
    await this.indexTutorialService.bulkIndexTutorials(tutorials);
    return ResponseUtil.success({ message: 'Re-indexing successful', count: tutorials.length });
  }

  @Get('search')
  async search(@Query() dto: SearchTutorialsDto) {
    const { tutorials, total } = await this.searchTutorialsService.execute(dto);
    return ResponseUtil.paginated(
      tutorials,
      total,
      dto.page || 1,
      dto.limit || 20,
    );
  }

  @Get('exercise/:exerciseId')
  async getByExercise(@Param('exerciseId') exerciseId: string) {
    const tutorials =
      await this.getTutorialsByExerciseService.execute(exerciseId);
    return ResponseUtil.success(tutorials);
  }

  @Get('muscle/:muscleGroup')
  async getByMuscle(
    @Param('muscleGroup') muscleGroup: MuscleGroup,
    @Query('type') type?: string,
  ) {
    const tutorials = await this.getTutorialsByMuscleService.execute(
      muscleGroup,
      type,
    );
    return ResponseUtil.success(tutorials);
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  async getRecommended(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const tutorials = await this.getRecommendedTutorialsService.execute(
      req.user.id,
      limit,
    );
    return ResponseUtil.success(tutorials);
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    const tutorial = await this.getTutorialDetailService.execute(id);
    return ResponseUtil.success(tutorial);
  }

  @Get(':id/related')
  async getRelated(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    const tutorials = await this.getRelatedTutorialsService.execute(id, limit);
    return ResponseUtil.success(tutorials);
  }
}
