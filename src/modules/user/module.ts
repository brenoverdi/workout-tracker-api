import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from './model';
import { UserController } from './controller';
import { SignupService } from './use-cases/signup.service';
import { LoginService } from './use-cases/login.service';
import { UpdateProfileService } from './use-cases/update-profile.service';
import { JwtStrategy } from './jwt.strategy';
import { config } from '../../config/env.config';

const envConfig = config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: envConfig.jwt.secret || 'default-secret-change-this',
      signOptions: { 
        expiresIn: (envConfig.jwt.expiresIn || '7d') as any,
      },
    }),
  ],
  controllers: [UserController],
  providers: [
    SignupService,
    LoginService,
    UpdateProfileService,
    JwtStrategy,
  ],
  exports: [SignupService, LoginService, UpdateProfileService],
})
export class UserModule {}
