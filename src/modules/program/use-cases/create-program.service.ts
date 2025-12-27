import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, UserProgram } from '../model';
import { CreateProgramDto } from '../program.dto';

@Injectable()
export class CreateProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(UserProgram)
    private userProgramRepository: Repository<UserProgram>,
  ) {}

  async execute(dto: CreateProgramDto, userId: string): Promise<Program> {
    const program = await this.programRepository.save(
      this.programRepository.create({
        ...dto,
        isAvailable: true,
      }),
    );

    // Link user to program
    await this.userProgramRepository.save(
      this.userProgramRepository.create({
        userId,
        programId: program.id,
        isActive: true,
      }),
    );

    return program;
  }
}
