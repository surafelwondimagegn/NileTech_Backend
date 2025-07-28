import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectTimeEntryDto } from './dto/create-project-time-entry.dto';
import { UpdateProjectTimeEntryDto } from './dto/update-project-time-entry.dto';

@Injectable()
export class ProjectTimeEntryService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectTimeEntryDto: CreateProjectTimeEntryDto) {
    const { projectId, userId, description, startTime, endTime, notes } = createProjectTimeEntryDto;

    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Calculate duration if endTime is provided
    let duration: number | null = null;
    if (endTime) {
      duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60));
    }

    return this.prisma.projectTimeEntry.create({
      data: {
        projectId,
        userId: userId!,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        notes,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(query?: any) {
    const { projectId, userId, isActive, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (projectId) where.projectId = parseInt(projectId);
    if (userId) where.userId = parseInt(userId);
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [timeEntries, total] = await Promise.all([
      this.prisma.projectTimeEntry.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.projectTimeEntry.count({ where }),
    ]);

    return {
      data: timeEntries,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: number) {
    const timeEntry = await this.prisma.projectTimeEntry.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!timeEntry) {
      throw new NotFoundException(`Project time entry with ID ${id} not found`);
    }

    return timeEntry;
  }

  async update(id: number, updateProjectTimeEntryDto: UpdateProjectTimeEntryDto) {
    const timeEntry = await this.prisma.projectTimeEntry.findUnique({
      where: { id },
    });

    if (!timeEntry) {
      throw new NotFoundException(`Project time entry with ID ${id} not found`);
    }

    const { description, startTime, endTime, isActive, notes } = updateProjectTimeEntryDto;

    // Calculate duration if endTime is provided
    let duration = timeEntry.duration;
    if (endTime) {
      const start = startTime ? new Date(startTime) : timeEntry.startTime;
      duration = Math.round((new Date(endTime).getTime() - start.getTime()) / (1000 * 60));
    }

    return this.prisma.projectTimeEntry.update({
      where: { id },
      data: {
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        duration,
        isActive,
        notes,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const timeEntry = await this.prisma.projectTimeEntry.findUnique({
      where: { id },
    });

    if (!timeEntry) {
      throw new NotFoundException(`Project time entry with ID ${id} not found`);
    }

    return this.prisma.projectTimeEntry.delete({
      where: { id },
    });
  }

  async stopTimeEntry(id: number) {
    const timeEntry = await this.prisma.projectTimeEntry.findUnique({
      where: { id },
    });

    if (!timeEntry) {
      throw new NotFoundException(`Project time entry with ID ${id} not found`);
    }

    if (!timeEntry.isActive) {
      throw new BadRequestException('Time entry is not active');
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60));

    return this.prisma.projectTimeEntry.update({
      where: { id },
      data: {
        endTime,
        duration,
        isActive: false,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getProjectTimeSummary(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const timeEntries = await this.prisma.projectTimeEntry.findMany({
      where: { projectId },
      select: {
        duration: true,
        isActive: true,
        startTime: true,
        endTime: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalDuration = timeEntries.reduce((sum, entry) => {
      if (entry.duration) return sum + entry.duration;
      if (entry.isActive && entry.startTime) {
        const now = new Date();
        return sum + Math.round((now.getTime() - entry.startTime.getTime()) / (1000 * 60));
      }
      return sum;
    }, 0);

    const activeEntries = timeEntries.filter(entry => entry.isActive);
    const completedEntries = timeEntries.filter(entry => !entry.isActive);

    return {
      projectId,
      projectTitle: project.title,
      totalDuration,
      totalHours: Math.round(totalDuration / 60 * 100) / 100,
      activeEntries: activeEntries.length,
      completedEntries: completedEntries.length,
      timeEntriesByUser: timeEntries.reduce((acc, entry) => {
        const userId = entry.user.id;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: entry.user.name,
            totalDuration: 0,
            activeEntries: 0,
          };
        }
        if (entry.duration) acc[userId].totalDuration += entry.duration;
        if (entry.isActive) acc[userId].activeEntries += 1;
        return acc;
      }, {}),
    };
  }
}