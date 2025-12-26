import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { IsStrongPassword } from '../../utils/validation.util';
import { ExperienceLevel, Gender } from './model';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(10)
  @Max(120)
  @IsOptional()
  age?: number;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsNumber()
  @Min(50)
  @Max(300)
  @IsOptional()
  height?: number;

  @IsNumber()
  @Min(20)
  @Max(500)
  @IsOptional()
  weight?: number;

  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;
}
