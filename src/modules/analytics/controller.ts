import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { GetProgressService } from './use-cases/get-progress.service';
import { GetMuscleDistributionService } from './use-cases/get-muscle-distribution.service';
import { GetWorkoutStatsService } from './use-cases/get-workout-stats.service';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { ResponseUtil } from '../../utils/response.util';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly getProgressService: GetProgressService,
    private readonly getMuscleDistributionService: GetMuscleDistributionService,
    private readonly getWorkoutStatsService: GetWorkoutStatsService,
  ) {}

  @Get('progress')
  async getProgress(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const progress = await this.getProgressService.execute(
      req.user.id,
      start,
      end,
    );
    return ResponseUtil.success(progress);
  }

  @Get('muscle-distribution')
  async getMuscleDistribution(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const distribution = await this.getMuscleDistributionService.execute(
      req.user.id,
      start,
      end,
    );
    return ResponseUtil.success(distribution);
  }

  @Get('stats')
  async getStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const stats = await this.getWorkoutStatsService.execute(
      req.user.id,
      start,
      end,
    );
    return ResponseUtil.success(stats);
  }
}
