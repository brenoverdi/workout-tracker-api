import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'firstname', nullable: true })
  firstName: string;

  @Column({ name: 'surname', nullable: true })
  surname: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number; // in cm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number; // in kg

  @Column({
    name: 'experience_level',
    type: 'enum',
    enum: ExperienceLevel,
    default: ExperienceLevel.BEGINNER,
  })
  experienceLevel: ExperienceLevel;

  @Column({ name: 'frequency_exercise', type: 'int', nullable: true })
  frequencyExercise: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({ name: 'last_login_time', type: 'timestamp', nullable: true })
  lastLoginTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
