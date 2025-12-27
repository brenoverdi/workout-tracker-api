import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program, ProgramExercise, UserProgram } from './model';
import { Exercise } from '../exercise/model';
import { ProgramController } from './controller';
import { CreateProgramService } from './use-cases/create-program.service';
import { FindProgramsService } from './use-cases/find-programs.service';
import { UpdateProgramService } from './use-cases/update-program.service';
import { DeleteProgramService } from './use-cases/delete-program.service';
import { ManageProgramExercisesService } from './use-cases/manage-program-exercises.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Program, ProgramExercise, UserProgram, Exercise]),
  ],
  controllers: [ProgramController],
  providers: [
    CreateProgramService,
    FindProgramsService,
    UpdateProgramService,
    DeleteProgramService,
    ManageProgramExercisesService,
  ],
  exports: [FindProgramsService],
})
export class ProgramModule {}
