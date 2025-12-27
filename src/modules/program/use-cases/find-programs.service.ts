import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, UserProgram } from '../model';

@Injectable()
export class FindProgramsService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(UserProgram)
    private userProgramRepository: Repository<UserProgram>,
  ) {}

  async findByUser(userId: string): Promise<Program[]> {
    const enrollments = await this.userProgramRepository.find({
      where: { userId, isActive: true },
      relations: [
        'program',
        'program.programExercises',
        'program.programExercises.exercise',
      ],
      order: { createdAt: 'DESC' },
    });

    return enrollments.map((e) => e.program);
  }

  async findById(id: string, userId: string): Promise<Program | null> {
    const enrollment = await this.userProgramRepository.findOne({
      where: { programId: id, userId, isActive: true },
      relations: [
        'program',
        'program.programExercises',
        'program.programExercises.exercise',
      ],
    });

    return enrollment ? enrollment.program : null;
  }

  async findAllAvailable(): Promise<Program[]> {
    return await this.programRepository.find({
      where: { isAvailable: true },
      relations: ['programExercises', 'programExercises.exercise'],
    });
  }
}
