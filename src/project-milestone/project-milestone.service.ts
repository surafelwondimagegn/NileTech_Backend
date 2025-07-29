import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectMilestoneDto } from './dto/create-project-milestone.dto';
import { UpdateProjectMilestoneDto } from './dto/update-project-milestone.dto';

@Injectable()
export class ProjectMilestoneService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectMilestoneDto: CreateProjectMilestoneDto) {
    const { projectId, title, description, dueDate, order } = createProjectMilestoneDto;

    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // If order is not provided, get the next order number
    let milestoneOrder = order;
    if (!milestoneOrder) {
      const lastMilestone = await this.prisma.projectMilestone.findFirst({
        where: { projectId },
        orderBy: { order: 'desc' },
      });
      milestoneOrder = lastMilestone ? lastMilestone.order + 1 : 1;
    }

    return this.prisma.projectMilestone.create({
      data: {
        projectId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: milestoneOrder,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async findAll(query?: any) {
    const { projectId, isCompleted, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (projectId) where.projectId = parseInt(projectId);
    if (isCompleted !== undefined) where.isCompleted = isCompleted === 'true';

    const [milestones, total] = await Promise.all([
      this.prisma.projectMilestone.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { order: 'asc' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.projectMilestone.count({ where }),
    ]);

    return {
      data: milestones,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: number) {
    const milestone = await this.prisma.projectMilestone.findUnique({
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
      },
    });

    if (!milestone) {
      throw new NotFoundException(`Project milestone with ID ${id} not found`);
    }

    return milestone;
  }

  async update(id: number, updateProjectMilestoneDto: UpdateProjectMilestoneDto) {
    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      throw new NotFoundException(`Project milestone with ID ${id} not found`);
    }

    const { title, description, dueDate, progress, isCompleted, order } = updateProjectMilestoneDto;

    // If marking as completed, set completedAt
    let completedAt = milestone.completedAt;
    if (isCompleted && !milestone.isCompleted) {
      completedAt = new Date();
    } else if (!isCompleted && milestone.isCompleted) {
      completedAt = null;
    }

    return this.prisma.projectMilestone.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        progress,
        isCompleted,
        completedAt,
        order,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      throw new NotFoundException(`Project milestone with ID ${id} not found`);
    }

    return this.prisma.projectMilestone.delete({
      where: { id },
    });
  }

  async completeMilestone(id: number) {
    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      throw new NotFoundException(`Project milestone with ID ${id} not found`);
    }

    if (milestone.isCompleted) {
      throw new BadRequestException('Milestone is already completed');
    }

    return this.prisma.projectMilestone.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        progress: 100,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async updateProgress(id: number, progress: number) {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      throw new NotFoundException(`Project milestone with ID ${id} not found`);
    }

    const isCompleted = progress === 100;
    const completedAt = isCompleted ? new Date() : milestone.completedAt;

    return this.prisma.projectMilestone.update({
      where: { id },
      data: {
        progress,
        isCompleted,
        completedAt,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async getProjectMilestones(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const milestones = await this.prisma.projectMilestone.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    const completedCount = milestones.filter(m => m.isCompleted).length;
    const totalCount = milestones.length;
    const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      projectId,
      projectTitle: project.title,
      milestones,
      summary: {
        total: totalCount,
        completed: completedCount,
        pending: totalCount - completedCount,
        overallProgress,
      },
    };
  }
}