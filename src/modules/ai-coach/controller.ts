import {
  Controller,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GenerateWorkoutService } from './use-cases/generate-workout.service';
import { AnalyzeProgressService } from './use-cases/analyze-progress.service';
import { ChatService } from './use-cases/chat.service';
import {
  GenerateWorkoutDto,
  AskCoachDto,
  AnalyzeProgressDto,
} from './ai-coach.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { ResponseUtil } from '../../utils/response.util';

@Controller('ai-coach')
@UseGuards(JwtAuthGuard)
export class AiCoachController {
  constructor(
    private readonly generateWorkoutService: GenerateWorkoutService,
    private readonly analyzeProgressService: AnalyzeProgressService,
    private readonly chatService: ChatService,
  ) {}

  @Post('generate-workout')
  async generateWorkout(@Body() dto: GenerateWorkoutDto, @Request() req) {
    const result = await this.generateWorkoutService.execute(dto, req.user.id);
    return ResponseUtil.success(result, 'Workout plan generated successfully');
  }

  @Post('analyze')
  async analyzeProgress(@Body() dto: AnalyzeProgressDto, @Request() req) {
    const result = await this.analyzeProgressService.execute(
      req.user.id,
      dto.daysToAnalyze || 30,
    );
    return ResponseUtil.success(result);
  }

  @Post('chat')
  async chat(@Body() dto: AskCoachDto, @Request() req) {
    const result = await this.chatService.execute(dto.question, req.user.id);
    return ResponseUtil.success(result);
  }
}
