import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Exercise } from '../exercise/model';
import { MuscleGroup } from '../exercise/model';

export enum TutorialType {
  FORM = 'form',
  TECHNIQUE = 'technique',
  MOBILITY = 'mobility',
  THEORY = 'theory',
  INJURY_PREVENTION = 'injury_prevention',
  RECOVERY = 'recovery',
}

export enum TutorialDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('tutorials')
export class Tutorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: TutorialType,
  })
  type: TutorialType;

  @Column({
    type: 'enum',
    enum: TutorialDifficulty,
    nullable: true,
  })
  difficulty: TutorialDifficulty;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;

  @OneToMany(() => TutorialExercise, (te) => te.tutorial, { cascade: true })
  tutorialExercises: TutorialExercise[];

  @OneToMany(() => TutorialMuscleGroup, (tmg) => tmg.tutorial, {
    cascade: true,
  })
  tutorialMuscleGroups: TutorialMuscleGroup[];

  @OneToMany(() => TutorialMedia, (tm) => tm.tutorial, { cascade: true })
  tutorialMedia: TutorialMedia[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('tutorial_exercises')
export class TutorialExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tutorial_id' })
  tutorialId: string;

  @ManyToOne(() => Tutorial, (tutorial) => tutorial.tutorialExercises, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tutorial_id' })
  tutorial: Tutorial;

  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('tutorial_muscle_groups')
export class TutorialMuscleGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tutorial_id' })
  tutorialId: string;

  @ManyToOne(() => Tutorial, (tutorial) => tutorial.tutorialMuscleGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tutorial_id' })
  tutorial: Tutorial;

  @Column({
    name: 'muscle_group',
    type: 'enum',
    enum: MuscleGroup,
  })
  muscleGroup: MuscleGroup;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('tutorial_media')
export class TutorialMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tutorial_id' })
  tutorialId: string;

  @ManyToOne(() => Tutorial, (tutorial) => tutorial.tutorialMedia, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tutorial_id' })
  tutorial: Tutorial;

  @Column({ nullable: true })
  provider: string; // youtube, vimeo, s3, etc.

  @Column({ type: 'text' })
  url: string;

  @Column({ name: 'cdn_url', type: 'text', nullable: true })
  cdnUrl: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'int', nullable: true })
  duration: number; // seconds

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ type: 'text', nullable: true })
  transcript: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
