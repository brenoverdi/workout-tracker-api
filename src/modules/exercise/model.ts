import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../user/model';

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  FOREARMS = 'forearms',
  ABS = 'abs',
  QUADRICEPS = 'quadriceps',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  FULL_BODY = 'full_body',
}

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  MACHINE = 'machine',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  RESISTANCE_BAND = 'resistance_band',
  OTHER = 'other',
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_demonstration', nullable: true })
  imageDemonstration: string;

  @Index()
  @Column({
    name: 'muscle_groups',
    type: 'enum',
    enum: MuscleGroup,
  })
  muscleGroups: MuscleGroup;

  @Column({
    name: 'equipment_type',
    type: 'enum',
    enum: Equipment,
  })
  equipmentType: Equipment;

  @Column({
    name: 'difficulty_level',
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.INTERMEDIATE,
  })
  difficultyLevel: Difficulty;

  @Column({ name: 'video_demonstration', nullable: true })
  videoDemonstration: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
