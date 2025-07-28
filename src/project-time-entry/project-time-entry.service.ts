import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectTimeEntryDto } from './dto/create-project-time-entry.dto';
import { UpdateProjectTimeEntryDto } from './dto/update-project-time-entry.dto';

@Injectable()
export class ProjectTimeEntryService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectTimeEntryDto: CreateProjectTimeEntryDto) {
    const data = {
      ...createProjectTimeEntryDto,
      startTime: new Date(createProjectTimeEntryDto.startTime),
      endTime: createProjectTimeEntryDto.endTime ? new Date(createProjectTimeEntryDto.endTime) : undefined,
      isActive: createProjectTimeEntryDto.isActive ?? false,
    };

    // Calculate duration if both start and end times are provided
    if (data.startTime && data.endTime) {
      data.duration = Math.floor((data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60));
    }

    return this.prisma.projectTimeEntry.create({
      data,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientName: true,
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

  async findAll(projectId?: number, userId?: number) {
    return this.prisma.projectTimeEntry.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(userId && { userId }),
      },
      orderBy: { startTime: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientName: true,
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

  async findOne(id: number) {
    const timeEntry = await this.prisma.projectTimeEntry.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientName: true,
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
      throw new NotFoundException(`Time entry with ID ${id} not found`);
    }

    return timeEntry;
  }

  async update(id: number, updateProjectTimeEntryDto: UpdateProjectTimeEntryDto) {
    await this.findOne(id);

    const data = {
      ...updateProjectTimeEntryDto,
      startTime: updateProjectTimeEntryDto.startTime ? new Date(updateProjectTimeEntryDto.startTime) : undefined,
      endTime: updateProjectTimeEntryDto.endTime ? new Date(updateProjectTimeEntryDto.endTime) : undefined,
    };

    return this.prisma.projectTimeEntry.update({
      where: { id },
      data,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientName: true,
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
    await this.findOne(id);
    return this.prisma.projectTimeEntry.delete({ where: { id } });
  }

  async stopTimer(id: number) {
    const timeEntry = await this.findOne(id);
    
    if (!timeEntry.isActive) {
      throw new NotFoundException('Time entry is not currently active');
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60));

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
            clientName: true,
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
}