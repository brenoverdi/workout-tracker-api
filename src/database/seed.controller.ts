import { Controller, Post, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ResponseUtil } from '../utils/response.util';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async runSeed() {
    const result = await this.seedService.seed();
    return ResponseUtil.success(result, 'Seeding executed successfully');
  }

  @Get()
  async getStatus() {
    return ResponseUtil.success({ status: 'Seeding module active' });
  }
}
