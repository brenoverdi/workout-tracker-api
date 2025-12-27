import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, ProgramExercise, UserProgram } from '../model';
import { Exercise } from '../../exercise/model';
import {
  AddProgramExerciseDto,
  UpdateProgramExerciseDto,
} from '../program.dto';

@Injectable()
export class ManageProgramExercisesService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(ProgramExercise)
    private programExerciseRepository: Repository<ProgramExercise>,
    @InjectRepository(UserProgram)
    private userProgramRepository: Repository<UserProgram>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  private async checkPermission(programId: string, userId: string) {
    const enrollment = await this.userProgramRepository.findOne({
      where: { programId, userId, isActive: true },
    });
    if (!enrollment) {
      throw new ForbiddenException(
        'You do not have permission to modify this program',
      );
    }
  }

  async addExercise(
    programId: string,
    dto: AddProgramExerciseDto,
    userId: string,
  ): Promise<ProgramExercise> {
    const program = await this.programRepository.findOne({
      where: { id: programId, isAvailable: true },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    await this.checkPermission(programId, userId);

    const exercise = await this.exerciseRepository.findOne({
      where: { id: dto.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const programExercise = this.programExerciseRepository.create({
      programId,
      exerciseId: dto.exerciseId,
      daysOfTheWeek: dto.daysOfTheWeek,
      order: dto.order || 1,
      targetSets: dto.targetSets || 3,
      targetReps: dto.targetReps || 10,
      restTime: dto.restTime || 60,
      notes: dto.notes,
    });

    return await this.programExerciseRepository.save(programExercise);
  }

  async updateExercise(
    programExerciseId: string,
    dto: UpdateProgramExerciseDto,
    userId: string,
  ): Promise<ProgramExercise> {
    const programExercise = await this.programExerciseRepository.findOne({
      where: { id: programExerciseId },
      relations: ['program'],
    });

    if (!programExercise) {
      throw new NotFoundException('Program exercise not found');
    }

    await this.checkPermission(programExercise.programId, userId);

    Object.assign(programExercise, dto);

    return await this.programExerciseRepository.save(programExercise);
  }

  async removeExercise(
    programExerciseId: string,
    userId: string,
  ): Promise<void> {
    const programExercise = await this.programExerciseRepository.findOne({
      where: { id: programExerciseId },
    });

    if (!programExercise) {
      throw new NotFoundException('Program exercise not found');
    }

    await this.checkPermission(programExercise.programId, userId);

    await this.programExerciseRepository.remove(programExercise);
  }
}
