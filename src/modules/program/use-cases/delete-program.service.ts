import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, UserProgram } from '../model';

@Injectable()
export class DeleteProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(UserProgram)
    private userProgramRepository: Repository<UserProgram>,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const enrollment = await this.userProgramRepository.findOne({
      where: { programId: id, userId, isActive: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Program enrollment not found');
    }

    // In the new schema, we don't delete the program (it might be a template).
    // Instead, we deactivate the user's enrollment.
    enrollment.isActive = false;
    await this.userProgramRepository.save(enrollment);
  }
}
