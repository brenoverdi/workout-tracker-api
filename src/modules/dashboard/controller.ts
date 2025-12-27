import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GetDashboardService } from './use-cases/get-dashboard.service';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { ResponseUtil } from '../../utils/response.util';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly getDashboardService: GetDashboardService) {}

  @Get()
  async getDashboard(@Request() req) {
    const dashboard = await this.getDashboardService.execute(req.user.id);
    return ResponseUtil.success(dashboard);
  }
}
