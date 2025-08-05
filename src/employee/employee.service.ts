import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface EmployeeWithProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile: {
    id: number;
    avatar: string | null;
    bio: string | null;
    phoneNumber: string | null;
    jobTitle: string | null;
    company: string | null;
    department: string | null;
    employeeId: string | null;
    hireDate: string | null;
    skills: string | null;
    experience: number | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    timezone: string;
    language: string;
    currency: string;
    lastLoginAt: string | null;
    lastActiveAt: string | null;
    loginCount: number;
    isProfileComplete: boolean;
  } | null;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
  newHires: number;
  departments: { [key: string]: number };
  performance: {
    average: number;
    highPerformers: number;
    lowPerformers: number;
  };
}

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(createData: {
    name: string;
    username: string;
    email: string;
    role: string;
    password: string;
    isActive: boolean;
    profile?: {
      jobTitle?: string;
      company?: string;
      department?: string;
      employeeId?: string;
      hireDate?: string;
      skills?: string;
      experience?: number;
      phoneNumber?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      bio?: string;
    };
  }): Promise<EmployeeWithProfile> {
    // Check if user already exists by email or username
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createData.email },
          { username: createData.username }
        ]
      },
    });

    if (existingUser) {
      if (existingUser.email === createData.email) {
        throw new ConflictException('User with this email already exists');
      }
      if (existingUser.username === createData.username) {
        throw new ConflictException('User with this username already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createData.password, 12);

    // Create user with transaction to ensure profile creation
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          name: createData.name,
          username: createData.username,
          email: createData.email,
          password: hashedPassword,
          role: createData.role as 'OWNER' | 'MANAGER' | 'STOREKEEPER' | 'DEVELOPER' | 'USER' | 'ADMIN' | 'TECHNICIAN',
          isActive: createData.isActive,
        },
      });

      // Create profile with provided data or defaults
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          jobTitle: createData.profile?.jobTitle,
          company: createData.profile?.company,
          department: createData.profile?.department,
          employeeId: createData.profile?.employeeId,
          hireDate: createData.profile?.hireDate ? new Date(createData.profile.hireDate) : undefined,
          skills: createData.profile?.skills,
          experience: createData.profile?.experience,
          phoneNumber: createData.profile?.phoneNumber,
          address: createData.profile?.address,
          city: createData.profile?.city,
          state: createData.profile?.state,
          country: createData.profile?.country,
          bio: createData.profile?.bio,
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

    // Return the created employee with profile
    return {
      id: result.user.id,
      name: result.user.name,
      username: result.user.username,
      email: result.user.email,
      role: result.user.role,
      isActive: result.user.isActive,
      createdAt: result.user.createdAt.toISOString(),
      profile: {
        id: result.profile.id,
        avatar: result.profile.avatar,
        bio: result.profile.bio,
        phoneNumber: result.profile.phoneNumber,
        jobTitle: result.profile.jobTitle,
        company: result.profile.company,
        department: result.profile.department,
        employeeId: result.profile.employeeId,
        hireDate: result.profile.hireDate?.toISOString() || null,
        skills: result.profile.skills,
        experience: result.profile.experience,
        address: result.profile.address,
        city: result.profile.city,
        state: result.profile.state,
        country: result.profile.country,
        timezone: result.profile.timezone,
        language: result.profile.language,
        currency: result.profile.currency,
        lastLoginAt: result.profile.lastLoginAt?.toISOString() || null,
        lastActiveAt: result.profile.lastActiveAt?.toISOString() || null,
        loginCount: result.profile.loginCount,
        isProfileComplete: result.profile.isProfileComplete,
      },
    };
  }

  async getAllEmployees(page: number = 1, limit: number = 10, search?: string, department?: string, status?: string): Promise<{
    data: EmployeeWithProfile[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions: any = {};
    
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { jobTitle: { contains: search, mode: 'insensitive' } } },
        { profile: { company: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        whereConditions.isActive = true;
      } else if (status === 'inactive') {
        whereConditions.isActive = false;
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where: whereConditions,
        include: {
          profile: {
            select: {
              id: true,
              avatar: true,
              bio: true,
              phoneNumber: true,
              jobTitle: true,
              company: true,
              department: true,
              employeeId: true,
              hireDate: true,
              skills: true,
              experience: true,
              address: true,
              city: true,
              state: true,
              country: true,
              timezone: true,
              language: true,
              currency: true,
              lastLoginAt: true,
              lastActiveAt: true,
              loginCount: true,
              isProfileComplete: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: whereConditions }),
    ]);

    return {
      data: users as EmployeeWithProfile[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeById(id: number): Promise<EmployeeWithProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            id: true,
            avatar: true,
            bio: true,
            phoneNumber: true,
            jobTitle: true,
            company: true,
            department: true,
            employeeId: true,
            hireDate: true,
            skills: true,
            experience: true,
            address: true,
            city: true,
            state: true,
            country: true,
            timezone: true,
            language: true,
            currency: true,
            lastLoginAt: true,
            lastActiveAt: true,
            loginCount: true,
            isProfileComplete: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return user as EmployeeWithProfile;
  }

  async updateEmployee(id: number, updateData: {
    name?: string;
    username?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
    profile?: {
      jobTitle?: string;
      company?: string;
      department?: string;
      employeeId?: string;
      hireDate?: string;
      skills?: string;
      experience?: number;
      phoneNumber?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      bio?: string;
    };
  }): Promise<EmployeeWithProfile> {
    // Get current user
    const currentUser = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!currentUser) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Check for email/username conflicts if updating
    if (updateData.email || updateData.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(updateData.email ? [{ email: updateData.email }] : []),
            ...(updateData.username ? [{ username: updateData.username }] : []),
          ],
          NOT: { id }, // Exclude current user
        },
      });

      if (existingUser) {
        if (updateData.email && existingUser.email === updateData.email) {
          throw new ConflictException('User with this email already exists');
        }
        if (updateData.username && existingUser.username === updateData.username) {
          throw new ConflictException('User with this username already exists');
        }
      }
    }

    // Update user data
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.username && { username: updateData.username }),
        ...(updateData.email && { email: updateData.email }),
        ...(updateData.role && { role: updateData.role as any }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
      },
    });

    // Update profile data if provided
    let updatedProfile = currentUser.profile;
    if (updateData.profile) {
      updatedProfile = await this.prisma.profile.update({
        where: { userId: id },
        data: {
          ...(updateData.profile.jobTitle && { jobTitle: updateData.profile.jobTitle }),
          ...(updateData.profile.company && { company: updateData.profile.company }),
          ...(updateData.profile.department && { department: updateData.profile.department }),
          ...(updateData.profile.employeeId && { employeeId: updateData.profile.employeeId }),
          ...(updateData.profile.hireDate && { hireDate: new Date(updateData.profile.hireDate) }),
          ...(updateData.profile.skills && { skills: updateData.profile.skills }),
          ...(updateData.profile.experience && { experience: updateData.profile.experience }),
          ...(updateData.profile.phoneNumber && { phoneNumber: updateData.profile.phoneNumber }),
          ...(updateData.profile.address && { address: updateData.profile.address }),
          ...(updateData.profile.city && { city: updateData.profile.city }),
          ...(updateData.profile.state && { state: updateData.profile.state }),
          ...(updateData.profile.country && { country: updateData.profile.country }),
          ...(updateData.profile.bio && { bio: updateData.profile.bio }),
        },
      });
    }

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt.toISOString(),
      profile: updatedProfile ? {
        id: updatedProfile.id,
        avatar: updatedProfile.avatar,
        bio: updatedProfile.bio,
        phoneNumber: updatedProfile.phoneNumber,
        jobTitle: updatedProfile.jobTitle,
        company: updatedProfile.company,
        department: updatedProfile.department,
        employeeId: updatedProfile.employeeId,
        hireDate: updatedProfile.hireDate?.toISOString() || null,
        skills: updatedProfile.skills,
        experience: updatedProfile.experience,
        address: updatedProfile.address,
        city: updatedProfile.city,
        state: updatedProfile.state,
        country: updatedProfile.country,
        timezone: updatedProfile.timezone,
        language: updatedProfile.language,
        currency: updatedProfile.currency,
        lastLoginAt: updatedProfile.lastLoginAt?.toISOString() || null,
        lastActiveAt: updatedProfile.lastActiveAt?.toISOString() || null,
        loginCount: updatedProfile.loginCount,
        isProfileComplete: updatedProfile.isProfileComplete,
      } : null,
    };
  }

  async getEmployeeStats(): Promise<EmployeeStats> {
    const [
      total,
      active,
      inactive,
      departmentStats,
      performanceStats,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.profile.groupBy({
        by: ['department'],
        _count: { department: true },
        where: { department: { not: null } },
      }),
      this.prisma.profile.aggregate({
        _avg: { experience: true },
        _count: { experience: true },
      }),
    ]);

    // Calculate department distribution
    const departments: { [key: string]: number } = {};
    departmentStats.forEach((stat) => {
      if (stat.department) {
        departments[stat.department] = stat._count.department;
      }
    });

    // Calculate performance metrics
    const avgExperience = performanceStats._avg.experience || 0;
    const totalWithExperience = performanceStats._count.experience || 0;

    return {
      total,
      active,
      inactive,
      onLeave: 0, // This would need additional logic based on your requirements
      newHires: 0, // This would need additional logic based on your requirements
      departments,
      performance: {
        average: avgExperience,
        highPerformers: Math.floor(totalWithExperience * 0.2), // Top 20%
        lowPerformers: Math.floor(totalWithExperience * 0.1), // Bottom 10%
      },
    };
  }

  async getDepartmentDistribution(): Promise<{ department: string; count: number }[]> {
    const stats = await this.prisma.profile.groupBy({
      by: ['department'],
      _count: { department: true },
      where: { department: { not: null } },
    });

    return stats.map((stat) => ({
      department: stat.department || 'Unknown',
      count: stat._count.department,
    }));
  }

  async getPerformanceTrends(): Promise<{ month: string; average: number }[]> {
    // This is a simplified version. In a real application, you'd want to track actual performance metrics
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends = months.map((month, index) => ({
      month,
      average: 85 + Math.floor(Math.random() * 10), // Mock data
    }));

    return trends;
  }
} 