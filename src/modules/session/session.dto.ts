import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class StartSessionDto {
  @IsUUID()
  @IsOptional()
  programId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AddSessionExerciseDto {
  @IsUUID()
  @IsNotEmpty()
  exerciseId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class LogSetDto {
  @IsUUID()
  @IsNotEmpty()
  sessionExerciseId: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  weight: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  reps: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  rpe?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  restTime?: number;
}

export class UpdateSetLogDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  reps?: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  rpe?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class CompleteSessionDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class GetSessionHistoryDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsMax(50)
  @IsOptional()
  limit?: number = 10;
}

function IsMax(arg0: number): (target: object, propertyKey: string) => void {
  return Max(arg0);
}
