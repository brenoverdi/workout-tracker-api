import { Module } from '@nestjs/common';
import { FilesController } from './controller';
import { FileEntity } from './model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFileService } from './use-cases/upload-file.service';
import { GetFileService } from './use-cases/get-file.service';
import { S3Service } from '../../services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [FilesController],
  providers: [UploadFileService, GetFileService, S3Service],
  exports: [UploadFileService, GetFileService],
})
export class FilesModule {}
