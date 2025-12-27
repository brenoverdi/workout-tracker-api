import { Injectable } from '@nestjs/common';
import { S3Service } from '../../../services/s3.service';

@Injectable()
export class GetFileService {
  constructor(private s3Service: S3Service) {}

  async getSignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<{ url: string; expiresIn: number }> {
    const url = await this.s3Service.getSignedUrl(key, expiresIn);
    return { url, expiresIn };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Service.deleteFile(key);
  }
}
