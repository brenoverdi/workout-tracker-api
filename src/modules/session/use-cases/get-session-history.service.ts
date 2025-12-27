import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { WorkoutSession } from '../model';
import { GetSessionHistoryDto } from '../session.dto';

@Injectable()
export class GetSessionHistoryService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
  ) {}

  async execute(
    dto: GetSessionHistoryDto,
    userId: string,
  ): Promise<{ sessions: WorkoutSession[]; total: number }> {
    const { startDate, endDate, page = 1, limit = 10 } = dto;

    const where: any = {
      userId,
    };

    if (startDate && endDate) {
      where.sessionDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.sessionDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.sessionDate = LessThanOrEqual(new Date(endDate));
    }

    const [sessions, total] = await this.sessionRepository.findAndCount({
      where,
      relations: [
        'sessionExercises',
        'sessionExercises.exercise',
        'sessionExercises.sessionSets',
        'program',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { sessionDate: 'DESC' },
    });

    return { sessions, total };
  }

  async findById(
    sessionId: string,
    userId: string,
  ): Promise<WorkoutSession | null> {
    return await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
      relations: [
        'sessionExercises',
        'sessionExercises.exercise',
        'sessionExercises.sessionSets',
        'program',
      ],
    });
  }

  async getLatestSession(userId: string): Promise<WorkoutSession | null> {
    return await this.sessionRepository.findOne({
      where: { userId },
      relations: [
        'sessionExercises',
        'sessionExercises.exercise',
        'sessionExercises.sessionSets',
      ],
      order: { sessionDate: 'DESC' },
    });
  }
}
