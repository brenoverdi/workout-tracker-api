import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { TutorialType, TutorialDifficulty } from './model';
import { MuscleGroup } from '../exercise/model';

export class SearchTutorialsDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsEnum(TutorialType)
  @IsOptional()
  type?: TutorialType;

  @IsEnum(TutorialDifficulty)
  @IsOptional()
  difficulty?: TutorialDifficulty;

  @IsUUID()
  @IsOptional()
  exerciseId?: string;

  @IsEnum(MuscleGroup)
  @IsOptional()
  muscleGroup?: MuscleGroup;

  @IsBoolean()
  @IsOptional()
  hasVideo?: boolean;

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

export interface TutorialListItemDto {
  id: string;
  title: string;
  summary: string | null;
  type: TutorialType;
  difficulty: TutorialDifficulty | null;
  tags: string[];
  thumbnailUrl: string | null;
  hasVideo: boolean;
  videoDuration: number | null;
  videoUrl: string | null;
  exerciseIds: string[];
  exerciseNames: string[];
  muscleGroups: MuscleGroup[];
}

export interface TutorialDetailDto {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  type: TutorialType;
  difficulty: TutorialDifficulty | null;
  tags: string[];
  priority: number;
  exercises: Array<{
    id: string;
    name: string;
  }>;
  muscleGroups: MuscleGroup[];
  media: Array<{
    id: string;
    provider: string | null;
    url: string;
    cdnUrl: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
    isPrimary: boolean;
    transcript: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecommendedTutorialDto {
  tutorialId: string;
  title: string;
  summary: string | null;
  type: TutorialType;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  thumbnailUrl: string | null;
  hasVideo: boolean;
}
