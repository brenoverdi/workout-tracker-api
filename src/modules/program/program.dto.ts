import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  schedule?: string;
}

export class UpdateProgramDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class AddProgramExerciseDto {
  @IsUUID()
  @IsNotEmpty()
  exerciseId: string;

  @IsString()
  @IsNotEmpty()
  daysOfTheWeek: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;

  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  targetSets?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  targetReps?: number;

  @IsInt()
  @Min(0)
  @Max(600)
  @IsOptional()
  restTime?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateProgramExerciseDto {
  @IsString()
  @IsOptional()
  daysOfTheWeek?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;

  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  targetSets?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  targetReps?: number;

  @IsInt()
  @Min(0)
  @Max(600)
  @IsOptional()
  restTime?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
