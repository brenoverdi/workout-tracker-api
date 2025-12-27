import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SignupService } from './use-cases/signup.service';
import { LoginService } from './use-cases/login.service';
import { UpdateProfileService } from './use-cases/update-profile.service';
import { SignupDto, LoginDto, UpdateProfileDto } from './user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ResponseUtil } from '../../utils/response.util';

@Controller('auth')
export class UserController {
  constructor(
    private readonly signupService: SignupService,
    private readonly loginService: LoginService,
    private readonly updateProfileService: UpdateProfileService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    const user = await this.signupService.execute(signupDto);
    return ResponseUtil.success(user, 'User registered successfully');
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.loginService.execute(loginDto);
    return ResponseUtil.success(result, 'Login successful');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const { password, refreshToken, ...user } = req.user;
    return ResponseUtil.success(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.updateProfileService.execute(
      req.user.id,
      updateProfileDto,
    );
    return ResponseUtil.success(user, 'Profile updated successfully');
  }
}
