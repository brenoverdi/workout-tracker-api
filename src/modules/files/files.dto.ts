import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export enum FileType {
  EXERCISE_IMAGE = 'exercise_image',
  EXERCISE_VIDEO = 'exercise_video',
  PROGRESS_PHOTO = 'progress_photo',
  PROFILE_PICTURE = 'profile_picture',
  OTHER = 'other',
}

export class UploadFileDto {
  @IsEnum(FileType)
  @IsNotEmpty()
  type: FileType;

  @IsString()
  @IsOptional()
  description?: string;
}

export class GetSignedUrlDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsInt()
  @Min(60)
  @Max(86400) // Max 24 hours
  @IsOptional()
  expiresIn?: number;
}
