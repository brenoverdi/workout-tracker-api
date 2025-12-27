import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { MuscleGroup, Equipment, Difficulty } from './model';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MuscleGroup)
  @IsNotEmpty()
  muscleGroups: MuscleGroup;

  @IsEnum(Equipment)
  @IsNotEmpty()
  equipmentType: Equipment;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficultyLevel?: Difficulty;

  @IsUrl()
  @IsOptional()
  imageDemonstration?: string;

  @IsUrl()
  @IsOptional()
  videoDemonstration?: string;
}

export class UpdateExerciseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MuscleGroup)
  @IsOptional()
  muscleGroups?: MuscleGroup;

  @IsEnum(Equipment)
  @IsOptional()
  equipmentType?: Equipment;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficultyLevel?: Difficulty;

  @IsUrl()
  @IsOptional()
  imageDemonstration?: string;

  @IsUrl()
  @IsOptional()
  videoDemonstration?: string;
}

export class FindExercisesDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(MuscleGroup)
  @IsOptional()
  muscleGroups?: MuscleGroup;

  @IsEnum(Equipment)
  @IsOptional()
  equipmentType?: Equipment;

  @IsEnum(Difficulty)
  @IsOptional()
  difficultyLevel?: Difficulty;

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
