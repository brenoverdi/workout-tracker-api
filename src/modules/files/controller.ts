import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileService } from './use-cases/upload-file.service';
import { GetFileService } from './use-cases/get-file.service';
import { FileType } from './files.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { ResponseUtil } from '../../utils/response.util';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly uploadFileService: UploadFileService,
    private readonly getFileService: GetFileService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: FileType,
    @Request() req,
  ) {
    if (!file) {
      return ResponseUtil.error('No file provided');
    }

    const result = await this.uploadFileService.execute(
      file,
      type || FileType.OTHER,
      req.user.id,
    );
    return ResponseUtil.success(result, 'File uploaded successfully');
  }

  @Get('signed-url')
  async getSignedUrl(
    @Query('key') key: string,
    @Query('expiresIn') expiresIn: string,
  ) {
    if (!key) {
      return ResponseUtil.error('File key is required');
    }

    const result = await this.getFileService.getSignedUrl(
      key,
      expiresIn ? parseInt(expiresIn, 10) : 3600,
    );
    return ResponseUtil.success(result);
  }

  @Delete('*key')
  async delete(@Param('key') key: string) {
    await this.getFileService.deleteFile(key);
    return ResponseUtil.success(null, 'File deleted successfully');
  }
}
