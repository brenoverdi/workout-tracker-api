import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemLog } from './model';

@Module({
  imports: [TypeOrmModule.forFeature([SystemLog])],
  exports: [TypeOrmModule],
})
export class SystemLogsModule {}
