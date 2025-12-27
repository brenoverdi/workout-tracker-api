import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSession } from '../model';
import { CompleteSessionDto } from '../session.dto';

@Injectable()
export class CompleteSessionService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
  ) {}

  async execute(
    sessionId: string,
    dto: CompleteSessionDto,
    userId: string,
  ): Promise<WorkoutSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['sessionExercises', 'sessionExercises.sessionSets'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this session',
      );
    }

    // In the new schema, we don't have a status.
    // Completing a session just means recording the duration and notes.
    session.duration = dto.duration || session.duration;
    session.notes = dto.notes || session.notes;

    return await this.sessionRepository.save(session);
  }

  async delete(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this session',
      );
    }

    await this.sessionRepository.remove(session);
  }
}
