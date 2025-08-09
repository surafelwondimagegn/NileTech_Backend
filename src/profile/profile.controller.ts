import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/create-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const avatarStorage = diskStorage({
  destination: './uploads/profile',
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  },
});

@ApiTags('profile')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar', {
    storage: avatarStorage,
    fileFilter: (_req, file, cb) => {
      cb(file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/) ? null : new BadRequestException('Only image files allowed'), true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @ApiOperation({ summary: 'Create a new profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
    schema: {
      example: {
        id: 1,
        userId: 1,
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Software developer with 5 years of experience',
        phoneNumber: '+1234567890',
        dateOfBirth: '1990-01-01T00:00:00.000Z',
        gender: 'MALE',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        timezone: 'UTC',
        language: 'en',
        currency: 'USD',
        jobTitle: 'Senior Developer',
        company: 'Tech Corp',
        department: 'Engineering',
        employeeId: 'EMP001',
        hireDate: '2020-01-01T00:00:00.000Z',
        skills: '["JavaScript", "TypeScript", "Node.js"]',
        certifications: '["AWS Certified", "Google Cloud"]',
        experience: 5,
        website: 'https://example.com',
        linkedin: 'https://linkedin.com/in/example',
        twitter: 'https://twitter.com/example',
        github: 'https://github.com/example',
        facebook: 'https://facebook.com/example',
        instagram: 'https://instagram.com/example',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        twoFactorEnabled: false,
        theme: 'light',
        emergencyContactName: 'John Doe',
        emergencyContactPhone: '+1234567890',
        emergencyContactEmail: 'emergency@example.com',
        emergencyContactRelation: 'Spouse',
        lastLoginAt: null,
        lastActiveAt: null,
        loginCount: 0,
        isProfileComplete: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Profile already exists',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateProfileDto,
         @UploadedFile() avatar?: Express.Multer.File) {
    if (avatar) {
      createProfileDto.avatar = `/uploads/profile/${avatar.filename}`;
    }
    return this.profileService.create(createProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all profiles with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Profiles retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            userId: 1,
            avatar: 'https://example.com/avatar.jpg',
            bio: 'Software developer',
            phoneNumber: '+1234567890',
            jobTitle: 'Senior Developer',
            company: 'Tech Corp',
            isProfileComplete: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            user: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              role: 'USER',
              isActive: true,
            },
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.profileService.findAll(page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get profile statistics' })
  @ApiResponse({
    status: 200,
    description: 'Profile statistics retrieved successfully',
    schema: {
      example: {
        total: 100,
        complete: 75,
        incomplete: 25,
        activeUsers: 90,
        inactiveUsers: 10,
        completionRate: 75.0,
      },
    },
  })
  getStats() {
    return this.profileService.getProfileStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a profile by ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(+id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get a profile by user ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.profileService.findByUserId(+userId);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  getMyProfile(@Request() req) {
    return this.profileService.findByUserId(req.user.id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: avatarStorage,
    fileFilter: (_req, file, cb) => {
      cb(file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/) ? null : new BadRequestException('Only image files allowed'), true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @ApiOperation({ summary: 'Update a profile by ID' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto,
         @UploadedFile() avatar?: Express.Multer.File) {
    if (avatar) {
      updateProfileDto.avatar = `/uploads/profile/${avatar.filename}`;
    }
    return this.profileService.update(+id, updateProfileDto);
  }

  @Patch('user/:userId')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: avatarStorage,
    fileFilter: (_req, file, cb) => {
      cb(file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/) ? null : new BadRequestException('Only image files allowed'), true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @ApiOperation({ summary: 'Update a profile by user ID' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  updateByUserId(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    if (avatar) {
      updateProfileDto.avatar = `/uploads/profile/${avatar.filename}`;
    }
    return this.profileService.updateByUserId(+userId, updateProfileDto);
  }

  @Patch('me/profile')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: avatarStorage,
    fileFilter: (_req, file, cb) => {
      cb(file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/) ? null : new BadRequestException('Only image files allowed'), true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  updateMyProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File) {
    if (avatar) {
      updateProfileDto.avatar = `/uploads/profile/${avatar.filename}`;
    }
    return this.profileService.updateByUserId(req.user.id, updateProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a profile by ID' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Delete a profile by user ID' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  removeByUserId(@Param('userId') userId: string) {
    return this.profileService.removeByUserId(+userId);
  }

  @Delete('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Delete current user profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  removeMyProfile(@Request() req) {
    return this.profileService.removeByUserId(req.user.id);
  }
}
