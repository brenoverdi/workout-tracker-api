import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/model';
import { Program } from '../program/model';
import { Exercise } from '../exercise/model';

export enum SessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('sessions')
export class WorkoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'program_id', nullable: true })
  programId: string;

  @ManyToOne(() => Program, { nullable: true })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({
    name: 'session_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sessionDate: Date;

  @Column({ type: 'int', nullable: true })
  duration: number; // in minutes

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => SessionExercise, (se) => se.session, { cascade: true })
  sessionExercises: SessionExercise[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('sessions_exercises')
export class SessionExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => WorkoutSession, (session) => session.sessionExercises)
  @JoinColumn({ name: 'session_id' })
  session: WorkoutSession;

  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @ManyToOne(() => Exercise)
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ type: 'int', default: 1 })
  order: number;

  @OneToMany(() => SessionSet, (setLog) => setLog.sessionExercise, {
    cascade: true,
  })
  sessionSets: SessionSet[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('session_sets')
export class SessionSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_exercise_id' })
  sessionExerciseId: string;

  @ManyToOne(() => SessionExercise, (se) => se.sessionSets)
  @JoinColumn({ name: 'session_exercise_id' })
  sessionExercise: SessionExercise;

  @Column({ type: 'int' })
  reps: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  weight: number; // in kg

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rpe: number; // Rate of Perceived Exertion (1-10)

  @Column({ name: 'rest_time', type: 'int', nullable: true })
  restTime: number;

  @Column({ default: true })
  completed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
