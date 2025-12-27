import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSession, SessionExercise, SessionSet } from '../model';
import { Exercise } from '../../exercise/model';
import {
  AddSessionExerciseDto,
  LogSetDto,
  UpdateSetLogDto,
} from '../session.dto';

@Injectable()
export class LogExerciseService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
    @InjectRepository(SessionExercise)
    private sessionExerciseRepository: Repository<SessionExercise>,
    @InjectRepository(SessionSet)
    private sessionSetRepository: Repository<SessionSet>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  async addExercise(
    sessionId: string,
    dto: AddSessionExerciseDto,
    userId: string,
  ): Promise<SessionExercise> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this session',
      );
    }

    const exercise = await this.exerciseRepository.findOne({
      where: { id: dto.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const sessionExercise = this.sessionExerciseRepository.create({
      sessionId,
      exerciseId: dto.exerciseId,
      order: dto.order || 1,
    });

    return await this.sessionExerciseRepository.save(sessionExercise);
  }

  async logSet(dto: LogSetDto, userId: string): Promise<SessionSet> {
    const sessionExercise = await this.sessionExerciseRepository.findOne({
      where: { id: dto.sessionExerciseId },
      relations: ['session'],
    });

    if (!sessionExercise) {
      throw new NotFoundException('Session exercise not found');
    }

    if (sessionExercise.session.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this session',
      );
    }

    const sessionSet = this.sessionSetRepository.create({
      sessionExerciseId: dto.sessionExerciseId,
      weight: dto.weight,
      reps: dto.reps,
      rpe: dto.rpe,
      completed: dto.completed ?? true,
      restTime: dto.restTime,
    });

    return await this.sessionSetRepository.save(sessionSet);
  }

  async updateSet(
    sessionSetId: string,
    dto: UpdateSetLogDto,
    userId: string,
  ): Promise<SessionSet> {
    const sessionSet = await this.sessionSetRepository.findOne({
      where: { id: sessionSetId },
      relations: ['sessionExercise', 'sessionExercise.session'],
    });

    if (!sessionSet) {
      throw new NotFoundException('Session set not found');
    }

    if (sessionSet.sessionExercise.session.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this set',
      );
    }

    Object.assign(sessionSet, dto);

    return await this.sessionSetRepository.save(sessionSet);
  }

  async deleteSet(sessionSetId: string, userId: string): Promise<void> {
    const sessionSet = await this.sessionSetRepository.findOne({
      where: { id: sessionSetId },
      relations: ['sessionExercise', 'sessionExercise.session'],
    });

    if (!sessionSet) {
      throw new NotFoundException('Session set not found');
    }

    if (sessionSet.sessionExercise.session.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this set',
      );
    }

    await this.sessionSetRepository.remove(sessionSet);
  }
}
