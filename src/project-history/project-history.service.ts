import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectHistoryDto } from './dto/create-project-history.dto';

@Injectable()
export class ProjectHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectHistoryDto: CreateProjectHistoryDto) {
    const { projectId, action, details, oldValue, newValue, createdBy } = createProjectHistoryDto;

    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createdBy },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${createdBy} not found`);
    }

    return this.prisma.projectHistory.create({
      data: {
        projectId,
        action,
        details,
        oldValue,
        newValue,
        createdBy,
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
    const { projectId, action, createdBy, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (projectId) where.projectId = parseInt(projectId);
    if (action) where.action = action;
    if (createdBy) where.createdBy = parseInt(createdBy);

    const [history, total] = await Promise.all([
      this.prisma.projectHistory.findMany({
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
      this.prisma.projectHistory.count({ where }),
    ]);

    return {
      data: history,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: number) {
    const history = await this.prisma.projectHistory.findUnique({
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

    if (!history) {
      throw new NotFoundException(`Project history with ID ${id} not found`);
    }

    return history;
  }

  async getProjectHistory(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const history = await this.prisma.projectHistory.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Group history by action type
    const groupedHistory = history.reduce((acc, item) => {
      if (!acc[item.action]) {
        acc[item.action] = [];
      }
      acc[item.action].push(item);
      return acc;
    }, {});

    return {
      projectId,
      projectTitle: project.title,
      history,
      groupedHistory,
      summary: {
        total: history.length,
        actions: Object.keys(groupedHistory),
        latestActivity: history[0]?.createdAt || null,
      },
    };
  }

  async getProjectTimeline(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const history = await this.prisma.projectHistory.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create timeline with milestones
    const timeline = history.map(item => ({
      id: item.id,
      date: item.createdAt,
      action: item.action,
      details: item.details,
      oldValue: item.oldValue,
      newValue: item.newValue,
      user: item.user,
    }));

    return {
      projectId,
      projectTitle: project.title,
      timeline,
      summary: {
        totalEvents: timeline.length,
        dateRange: timeline.length > 0 ? {
          start: timeline[0]?.date,
          end: timeline[timeline.length - 1]?.date,
        } : null,
      },
    };
  }

  async logProjectEvent(projectId: number, action: string, details: string, createdBy: number, oldValue?: string, newValue?: string) {
    return this.create({
      projectId,
      action,
      details,
      oldValue,
      newValue,
      createdBy,
    });
  }
}