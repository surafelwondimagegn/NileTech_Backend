import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Username (unique)',
    example: 'johndoe',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password (minimum 6 characters)',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
    enum: ['OWNER', 'MANAGER', 'STOREKEEPER', 'DEVELOPER', 'USER', 'ADMIN', 'TECHNICIAN'],
  })
  @IsOptional()
  @IsEnum(['OWNER', 'MANAGER', 'STOREKEEPER', 'DEVELOPER', 'USER', 'ADMIN', 'TECHNICIAN'], {
    message: 'Role must be one of: OWNER, MANAGER, STOREKEEPER, DEVELOPER, USER, ADMIN, TECHNICIAN',
  })
  role?: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email address or username',
    example: 'john@example.com or johndoe',
  })
  @IsString()
  emailOrUsername: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Remember me option',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'newpassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password (optional - if not provided, will skip validation)',
    example: 'oldpassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentPassword?: string; // Made optional

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'newpassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;
}
