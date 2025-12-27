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
import { Exercise } from '../exercise/model';

export enum ProgramGoal {
  MUSCLE_BUILDING = 'muscle_building',
  STRENGTH = 'strength',
  FAT_LOSS = 'fat_loss',
  ENDURANCE = 'endurance',
  GENERAL_FITNESS = 'general_fitness',
  FLEXIBILITY = 'flexibility',
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'duration', type: 'text', nullable: true })
  duration: string;

  @Column({ name: 'schedule', type: 'text', nullable: true })
  schedule: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @OneToMany(() => ProgramExercise, (pe) => pe.program, { cascade: true })
  programExercises: ProgramExercise[];

  @OneToMany(() => UserProgram, (up) => up.program)
  userPrograms: UserProgram[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('programs_users')
export class UserProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'program_id' })
  programId: string;

  @ManyToOne(() => Program, (program) => program.userPrograms)
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('programs_exercises')
export class ProgramExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'program_id' })
  programId: string;

  @ManyToOne(() => Program, (program) => program.programExercises)
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @ManyToOne(() => Exercise)
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ name: 'days_of_the_week', type: 'text', nullable: true })
  daysOfTheWeek: string;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ name: 'target_sets', type: 'int', default: 3 })
  targetSets: number;

  @Column({ name: 'target_reps', type: 'int', default: 10 })
  targetReps: number;

  @Column({ name: 'rest_time', type: 'int', default: 60 })
  restTime: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
