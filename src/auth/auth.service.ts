import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly profileService: ProfileService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user with transaction to ensure profile creation
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: hashedPassword,
          role: registerDto.role || 'USER',
          isActive: true,
        },
      });

      // Create default profile
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          timezone: 'UTC',
          language: 'en',
          currency: 'USD',
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          twoFactorEnabled: false,
          theme: 'light',
          isProfileComplete: false,
        },
      });

      return { user, profile };
    });

    // Generate tokens
    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.user.role,
    );

    // Create refresh token record
    await this.createRefreshToken(result.user.id, tokens.refreshToken);

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        isActive: result.user.isActive,
        createdAt: result.user.createdAt,
      },
      profile: {
        id: result.profile.id,
        isProfileComplete: result.profile.isProfileComplete,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        profile: {
          select: {
            id: true,
            isProfileComplete: true,
            lastLoginAt: true,
            loginCount: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login and login count
    if (user.profile) {
      await this.profileService.updateLastLogin(user.id);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Create refresh token record
    await this.createRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      profile: user.profile
        ? {
            id: user.profile.id,
            isProfileComplete: user.profile.isProfileComplete,
          }
        : null,
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret:
          this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret-key',
      });

      // Check if refresh token exists in database
      const refreshTokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshTokenDto.refreshToken },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!refreshTokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token is expired
      if (refreshTokenRecord.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({
          where: { id: refreshTokenRecord.id },
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Check if user is still active
      if (!refreshTokenRecord.user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        refreshTokenRecord.user.id,
        refreshTokenRecord.user.email,
        refreshTokenRecord.user.role,
      );

      // Delete old refresh token and create new one
      await this.prisma.$transaction([
        this.prisma.refreshToken.delete({
          where: { id: refreshTokenRecord.id },
        }),
        this.prisma.refreshToken.create({
          data: {
            userId: refreshTokenRecord.user.id,
            token: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        }),
      ]);

      return {
        user: refreshTokenRecord.user,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    // Delete all refresh tokens for the user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    // Get user with current password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      12,
    );

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Delete all refresh tokens to force re-login
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Password changed successfully. Please login again.' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token (you might want to use a different approach for production)
    const resetToken = this.jwtService.sign(
      { userId: user.id, type: 'password-reset' },
      {
        secret:
          this.configService.get('JWT_RESET_SECRET') || 'reset-secret-key',
        expiresIn: '1h',
      },
    );

    // In a real application, you would send this token via email
    // For now, we'll just return it (remove this in production)
    return {
      message: 'Password reset link sent to your email.',
      resetToken: resetToken, // Remove this in production
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // Verify reset token
      const payload = this.jwtService.verify(resetPasswordDto.token, {
        secret:
          this.configService.get('JWT_RESET_SECRET') || 'reset-secret-key',
      });

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 12);

      // Update password
      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      });

      // Delete all refresh tokens
      await this.prisma.refreshToken.deleteMany({
        where: { userId: payload.userId },
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      // Verify email token
      const payload = this.jwtService.verify(verifyEmailDto.token, {
        secret:
          this.configService.get('JWT_EMAIL_SECRET') || 'email-secret-key',
      });

      if (payload.type !== 'email-verification') {
        throw new UnauthorizedException('Invalid verification token');
      }

      // Update user email verification status
      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { emailVerified: true },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resendVerificationDto.email },
    });

    if (!user) {
      return {
        message:
          'If an account with that email exists, a verification link has been sent.',
      };
    }

    if (user.emailVerified) {
      return { message: 'Email is already verified' };
    }

    // Generate verification token
    const verificationToken = this.jwtService.sign(
      { userId: user.id, type: 'email-verification' },
      {
        secret:
          this.configService.get('JWT_EMAIL_SECRET') || 'email-secret-key',
        expiresIn: '24h',
      },
    );

    // In a real application, you would send this token via email
    return {
      message: 'Verification link sent to your email.',
      verificationToken: verificationToken, // Remove this in production
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get('JWT_SECRET') || 'your-secret-key',
          expiresIn: '7d', // Extended from 15m to 7 days
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret:
            this.configService.get('JWT_REFRESH_SECRET') ||
            'refresh-secret-key',
          expiresIn: '30d', // Extended from 7d to 30 days
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async createRefreshToken(userId: number, token: string) {
    return this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
  }
}
