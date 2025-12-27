import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StartSessionService } from './use-cases/start-session.service';
import { LogExerciseService } from './use-cases/log-exercise.service';
import { CompleteSessionService } from './use-cases/complete-session.service';
import { GetSessionHistoryService } from './use-cases/get-session-history.service';
import {
  StartSessionDto,
  AddSessionExerciseDto,
  LogSetDto,
  UpdateSetLogDto,
  CompleteSessionDto,
  GetSessionHistoryDto,
} from './session.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { ResponseUtil } from '../../utils/response.util';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(
    private readonly startSessionService: StartSessionService,
    private readonly logExerciseService: LogExerciseService,
    private readonly completeSessionService: CompleteSessionService,
    private readonly getSessionHistoryService: GetSessionHistoryService,
  ) {}

  @Post()
  async start(@Body() dto: StartSessionDto, @Request() req) {
    const session = await this.startSessionService.execute(dto, req.user.id);
    return ResponseUtil.success(session, 'Session started successfully');
  }

  @Get('latest')
  async getLatest(@Request() req) {
    const session = await this.getSessionHistoryService.getLatestSession(
      req.user.id,
    );
    return ResponseUtil.success(session);
  }

  @Get()
  async getHistory(@Query() dto: GetSessionHistoryDto, @Request() req) {
    const { sessions, total } = await this.getSessionHistoryService.execute(
      dto,
      req.user.id,
    );
    return ResponseUtil.paginated(
      sessions,
      total,
      dto.page || 1,
      dto.limit || 10,
    );
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Request() req) {
    const session = await this.getSessionHistoryService.findById(
      id,
      req.user.id,
    );
    if (!session) {
      return ResponseUtil.error('Session not found');
    }
    return ResponseUtil.success(session);
  }

  @Post(':id/exercises')
  async addExercise(
    @Param('id') sessionId: string,
    @Body() dto: AddSessionExerciseDto,
    @Request() req,
  ) {
    const sessionExercise = await this.logExerciseService.addExercise(
      sessionId,
      dto,
      req.user.id,
    );
    return ResponseUtil.success(sessionExercise, 'Exercise added to session');
  }

  @Post(':id/sets')
  async logSet(@Body() dto: LogSetDto, @Request() req) {
    const setLog = await this.logExerciseService.logSet(dto, req.user.id);
    return ResponseUtil.success(setLog, 'Set logged successfully');
  }

  @Put('sets/:setId')
  async updateSet(
    @Param('setId') setId: string,
    @Body() dto: UpdateSetLogDto,
    @Request() req,
  ) {
    const setLog = await this.logExerciseService.updateSet(
      setId,
      dto,
      req.user.id,
    );
    return ResponseUtil.success(setLog, 'Set updated successfully');
  }

  @Delete('sets/:setId')
  async deleteSet(@Param('setId') setId: string, @Request() req) {
    await this.logExerciseService.deleteSet(setId, req.user.id);
    return ResponseUtil.success(null, 'Set deleted successfully');
  }

  @Post(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteSessionDto,
    @Request() req,
  ) {
    const session = await this.completeSessionService.execute(
      id,
      dto,
      req.user.id,
    );
    return ResponseUtil.success(session, 'Session completed successfully');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.completeSessionService.delete(id, req.user.id);
    return ResponseUtil.success(null, 'Session deleted');
  }
}
