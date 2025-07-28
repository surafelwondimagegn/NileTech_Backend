import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/create-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProfileDto: CreateProfileDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createProfileDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createProfileDto.userId} not found`,
      );
    }

    // Check if profile already exists for this user
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId: createProfileDto.userId },
    });

    if (existingProfile) {
      throw new BadRequestException(
        `Profile already exists for user ID ${createProfileDto.userId}`,
      );
    }

    // Create profile with default values
    const profile = await this.prisma.profile.create({
      data: {
        userId: createProfileDto.userId,
        avatar: createProfileDto.avatar,
        bio: createProfileDto.bio,
        phoneNumber: createProfileDto.phoneNumber,
        dateOfBirth: createProfileDto.dateOfBirth,
        gender: createProfileDto.gender,
        address: createProfileDto.address,
        city: createProfileDto.city,
        state: createProfileDto.state,
        country: createProfileDto.country,
        postalCode: createProfileDto.postalCode,
        timezone: createProfileDto.timezone || 'UTC',
        language: createProfileDto.language || 'en',
        currency: createProfileDto.currency || 'USD',
        jobTitle: createProfileDto.jobTitle,
        company: createProfileDto.company,
        department: createProfileDto.department,
        employeeId: createProfileDto.employeeId,
        hireDate: createProfileDto.hireDate,
        skills: createProfileDto.skills,
        certifications: createProfileDto.certifications,
        experience: createProfileDto.experience,
        website: createProfileDto.website,
        linkedin: createProfileDto.linkedin,
        twitter: createProfileDto.twitter,
        github: createProfileDto.github,
        facebook: createProfileDto.facebook,
        instagram: createProfileDto.instagram,
        emailNotifications:
          createProfileDto.emailNotifications !== undefined
            ? createProfileDto.emailNotifications
            : true,
        smsNotifications:
          createProfileDto.smsNotifications !== undefined
            ? createProfileDto.smsNotifications
            : false,
        pushNotifications:
          createProfileDto.pushNotifications !== undefined
            ? createProfileDto.pushNotifications
            : true,
        twoFactorEnabled:
          createProfileDto.twoFactorEnabled !== undefined
            ? createProfileDto.twoFactorEnabled
            : false,
        theme: createProfileDto.theme || 'light',
        emergencyContactName: createProfileDto.emergencyContactName,
        emergencyContactPhone: createProfileDto.emergencyContactPhone,
        emergencyContactEmail: createProfileDto.emergencyContactEmail,
        emergencyContactRelation: createProfileDto.emergencyContactRelation,
        isProfileComplete: this.isProfileComplete(createProfileDto),
      },
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

    return profile;
  }

  async findAll(page?: number, limit?: number) {
    const skip = page && limit ? (page - 1) * limit : 0;
    const take = limit || 10;

    const [profiles, total] = await Promise.all([
      this.prisma.profile.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.profile.count(),
    ]);

    return {
      data: profiles,
      meta: {
        total,
        page: page || 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    return profile;
  }

  async findByUserId(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { id },
      data: {
        avatar: updateProfileDto.avatar,
        bio: updateProfileDto.bio,
        phoneNumber: updateProfileDto.phoneNumber,
        dateOfBirth: updateProfileDto.dateOfBirth,
        gender: updateProfileDto.gender,
        address: updateProfileDto.address,
        city: updateProfileDto.city,
        state: updateProfileDto.state,
        country: updateProfileDto.country,
        postalCode: updateProfileDto.postalCode,
        timezone: updateProfileDto.timezone,
        language: updateProfileDto.language,
        currency: updateProfileDto.currency,
        jobTitle: updateProfileDto.jobTitle,
        company: updateProfileDto.company,
        department: updateProfileDto.department,
        employeeId: updateProfileDto.employeeId,
        hireDate: updateProfileDto.hireDate,
        skills: updateProfileDto.skills,
        certifications: updateProfileDto.certifications,
        experience: updateProfileDto.experience,
        website: updateProfileDto.website,
        linkedin: updateProfileDto.linkedin,
        twitter: updateProfileDto.twitter,
        github: updateProfileDto.github,
        facebook: updateProfileDto.facebook,
        instagram: updateProfileDto.instagram,
        emailNotifications: updateProfileDto.emailNotifications,
        smsNotifications: updateProfileDto.smsNotifications,
        pushNotifications: updateProfileDto.pushNotifications,
        twoFactorEnabled: updateProfileDto.twoFactorEnabled,
        theme: updateProfileDto.theme,
        emergencyContactName: updateProfileDto.emergencyContactName,
        emergencyContactPhone: updateProfileDto.emergencyContactPhone,
        emergencyContactEmail: updateProfileDto.emergencyContactEmail,
        emergencyContactRelation: updateProfileDto.emergencyContactRelation,
        isProfileComplete: this.isProfileComplete({
          ...existingProfile,
          ...updateProfileDto,
        }),
      },
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

    return updatedProfile;
  }

  async updateByUserId(userId: number, updateProfileDto: UpdateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    return this.update(existingProfile.id, updateProfileDto);
  }

  async remove(id: number) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    await this.prisma.profile.delete({
      where: { id },
    });

    return { message: 'Profile deleted successfully' };
  }

  async removeByUserId(userId: number) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    return this.remove(existingProfile.id);
  }

  async updateLastLogin(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    return this.prisma.profile.update({
      where: { userId },
      data: {
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        loginCount: {
          increment: 1,
        },
      },
    });
  }

  async updateLastActive(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    return this.prisma.profile.update({
      where: { userId },
      data: {
        lastActiveAt: new Date(),
      },
    });
  }

  async getProfileStats() {
    const [
      totalProfiles,
      completeProfiles,
      incompleteProfiles,
      activeUsers,
      inactiveUsers,
    ] = await Promise.all([
      this.prisma.profile.count(),
      this.prisma.profile.count({ where: { isProfileComplete: true } }),
      this.prisma.profile.count({ where: { isProfileComplete: false } }),
      this.prisma.profile.count({
        where: {
          user: {
            isActive: true,
          },
        },
      }),
      this.prisma.profile.count({
        where: {
          user: {
            isActive: false,
          },
        },
      }),
    ]);

    return {
      total: totalProfiles,
      complete: completeProfiles,
      incomplete: incompleteProfiles,
      activeUsers,
      inactiveUsers,
      completionRate:
        totalProfiles > 0 ? (completeProfiles / totalProfiles) * 100 : 0,
    };
  }

  private isProfileComplete(profileData: any): boolean {
    // Define what makes a profile "complete"
    const requiredFields = [
      'phoneNumber',
      'dateOfBirth',
      'gender',
      'address',
      'city',
      'country',
      'jobTitle',
      'company',
    ];

    return requiredFields.every(
      (field) =>
        profileData[field] && profileData[field].toString().trim() !== '',
    );
  }
}
