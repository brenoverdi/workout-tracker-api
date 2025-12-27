import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Service } from '../../../services/s3.service';
import { FileType } from '../files.dto';

interface UploadResult {
  key: string;
  url: string;
  type: FileType;
}

const ALLOWED_MIME_TYPES: Record<FileType, string[]> = {
  [FileType.EXERCISE_IMAGE]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  [FileType.EXERCISE_VIDEO]: ['video/mp4', 'video/quicktime', 'video/webm'],
  [FileType.PROGRESS_PHOTO]: ['image/jpeg', 'image/png', 'image/webp'],
  [FileType.PROFILE_PICTURE]: ['image/jpeg', 'image/png', 'image/webp'],
  [FileType.OTHER]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'application/pdf',
  ],
};

const MAX_FILE_SIZES: Record<FileType, number> = {
  [FileType.EXERCISE_IMAGE]: 10 * 1024 * 1024, // 10MB
  [FileType.EXERCISE_VIDEO]: 100 * 1024 * 1024, // 100MB
  [FileType.PROGRESS_PHOTO]: 10 * 1024 * 1024, // 10MB
  [FileType.PROFILE_PICTURE]: 5 * 1024 * 1024, // 5MB
  [FileType.OTHER]: 50 * 1024 * 1024, // 50MB
};

@Injectable()
export class UploadFileService {
  constructor(private s3Service: S3Service) {}

  async execute(
    file: Express.Multer.File,
    type: FileType,
    userId: string,
  ): Promise<UploadResult> {
    // Validate MIME type
    const allowedTypes = ALLOWED_MIME_TYPES[type];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[type];
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`,
      );
    }

    // Determine folder based on type
    const folder = `${type}/${userId}`;

    // Upload to S3
    const result = await this.s3Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder,
    );

    return {
      key: result.key,
      url: result.url,
      type,
    };
  }
}
