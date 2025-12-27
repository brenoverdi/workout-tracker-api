import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ProgramGoal } from '../program/model';

export class GenerateWorkoutDto {
  @IsEnum(ProgramGoal)
  @IsNotEmpty()
  goal: ProgramGoal;

  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  daysPerWeek?: number;

  @IsInt()
  @Min(15)
  @Max(180)
  @IsOptional()
  sessionDurationMinutes?: number;

  @IsString()
  @IsOptional()
  equipment?: string;

  @IsString()
  @IsOptional()
  focusAreas?: string;

  @IsString()
  @IsOptional()
  limitations?: string;
}

export class AskCoachDto {
  @IsString()
  @IsNotEmpty()
  question: string;
}

export class AnalyzeProgressDto {
  @IsInt()
  @Min(7)
  @Max(365)
  @IsOptional()
  daysToAnalyze?: number;
}
