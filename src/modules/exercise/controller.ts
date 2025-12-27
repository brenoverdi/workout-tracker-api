import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateExerciseService } from './use-cases/create-exercise.service';
import { FindExercisesService } from './use-cases/find-exercises.service';
import { UpdateExerciseService } from './use-cases/update-exercise.service';
import { DeleteExerciseService } from './use-cases/delete-exercise.service';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  FindExercisesDto,
} from './exercise.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { ResponseUtil } from '../../utils/response.util';

@Controller('exercises')
export class ExerciseController {
  constructor(
    private readonly createExerciseService: CreateExerciseService,
    private readonly findExercisesService: FindExercisesService,
    private readonly updateExerciseService: UpdateExerciseService,
    private readonly deleteExerciseService: DeleteExerciseService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateExerciseDto) {
    const exercise = await this.createExerciseService.execute(dto);
    return ResponseUtil.success(exercise, 'Exercise created successfully');
  }

  @Get()
  async findAll(@Query() dto: FindExercisesDto) {
    const { exercises, total } = await this.findExercisesService.execute(dto);
    return ResponseUtil.paginated(
      exercises,
      total,
      dto.page || 1,
      dto.limit || 20,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const exercise = await this.findExercisesService.findById(id);
    if (!exercise) {
      return ResponseUtil.error('Exercise not found');
    }
    return ResponseUtil.success(exercise);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateExerciseDto) {
    const exercise = await this.updateExerciseService.execute(id, dto);
    return ResponseUtil.success(exercise, 'Exercise updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.deleteExerciseService.execute(id);
    return ResponseUtil.success(null, 'Exercise deleted successfully');
  }
}
