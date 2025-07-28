import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectUpdateDto } from './dto/create-project-update.dto';
import { UpdateProjectUpdateDto } from './dto/update-project-update.dto';

@Injectable()
export class ProjectUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectUpdateDto: CreateProjectUpdateDto) {
    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: createProjectUpdateDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${createProjectUpdateDto.projectId} not found`,
      );
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createProjectUpdateDto.createdBy },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createProjectUpdateDto.createdBy} not found`,
      );
    }

    const projectUpdate = await this.prisma.projectUpdate.create({
      data: createProjectUpdateDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return projectUpdate;
  }

  async findAll(
    projectId?: number,
    type?: string,
    page?: number,
    limit?: number,
  ) {
    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (type) {
      where.type = type;
    }

    const skip = page && limit ? (page - 1) * limit : 0;
    const take = limit || 10;

    const [updates, total] = await Promise.all([
      this.prisma.projectUpdate.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.projectUpdate.count({ where }),
    ]);

    return {
      data: updates,
      meta: {
        total,
        page: page || 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: number) {
    const projectUpdate = await this.prisma.projectUpdate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!projectUpdate) {
      throw new NotFoundException(`Project update with ID ${id} not found`);
    }

    return projectUpdate;
  }

  async findByProject(projectId: number) {
    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const updates = await this.prisma.projectUpdate.findMany({
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
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return updates;
  }

  async findByType(type: string) {
    try {
      return await this.prisma.projectUpdate.findMany({
        where: { type },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              clientName: true,
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Unexpected error in project update findByType:', error);
      throw new BadRequestException(
        'Failed to retrieve project updates by type. Please try again.',
      );
    }
  }

  async update(id: number, updateProjectUpdateDto: UpdateProjectUpdateDto) {
    // Verify project update exists
    const existingUpdate = await this.prisma.projectUpdate.findUnique({
      where: { id },
    });

    if (!existingUpdate) {
      throw new NotFoundException(`Project update with ID ${id} not found`);
    }

    // If projectId is being updated, verify the new project exists
    if (updateProjectUpdateDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: updateProjectUpdateDto.projectId },
      });

      if (!project) {
        throw new NotFoundException(
          `Project with ID ${updateProjectUpdateDto.projectId} not found`,
        );
      }
    }

    // If createdBy is being updated, verify the new user exists
    if (updateProjectUpdateDto.createdBy) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateProjectUpdateDto.createdBy },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${updateProjectUpdateDto.createdBy} not found`,
        );
      }
    }

    const updatedProjectUpdate = await this.prisma.projectUpdate.update({
      where: { id },
      data: updateProjectUpdateDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return updatedProjectUpdate;
  }

  async remove(id: number) {
    // Verify project update exists
    const existingUpdate = await this.prisma.projectUpdate.findUnique({
      where: { id },
    });

    if (!existingUpdate) {
      throw new NotFoundException(`Project update with ID ${id} not found`);
    }

    await this.prisma.projectUpdate.delete({
      where: { id },
    });

    return { message: 'Project update deleted successfully' };
  }
}
