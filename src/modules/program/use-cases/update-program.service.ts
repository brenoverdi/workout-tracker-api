import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, UserProgram } from '../model';
import { UpdateProgramDto } from '../program.dto';

@Injectable()
export class UpdateProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(UserProgram)
    private userProgramRepository: Repository<UserProgram>,
  ) {}

  async execute(
    id: string,
    dto: UpdateProgramDto,
    userId: string,
  ): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    // Permission check: user must be enrolled in the program
    const enrollment = await this.userProgramRepository.findOne({
      where: { programId: id, userId, isActive: true },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You do not have permission to update this program',
      );
    }

    Object.assign(program, dto);

    return await this.programRepository.save(program);
  }
}
