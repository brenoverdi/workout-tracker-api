import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateProgramService } from './use-cases/create-program.service';
import { FindProgramsService } from './use-cases/find-programs.service';
import { UpdateProgramService } from './use-cases/update-program.service';
import { DeleteProgramService } from './use-cases/delete-program.service';
import { ManageProgramExercisesService } from './use-cases/manage-program-exercises.service';
import {
  CreateProgramDto,
  UpdateProgramDto,
  AddProgramExerciseDto,
  UpdateProgramExerciseDto,
} from './program.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { ResponseUtil } from '../../utils/response.util';

@Controller('programs')
@UseGuards(JwtAuthGuard)
export class ProgramController {
  constructor(
    private readonly createProgramService: CreateProgramService,
    private readonly findProgramsService: FindProgramsService,
    private readonly updateProgramService: UpdateProgramService,
    private readonly deleteProgramService: DeleteProgramService,
    private readonly manageProgramExercisesService: ManageProgramExercisesService,
  ) {}

  @Post()
  async create(@Body() dto: CreateProgramDto, @Request() req) {
    const program = await this.createProgramService.execute(dto, req.user.id);
    return ResponseUtil.success(program, 'Program created successfully');
  }

  @Get()
  async findAll(@Request() req) {
    const programs = await this.findProgramsService.findByUser(req.user.id);
    return ResponseUtil.success(programs);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req) {
    const program = await this.findProgramsService.findById(id, req.user.id);
    if (!program) {
      return ResponseUtil.error('Program not found');
    }
    return ResponseUtil.success(program);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
    @Request() req,
  ) {
    const program = await this.updateProgramService.execute(
      id,
      dto,
      req.user.id,
    );
    return ResponseUtil.success(program, 'Program updated successfully');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.deleteProgramService.execute(id, req.user.id);
    return ResponseUtil.success(null, 'Program deleted successfully');
  }

  // Program Exercise endpoints
  @Post(':id/exercises')
  async addExercise(
    @Param('id') programId: string,
    @Body() dto: AddProgramExerciseDto,
    @Request() req,
  ) {
    const programExercise =
      await this.manageProgramExercisesService.addExercise(
        programId,
        dto,
        req.user.id,
      );
    return ResponseUtil.success(programExercise, 'Exercise added to program');
  }

  @Put(':id/exercises/:exerciseId')
  async updateExercise(
    @Param('exerciseId') programExerciseId: string,
    @Body() dto: UpdateProgramExerciseDto,
    @Request() req,
  ) {
    const programExercise =
      await this.manageProgramExercisesService.updateExercise(
        programExerciseId,
        dto,
        req.user.id,
      );
    return ResponseUtil.success(programExercise, 'Program exercise updated');
  }

  @Delete(':id/exercises/:exerciseId')
  async removeExercise(
    @Param('exerciseId') programExerciseId: string,
    @Request() req,
  ) {
    await this.manageProgramExercisesService.removeExercise(
      programExerciseId,
      req.user.id,
    );
    return ResponseUtil.success(null, 'Exercise removed from program');
  }
}
