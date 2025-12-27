import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSession } from '../model';
import { StartSessionDto } from '../session.dto';

@Injectable()
export class StartSessionService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
  ) {}

  async execute(dto: StartSessionDto, userId: string): Promise<WorkoutSession> {
    const session = this.sessionRepository.create({
      userId,
      programId: dto.programId,
      notes: dto.notes,
      sessionDate: new Date(),
    });

    return await this.sessionRepository.save(session);
  }
}
