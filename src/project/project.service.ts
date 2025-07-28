import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProjectDto,
  ProjectServiceDto,
  ProjectProductDto,
  CreateProjectWithInvoiceDto,
  CreateProjectWithoutInvoiceDto,
  ProjectMilestoneDto,
  ProjectPriority,
} from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  StartProjectDto,
  CompleteProjectDto,
  CancelProjectDto,
  ProjectStatusResponseDto,
} from './dto/project-status.dto';
import {
  UpdateProgressDto,
  StartTimeEntryDto,
  StopTimeEntryDto,
  CreateTimeEntryDto,
  UpdateMilestoneDto,
  ProjectTimeEntryResponseDto,
  ProjectMilestoneResponseDto,
  ProjectTrackingResponseDto,
} from './dto/project-tracking.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== PROJECT CREATION ====================

  async create(createProjectDto: CreateProjectDto, createdBy: number) {
    return this.createWithInvoice(createProjectDto, createdBy);
  }

  async createWithInvoice(
    createProjectDto: CreateProjectWithInvoiceDto,
    createdBy: number,
  ) {
    // Verify client exists
    const client = await this.prisma.user.findUnique({
      where: { id: createProjectDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with ID ${createProjectDto.clientId} not found`,
      );
    }

    // Verify assigned user exists if provided
    if (createProjectDto.assignedToId) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: createProjectDto.assignedToId },
      });

      if (!assignedUser) {
        throw new NotFoundException(
          `User with ID ${createProjectDto.assignedToId} not found`,
        );
      }
    }

    // Calculate estimated time in minutes if hours provided
    let timeEstimated = createProjectDto.timeEstimated;
    if (createProjectDto.estimatedHours && !timeEstimated) {
      timeEstimated = createProjectDto.estimatedHours * 60;
    }

    // Create project with transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the project
      const newProject = await prisma.project.create({
        data: {
          title: createProjectDto.title,
          description: createProjectDto.description,
          clientName: createProjectDto.clientName,
          clientEmail: createProjectDto.clientEmail,
          clientPhone: createProjectDto.clientPhone,
          clientId: createProjectDto.clientId,
          budgetId: createProjectDto.budgetId,
          assignedToId: createProjectDto.assignedToId,
          status: createProjectDto.status || 'PENDING',
          priority: createProjectDto.priority || 'MEDIUM',
          estimatedHours: createProjectDto.estimatedHours,
          timeEstimated: timeEstimated,
          progress: createProjectDto.progress || 0,
          startedAt: createProjectDto.startedAt,
          finishedAt: createProjectDto.finishedAt,
          deadline: createProjectDto.deadline,
          notes: createProjectDto.notes,
          clientFeedback: createProjectDto.clientFeedback,
          internalNotes: createProjectDto.internalNotes,
          isPublic: createProjectDto.isPublic ?? true,
          allowClientUpdates: createProjectDto.allowClientUpdates ?? false,
          lastUpdatedBy: createdBy,
          lastActivityAt: new Date(),
        },
      });

      // Create milestones if provided
      if (
        createProjectDto.milestones &&
        createProjectDto.milestones.length > 0
      ) {
        await Promise.all(
          createProjectDto.milestones.map((milestone, index) =>
            prisma.projectMilestone.create({
              data: {
                projectId: newProject.id,
                title: milestone.title,
                description: milestone.description,
                dueDate: milestone.dueDate,
                order: milestone.order || index + 1,
              },
            }),
          ),
        );
      }

      // Create services if provided
      let createdServices: any[] = [];
      if (createProjectDto.services && createProjectDto.services.length > 0) {
        createdServices = await Promise.all(
          createProjectDto.services.map(async (service) => {
            let serviceId = service.serviceId;

            // If serviceId is 0, create a new service
            if (service.serviceId === 0) {
              if (!service.serviceName || !service.serviceDescription) {
                throw new BadRequestException(
                  'Service name and description are required when creating a new service',
                );
              }

              const newService = await prisma.service.create({
                data: {
                  name: service.serviceName,
                  description: service.serviceDescription,
                  price: service.unitPrice || 0,
                  cost: service.unitCost || 0,
                  isActive: true,
                },
              });
              serviceId = newService.id;
            } else {
              // Verify existing service exists
              const existingService = await prisma.service.findUnique({
                where: { id: service.serviceId },
              });
              if (!existingService) {
                throw new NotFoundException(
                  `Service with ID ${service.serviceId} not found`,
                );
              }
            }

            return prisma.projectService.create({
              data: {
                projectId: newProject.id,
                serviceId: serviceId,
                quantity: service.quantity,
                unitPrice: service.unitPrice,
                unitCost: service.unitCost,
                discount: service.discount || 0,
                status: service.status || 'PENDING',
                startDate: service.startDate,
                endDate: service.endDate,
                assignedTo: service.assignedTo,
                notes: service.notes,
              },
              include: {
                service: true,
                assignedToUser: true,
              },
            });
          }),
        );
      }

      // Create products if provided
      let createdProducts: any[] = [];
      if (createProjectDto.products && createProjectDto.products.length > 0) {
        createdProducts = await Promise.all(
          createProjectDto.products.map(async (product) => {
            let productId = product.productId;

            // If productId is 0, create a new product
            if (product.productId === 0) {
              if (!product.productName || !product.productDescription) {
                throw new BadRequestException(
                  'Product name and description are required when creating a new product',
                );
              }

              const newProduct = await prisma.product.create({
                data: {
                  name: product.productName,
                  description: product.productDescription,
                  buyingPrice: product.unitCost || 0,
                  sellingPrice: product.unitPrice || 0,
                  stock: 0,
                  isActive: true,
                },
              });
              productId = newProduct.id;
            } else {
              // Verify existing product exists
              const existingProduct = await prisma.product.findUnique({
                where: { id: product.productId },
              });
              if (!existingProduct) {
                throw new NotFoundException(
                  `Product with ID ${product.productId} not found`,
                );
              }
            }

            return prisma.projectProduct.create({
              data: {
                projectId: newProject.id,
                productId: productId,
                quantity: product.quantity,
                unitPrice: product.unitPrice,
                unitCost: product.unitCost,
                discount: product.discount || 0,
                status: product.status || 'PENDING',
                orderDate: product.orderDate,
                receivedDate: product.receivedDate,
                installedDate: product.installedDate,
                notes: product.notes,
              },
              include: {
                product: true,
              },
            });
          }),
        );
      }

      // Create automatic invoice if services or products are provided
      let invoice: any = null;
      let invoiceItems: any[] = [];
      if (
        (createProjectDto.services && createProjectDto.services.length > 0) ||
        (createProjectDto.products && createProjectDto.products.length > 0)
      ) {
        invoice = await this.createProjectInvoiceWithPrisma(
          prisma,
          newProject.id,
          createdBy,
          createProjectDto.invoiceNotes,
        );

        // Get the created invoice items
        invoiceItems = await prisma.invoiceItem.findMany({
          where: { invoiceId: invoice.id },
          include: {
            service: true,
            product: true,
          },
        });
      }

      // Create project history entry
      await prisma.projectHistory.create({
        data: {
          projectId: newProject.id,
          action: 'CREATED',
          details: JSON.stringify({
            servicesCount: createProjectDto.services?.length || 0,
            productsCount: createProjectDto.products?.length || 0,
            milestonesCount: createProjectDto.milestones?.length || 0,
            invoiceCreated: !!invoice,
            invoiceId: invoice?.id,
          }),
          createdBy: createdBy,
        },
      });

      return { 
        project: newProject, 
        invoice,
        services: createdServices,
        products: createdProducts,
        invoiceItems: invoiceItems,
      };
    });

    return result;
  }

  async createWithoutInvoice(
    createProjectDto: CreateProjectWithoutInvoiceDto,
    createdBy: number,
  ) {
    // Verify client exists
    const client = await this.prisma.user.findUnique({
      where: { id: createProjectDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with ID ${createProjectDto.clientId} not found`,
      );
    }

    // Calculate estimated time in minutes if hours provided
    let timeEstimated = createProjectDto.timeEstimated;
    if (createProjectDto.estimatedHours && !timeEstimated) {
      timeEstimated = createProjectDto.estimatedHours * 60;
    }

    // Create project with transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the project
      const newProject = await prisma.project.create({
        data: {
          title: createProjectDto.title,
          description: createProjectDto.description,
          clientName: createProjectDto.clientName,
          clientEmail: createProjectDto.clientEmail,
          clientPhone: createProjectDto.clientPhone,
          clientId: createProjectDto.clientId,
          budgetId: createProjectDto.budgetId,
          assignedToId: createProjectDto.assignedToId,
          status: createProjectDto.status || 'PENDING',
          priority: createProjectDto.priority || 'MEDIUM',
          estimatedHours: createProjectDto.estimatedHours,
          timeEstimated: timeEstimated,
          progress: createProjectDto.progress || 0,
          startedAt: createProjectDto.startedAt,
          finishedAt: createProjectDto.finishedAt,
          deadline: createProjectDto.deadline,
          notes: createProjectDto.notes,
          clientFeedback: createProjectDto.clientFeedback,
          internalNotes: createProjectDto.internalNotes,
          isPublic: createProjectDto.isPublic ?? true,
          allowClientUpdates: createProjectDto.allowClientUpdates ?? false,
          lastUpdatedBy: createdBy,
          lastActivityAt: new Date(),
        },
      });

      // Create milestones if provided
      if (
        createProjectDto.milestones &&
        createProjectDto.milestones.length > 0
      ) {
        await Promise.all(
          createProjectDto.milestones.map((milestone, index) =>
            prisma.projectMilestone.create({
              data: {
                projectId: newProject.id,
                title: milestone.title,
                description: milestone.description,
                dueDate: milestone.dueDate,
                order: milestone.order || index + 1,
              },
            }),
          ),
        );
      }

      // Create services if provided
      let createdServices: any[] = [];
      if (createProjectDto.services && createProjectDto.services.length > 0) {
        createdServices = await Promise.all(
          createProjectDto.services.map(async (service) => {
            let serviceId = service.serviceId;

            // If serviceId is 0, create a new service
            if (service.serviceId === 0) {
              if (!service.serviceName || !service.serviceDescription) {
                throw new BadRequestException(
                  'Service name and description are required when creating a new service',
                );
              }

              const newService = await prisma.service.create({
                data: {
                  name: service.serviceName,
                  description: service.serviceDescription,
                  price: service.unitPrice || 0,
                  cost: service.unitCost || 0,
                  isActive: true,
                },
              });
              serviceId = newService.id;
            } else {
              // Verify existing service exists
              const existingService = await prisma.service.findUnique({
                where: { id: service.serviceId },
              });
              if (!existingService) {
                throw new NotFoundException(
                  `Service with ID ${service.serviceId} not found`,
                );
              }
            }

            return prisma.projectService.create({
              data: {
                projectId: newProject.id,
                serviceId: serviceId,
                quantity: service.quantity,
                unitPrice: service.unitPrice,
                unitCost: service.unitCost,
                discount: service.discount || 0,
                status: service.status || 'PENDING',
                startDate: service.startDate,
                endDate: service.endDate,
                assignedTo: service.assignedTo,
                notes: service.notes,
              },
              include: {
                service: true,
                assignedToUser: true,
              },
            });
          }),
        );
      }

      // Create products if provided
      let createdProducts: any[] = [];
      if (createProjectDto.products && createProjectDto.products.length > 0) {
        createdProducts = await Promise.all(
          createProjectDto.products.map(async (product) => {
            let productId = product.productId;

            // If productId is 0, create a new product
            if (product.productId === 0) {
              if (!product.productName || !product.productDescription) {
                throw new BadRequestException(
                  'Product name and description are required when creating a new product',
                );
              }

              const newProduct = await prisma.product.create({
                data: {
                  name: product.productName,
                  description: product.productDescription,
                  buyingPrice: product.unitCost || 0,
                  sellingPrice: product.unitPrice || 0,
                  stock: 0,
                  isActive: true,
                },
              });
              productId = newProduct.id;
            } else {
              // Verify existing product exists
              const existingProduct = await prisma.product.findUnique({
                where: { id: product.productId },
              });
              if (!existingProduct) {
                throw new NotFoundException(
                  `Product with ID ${product.productId} not found`,
                );
              }
            }

            return prisma.projectProduct.create({
              data: {
                projectId: newProject.id,
                productId: productId,
                quantity: product.quantity,
                unitPrice: product.unitPrice,
                unitCost: product.unitCost,
                discount: product.discount || 0,
                status: product.status || 'PENDING',
                orderDate: product.orderDate,
                receivedDate: product.receivedDate,
                installedDate: product.installedDate,
                notes: product.notes,
              },
              include: {
                product: true,
              },
            });
          }),
        );
      }

      // Create project history entry
      await prisma.projectHistory.create({
        data: {
          projectId: newProject.id,
          action: 'CREATED',
          details: JSON.stringify({
            servicesCount: createProjectDto.services?.length || 0,
            productsCount: createProjectDto.products?.length || 0,
            milestonesCount: createProjectDto.milestones?.length || 0,
            invoiceCreated: false,
          }),
          createdBy: createdBy,
        },
      });

      return { 
        project: newProject,
        services: createdServices,
        products: createdProducts,
      };
    });

    return result;
  }

  // ==================== PROJECT TRACKING ====================

  async updateProgress(
    projectId: number,
    updateProgressDto: UpdateProgressDto,
    updatedBy: number,
  ): Promise<ProjectTrackingResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        timeEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const oldProgress = project.progress;
    const newProgress = updateProgressDto.progress;

    // Update project progress
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        progress: newProgress,
        lastActivityAt: new Date(),
        lastUpdatedBy: updatedBy,
      },
    });

    // Create history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'PROGRESS_UPDATED',
        oldValue: oldProgress.toString(),
        newValue: newProgress.toString(),
        details: JSON.stringify({
          notes: updateProgressDto.notes,
          progressChange: newProgress - oldProgress,
        }),
        createdBy: updatedBy,
      },
    });

    return this.getProjectTracking(projectId);
  }

  async startTimeEntry(
    projectId: number,
    startTimeEntryDto: StartTimeEntryDto,
    userId: number,
  ): Promise<ProjectTimeEntryResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if user already has an active time entry for this project
    const activeEntry = await this.prisma.projectTimeEntry.findFirst({
      where: {
        projectId: projectId,
        userId: userId,
        isActive: true,
      },
    });

    if (activeEntry) {
      throw new BadRequestException(
        'You already have an active time entry for this project',
      );
    }

    const startTime = startTimeEntryDto.startTime || new Date();

    const timeEntry = await this.prisma.projectTimeEntry.create({
      data: {
        projectId: projectId,
        userId: userId,
        description: startTimeEntryDto.description,
        startTime: startTime,
        isActive: true,
        notes: startTimeEntryDto.notes,
      },
      include: {
        user: true,
      },
    });

    // Update project last activity
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        lastActivityAt: new Date(),
        lastUpdatedBy: userId,
      },
    });

    return this.mapTimeEntryToResponse(timeEntry);
  }

  async stopTimeEntry(
    projectId: number,
    stopTimeEntryDto: StopTimeEntryDto,
    userId: number,
  ): Promise<ProjectTimeEntryResponseDto> {
    const activeEntry = await this.prisma.projectTimeEntry.findFirst({
      where: {
        projectId: projectId,
        userId: userId,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    if (!activeEntry) {
      throw new BadRequestException(
        'No active time entry found for this project',
      );
    }

    const endTime = stopTimeEntryDto.endTime || new Date();
    const duration = Math.round(
      (endTime.getTime() - activeEntry.startTime.getTime()) / (1000 * 60),
    ); // Duration in minutes

    const updatedEntry = await this.prisma.projectTimeEntry.update({
      where: { id: activeEntry.id },
      data: {
        endTime: endTime,
        duration: duration,
        isActive: false,
        notes: activeEntry.notes
          ? `${activeEntry.notes}\n${stopTimeEntryDto.notes || ''}`
          : stopTimeEntryDto.notes,
      },
      include: {
        user: true,
      },
    });

    // Update project time spent
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        timeSpent: { increment: duration },
        lastActivityAt: new Date(),
        lastUpdatedBy: userId,
      },
    });

    // Create history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'TIME_LOGGED',
        details: JSON.stringify({
          duration: duration,
          description: activeEntry.description,
          notes: stopTimeEntryDto.notes,
        }),
        createdBy: userId,
      },
    });

    return this.mapTimeEntryToResponse(updatedEntry);
  }

  async createTimeEntry(
    projectId: number,
    createTimeEntryDto: CreateTimeEntryDto,
    userId: number,
  ): Promise<ProjectTimeEntryResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    let duration = createTimeEntryDto.duration;
    if (!duration) {
      const startTime = new Date(createTimeEntryDto.startTime);
      const endTime = new Date(createTimeEntryDto.endTime);
      duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60),
      );
    }

    const timeEntry = await this.prisma.projectTimeEntry.create({
      data: {
        projectId: projectId,
        userId: userId,
        description: createTimeEntryDto.description,
        startTime: new Date(createTimeEntryDto.startTime),
        endTime: new Date(createTimeEntryDto.endTime),
        duration: duration,
        isActive: false,
        notes: createTimeEntryDto.notes,
      },
      include: {
        user: true,
      },
    });

    // Update project time spent
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        timeSpent: { increment: duration },
        lastActivityAt: new Date(),
        lastUpdatedBy: userId,
      },
    });

    // Create history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'TIME_LOGGED',
        details: JSON.stringify({
          duration: duration,
          description: createTimeEntryDto.description,
          notes: createTimeEntryDto.notes,
        }),
        createdBy: userId,
      },
    });

    return this.mapTimeEntryToResponse(timeEntry);
  }

  async getProjectTracking(
    projectId: number,
  ): Promise<ProjectTrackingResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        timeEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const timeEfficiency = project.timeEstimated
      ? Math.round((project.timeSpent / project.timeEstimated) * 100)
      : 0;

    const daysRemaining = project.deadline
      ? Math.ceil(
          (project.deadline.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : undefined;

    const isOnTrack = project.deadline
      ? project.progress >= 100 ||
        (daysRemaining !== undefined &&
          daysRemaining > 0 &&
          project.progress >= 100 - daysRemaining * 2)
      : true;

    return {
      id: project.id,
      title: project.title,
      progress: project.progress,
      timeSpent: project.timeSpent,
      timeSpentHours: Math.round((project.timeSpent / 60) * 100) / 100,
      timeEstimated: project.timeEstimated || undefined,
      timeEstimatedHours: project.timeEstimated
        ? Math.round((project.timeEstimated / 60) * 100) / 100
        : undefined,
      timeEfficiency: timeEfficiency,
      lastActivityAt: project.lastActivityAt || undefined,
      status: project.status,
      priority: project.priority || 'MEDIUM',
      deadline: project.deadline || undefined,
      daysRemaining: daysRemaining,
      isOnTrack: isOnTrack,
      milestones: project.milestones.map((milestone) => ({
        id: milestone.id,
        projectId: milestone.projectId,
        title: milestone.title,
        description: milestone.description || undefined,
        dueDate: milestone.dueDate || undefined,
        completedAt: milestone.completedAt || undefined,
        progress: milestone.progress,
        isCompleted: milestone.isCompleted,
        order: milestone.order,
        createdAt: milestone.createdAt,
        updatedAt: milestone.updatedAt,
      })),
      recentTimeEntries: project.timeEntries.map((entry) =>
        this.mapTimeEntryToResponse(entry),
      ),
      totalTimeEntries: await this.prisma.projectTimeEntry.count({
        where: { projectId: projectId },
      }),
    };
  }

  // ==================== MILESTONE MANAGEMENT ====================

  async createMilestone(
    projectId: number,
    milestoneDto: ProjectMilestoneDto,
    createdBy: number,
  ): Promise<ProjectMilestoneResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const milestone = await this.prisma.projectMilestone.create({
      data: {
        projectId: projectId,
        title: milestoneDto.title,
        description: milestoneDto.description,
        dueDate: milestoneDto.dueDate,
        order: milestoneDto.order || 1,
      },
    });

    return {
      id: milestone.id,
      projectId: milestone.projectId,
      title: milestone.title,
      description: milestone.description || undefined,
      dueDate: milestone.dueDate || undefined,
      completedAt: milestone.completedAt || undefined,
      progress: milestone.progress,
      isCompleted: milestone.isCompleted,
      order: milestone.order,
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt,
    };
  }

  async updateMilestone(
    milestoneId: number,
    updateMilestoneDto: UpdateMilestoneDto,
    updatedBy: number,
  ): Promise<ProjectMilestoneResponseDto> {
    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${milestoneId} not found`);
    }

    const updatedMilestone = await this.prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        title: updateMilestoneDto.title,
        description: updateMilestoneDto.description,
        dueDate: updateMilestoneDto.dueDate,
        progress: updateMilestoneDto.progress,
        isCompleted: updateMilestoneDto.isCompleted,
        order: updateMilestoneDto.order,
        completedAt: updateMilestoneDto.isCompleted ? new Date() : null,
      },
    });

    return {
      id: updatedMilestone.id,
      projectId: updatedMilestone.projectId,
      title: updatedMilestone.title,
      description: updatedMilestone.description || undefined,
      dueDate: updatedMilestone.dueDate || undefined,
      completedAt: updatedMilestone.completedAt || undefined,
      progress: updatedMilestone.progress,
      isCompleted: updatedMilestone.isCompleted,
      order: updatedMilestone.order,
      createdAt: updatedMilestone.createdAt,
      updatedAt: updatedMilestone.updatedAt,
    };
  }

  // ==================== HELPER METHODS ====================

  private mapTimeEntryToResponse(timeEntry: any): ProjectTimeEntryResponseDto {
    return {
      id: timeEntry.id,
      projectId: timeEntry.projectId,
      userId: timeEntry.userId,
      userName: timeEntry.user.name,
      description: timeEntry.description,
      startTime: timeEntry.startTime,
      endTime: timeEntry.endTime || undefined,
      duration: timeEntry.duration || 0,
      durationHours: Math.round(((timeEntry.duration || 0) / 60) * 100) / 100,
      isActive: timeEntry.isActive,
      notes: timeEntry.notes || undefined,
      createdAt: timeEntry.createdAt,
      updatedAt: timeEntry.updatedAt,
    };
  }

  // ==================== PROJECT MANAGEMENT ====================

  async findAll(
    clientId?: number,
    status?: string,
    assignedToId?: number,
    priority?: string,
    isPublic?: boolean,
    page?: number,
    limit?: number,
  ) {
    const skip = page && limit ? (page - 1) * limit : 0;
    const take = limit || 10;

    const where: any = {};

    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;
    if (priority) where.priority = priority;
    if (isPublic !== undefined) where.isPublic = isPublic;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          client: true,
          assignedTo: true,
          budget: true,
          services: {
            include: {
              service: true,
              assignedToUser: true,
            },
          },
          products: {
            include: {
              product: true,
            },
          },
          milestones: { orderBy: { order: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects.map((project) => ({
        ...project,
        value: this.calculateProjectValue(project),
      })),
      meta: {
        total,
        page: page || 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        assignedTo: true,
        budget: true,
        services: {
          include: {
            service: true,
            assignedToUser: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
        milestones: { orderBy: { order: 'asc' } },
        timeEntries: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { user: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return {
      ...project,
      value: this.calculateProjectValue(project),
    };
  }

  async findByClient(clientId: number) {
    const projects = await this.prisma.project.findMany({
      where: { clientId },
      include: {
        client: true,
        assignedTo: true,
        budget: true,
        services: {
          include: {
            service: true,
            assignedToUser: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
        milestones: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => ({
      ...project,
      value: this.calculateProjectValue(project),
    }));
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    updatedBy: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Verify client exists if being updated
    if (updateProjectDto.clientId) {
      const client = await this.prisma.user.findUnique({
        where: { id: updateProjectDto.clientId },
      });
      if (!client) {
        throw new NotFoundException(
          `Client with ID ${updateProjectDto.clientId} not found`,
        );
      }
    }

    // Verify assigned user exists if being updated
    if (updateProjectDto.assignedToId) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: updateProjectDto.assignedToId },
      });
      if (!assignedUser) {
        throw new NotFoundException(
          `User with ID ${updateProjectDto.assignedToId} not found`,
        );
      }
    }

    // Calculate estimated time in minutes if hours provided
    let timeEstimated = updateProjectDto.timeEstimated;
    if (updateProjectDto.estimatedHours && !timeEstimated) {
      timeEstimated = updateProjectDto.estimatedHours * 60;
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        title: updateProjectDto.title,
        description: updateProjectDto.description,
        clientName: updateProjectDto.clientName,
        clientEmail: updateProjectDto.clientEmail,
        clientPhone: updateProjectDto.clientPhone,
        clientId: updateProjectDto.clientId,
        budgetId: updateProjectDto.budgetId,
        assignedToId: updateProjectDto.assignedToId,
        status: updateProjectDto.status,
        priority: updateProjectDto.priority,
        estimatedHours: updateProjectDto.estimatedHours,
        timeEstimated: timeEstimated,
        progress: updateProjectDto.progress,
        startedAt: updateProjectDto.startedAt,
        finishedAt: updateProjectDto.finishedAt,
        deadline: updateProjectDto.deadline,
        notes: updateProjectDto.notes,
        clientFeedback: updateProjectDto.clientFeedback,
        internalNotes: updateProjectDto.internalNotes,
        isPublic: updateProjectDto.isPublic,
        allowClientUpdates: updateProjectDto.allowClientUpdates,
        lastUpdatedBy: updatedBy,
        lastActivityAt: new Date(),
      },
    });

    // Create history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: id,
        action: 'UPDATED',
        details: JSON.stringify({
          updatedFields: Object.keys(updateProjectDto).filter(
            (key) => updateProjectDto[key] !== undefined,
          ),
        }),
        createdBy: updatedBy,
      },
    });

    return updatedProject;
  }

  async remove(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  private calculateProjectValue(project: any): number {
    let totalValue = 0;

    // Calculate services value
    if (project.services) {
      project.services.forEach((service: any) => {
        const unitPrice = service.unitPrice || service.service?.price || 0;
        const quantity = service.quantity || 1;
        const discount = service.discount || 0;
        totalValue += unitPrice * quantity - discount;
      });
    }

    // Calculate products value
    if (project.products) {
      project.products.forEach((product: any) => {
        const unitPrice =
          product.unitPrice || product.product?.sellingPrice || 0;
        const quantity = product.quantity || 1;
        const discount = product.discount || 0;
        totalValue += unitPrice * quantity - discount;
      });
    }

    return totalValue;
  }

  // ==================== PROJECT STATUS MANAGEMENT ====================

  async startProject(
    projectId: number,
    startProjectDto: StartProjectDto,
    startedBy: number,
  ): Promise<ProjectStatusResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { assignedTo: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status !== 'PENDING') {
      throw new BadRequestException(
        `Project is already ${project.status.toLowerCase()}`,
      );
    }

    const startDate = startProjectDto.actualStartDate || new Date();
    const initialProgress = startProjectDto.initialProgress || 5;

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: startDate,
        progress: initialProgress,
        lastActivityAt: new Date(),
        lastUpdatedBy: startedBy,
      },
    });

    // Create history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'STATUS_CHANGED',
        oldValue: 'PENDING',
        newValue: 'IN_PROGRESS',
        details: JSON.stringify({
          notes: startProjectDto.notes,
          startDate: startDate,
          initialProgress: initialProgress,
        }),
        createdBy: startedBy,
      },
    });

    return {
      id: updatedProject.id,
      title: updatedProject.title,
      status: updatedProject.status,
      previousStatus: 'PENDING',
      message: 'Project started successfully',
      statusChangedAt: new Date(),
      changedBy: project.assignedTo?.name || 'System',
      details: startProjectDto.notes,
    };
  }

  async completeProject(
    projectId: number,
    completeProjectDto: CompleteProjectDto,
    completedBy: number,
  ): Promise<ProjectStatusResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { assignedTo: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status === 'COMPLETED') {
      throw new BadRequestException('Project is already completed');
    }

    if (project.status === 'CANCELLED') {
      throw new BadRequestException('Cannot complete a cancelled project');
    }

    const completionDate =
      completeProjectDto.actualCompletionDate || new Date();

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'COMPLETED',
        finishedAt: completionDate,
        progress: 100,
        actualHours: completeProjectDto.actualHours,
        clientFeedback: completeProjectDto.clientFeedback,
        lastActivityAt: new Date(),
        lastUpdatedBy: completedBy,
      },
    });

    // Create history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'STATUS_CHANGED',
        oldValue: project.status,
        newValue: 'COMPLETED',
        details: JSON.stringify({
          notes: completeProjectDto.notes,
          completionDate: completionDate,
          actualHours: completeProjectDto.actualHours,
          clientFeedback: completeProjectDto.clientFeedback,
        }),
        createdBy: completedBy,
      },
    });

    return {
      id: updatedProject.id,
      title: updatedProject.title,
      status: updatedProject.status,
      previousStatus: project.status,
      message: 'Project completed successfully',
      statusChangedAt: new Date(),
      changedBy: project.assignedTo?.name || 'System',
      details: completeProjectDto.notes,
    };
  }

  async cancelProject(
    projectId: number,
    cancelProjectDto: CancelProjectDto,
    cancelledBy: number,
  ): Promise<ProjectStatusResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { assignedTo: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed project');
    }

    if (project.status === 'CANCELLED') {
      throw new BadRequestException('Project is already cancelled');
    }

    const cancellationDate = cancelProjectDto.cancellationDate || new Date();

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'CANCELLED',
        notes: project.notes
          ? `${project.notes}\n\nCancellation: ${cancelProjectDto.reason}`
          : `Cancellation: ${cancelProjectDto.reason}`,
        lastActivityAt: new Date(),
        lastUpdatedBy: cancelledBy,
      },
    });

    // Create history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'STATUS_CHANGED',
        oldValue: project.status,
        newValue: 'CANCELLED',
        details: JSON.stringify({
          reason: cancelProjectDto.reason,
          notes: cancelProjectDto.notes,
          cancellationDate: cancellationDate,
        }),
        createdBy: cancelledBy,
      },
    });

    return {
      id: updatedProject.id,
      title: updatedProject.title,
      status: updatedProject.status,
      previousStatus: project.status,
      message: 'Project cancelled successfully',
      statusChangedAt: new Date(),
      changedBy: project.assignedTo?.name || 'System',
      details: cancelProjectDto.reason,
    };
  }

  // ==================== SERVICE & PRODUCT MANAGEMENT ====================

  async addService(
    projectId: number,
    serviceDto: ProjectServiceDto,
    addedBy: number,
  ) {
    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if service already exists in project
    const existingService = await this.prisma.projectService.findUnique({
      where: {
        projectId_serviceId: {
          projectId: projectId,
          serviceId: serviceDto.serviceId,
        },
      },
    });

    if (existingService) {
      throw new BadRequestException(
        `Service with ID ${serviceDto.serviceId} is already added to this project`,
      );
    }

    let serviceId = serviceDto.serviceId;

    // If serviceId is 0, create a new service
    if (serviceDto.serviceId === 0) {
      if (!serviceDto.serviceName || !serviceDto.serviceDescription) {
        throw new BadRequestException(
          'Service name and description are required when creating a new service',
        );
      }

      const newService = await this.prisma.service.create({
        data: {
          name: serviceDto.serviceName,
          description: serviceDto.serviceDescription,
          price: serviceDto.unitPrice || 0,
          cost: serviceDto.unitCost || 0,
          isActive: true,
        },
      });
      serviceId = newService.id;
    } else {
      // Verify existing service exists
      const existingService = await this.prisma.service.findUnique({
        where: { id: serviceDto.serviceId },
      });
      if (!existingService) {
        throw new NotFoundException(
          `Service with ID ${serviceDto.serviceId} not found`,
        );
      }
    }

    // Create project service
    const projectService = await this.prisma.projectService.create({
      data: {
        projectId: projectId,
        serviceId: serviceId,
        quantity: serviceDto.quantity,
        unitPrice: serviceDto.unitPrice,
        unitCost: serviceDto.unitCost,
        discount: serviceDto.discount || 0,
        status: serviceDto.status || 'PENDING',
        startDate: serviceDto.startDate,
        endDate: serviceDto.endDate,
        assignedTo: serviceDto.assignedTo,
        notes: serviceDto.notes,
      },
      include: {
        service: true,
      },
    });

    // Create project history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'SERVICE_ADDED',
        details: JSON.stringify({
          serviceId: serviceId,
          serviceName: projectService.service.name,
          quantity: serviceDto.quantity,
          unitPrice: serviceDto.unitPrice,
        }),
        createdBy: addedBy,
      },
    });

    return {
      message: 'Service added to project successfully',
      projectService,
    };
  }

  async addProduct(
    projectId: number,
    productDto: ProjectProductDto,
    addedBy: number,
  ) {
    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if product already exists in project
    const existingProduct = await this.prisma.projectProduct.findUnique({
      where: {
        projectId_productId: {
          projectId: projectId,
          productId: productDto.productId,
        },
      },
    });

    if (existingProduct) {
      throw new BadRequestException(
        `Product with ID ${productDto.productId} is already added to this project`,
      );
    }

    let productId = productDto.productId;

    // If productId is 0, create a new product
    if (productDto.productId === 0) {
      if (!productDto.productName || !productDto.productDescription) {
        throw new BadRequestException(
          'Product name and description are required when creating a new product',
        );
      }

      const newProduct = await this.prisma.product.create({
        data: {
          name: productDto.productName,
          description: productDto.productDescription,
          buyingPrice: productDto.unitCost || 0,
          sellingPrice: productDto.unitPrice || 0,
          stock: 0,
          isActive: true,
        },
      });
      productId = newProduct.id;
    } else {
      // Verify existing product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id: productDto.productId },
      });
      if (!existingProduct) {
        throw new NotFoundException(
          `Product with ID ${productDto.productId} not found`,
        );
      }
    }

    // Create project product
    const projectProduct = await this.prisma.projectProduct.create({
      data: {
        projectId: projectId,
        productId: productId,
        quantity: productDto.quantity,
        unitPrice: productDto.unitPrice,
        unitCost: productDto.unitCost,
        discount: productDto.discount || 0,
        status: productDto.status || 'PENDING',
        orderDate: productDto.orderDate,
        receivedDate: productDto.receivedDate,
        installedDate: productDto.installedDate,
        notes: productDto.notes,
      },
      include: {
        product: true,
      },
    });

    // Create project history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'PRODUCT_ADDED',
        details: JSON.stringify({
          productId: productId,
          productName: projectProduct.product.name,
          quantity: productDto.quantity,
          unitPrice: productDto.unitPrice,
        }),
        createdBy: addedBy,
      },
    });

    return {
      message: 'Product added to project successfully',
      projectProduct,
    };
  }

  // ==================== INVOICE MANAGEMENT ====================

  async createProjectInvoice(
    projectId: number,
    createdBy: number,
    notes?: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        services: {
          include: { service: true },
        },
        products: {
          include: { product: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Calculate invoice totals
    let subtotal = 0;
    const invoiceItems: any[] = [];

    // Add services to invoice
    for (const projectService of project.services) {
      const serviceDetails = await this.prisma.service.findUnique({
        where: { id: projectService.serviceId },
      });

      if (!serviceDetails) {
        throw new NotFoundException(
          `Service with ID ${projectService.serviceId} not found`,
        );
      }

      const unitPrice = projectService.unitPrice || serviceDetails.price;
      const discount = projectService.discount || 0;
      const totalPrice = unitPrice * projectService.quantity - discount;
      subtotal += totalPrice;

      const serviceDescription = `${projectService.service.name}${projectService.service.serviceCode ? ` (${projectService.service.serviceCode})` : ''}${projectService.notes ? ` - ${projectService.notes}` : ''}`;

      invoiceItems.push({
        serviceId: projectService.serviceId,
        quantity: projectService.quantity,
        unitPrice: unitPrice,
        description: serviceDescription,
      });
    }

    // Add products to invoice
    for (const projectProduct of project.products) {
      const productDetails = await this.prisma.product.findUnique({
        where: { id: projectProduct.productId },
      });

      if (!productDetails) {
        throw new NotFoundException(
          `Product with ID ${projectProduct.productId} not found`,
        );
      }

      const unitPrice = projectProduct.unitPrice || productDetails.sellingPrice;
      const discount = projectProduct.discount || 0;
      const totalPrice = unitPrice * projectProduct.quantity - discount;
      subtotal += totalPrice;

      const productDescription = `${projectProduct.product.name}${projectProduct.product.sku ? ` (SKU: ${projectProduct.product.sku})` : ''}${projectProduct.notes ? ` - ${projectProduct.notes}` : ''}`;

      invoiceItems.push({
        productId: projectProduct.productId,
        quantity: projectProduct.quantity,
        unitPrice: unitPrice,
        description: productDescription,
      });
    }

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        clientPhone: project.clientPhone,
        projectId: projectId,
        subtotal: subtotal,
        total: subtotal,
        notes: notes,
        issuedAt: new Date(),
      },
    });

    // Create invoice items
    await Promise.all(
      invoiceItems.map((item) =>
        this.prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            serviceId: item.serviceId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            description: item.description,
          },
        }),
      ),
    );

    return invoice;
  }

  async createProjectInvoiceWithPrisma(
    prisma: any,
    projectId: number,
    createdBy: number,
    notes?: string,
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        services: {
          include: { service: true },
        },
        products: {
          include: { product: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Calculate invoice totals
    let subtotal = 0;
    const invoiceItems: any[] = [];

    // Add services to invoice
    for (const projectService of project.services) {
      const serviceDetails = await prisma.service.findUnique({
        where: { id: projectService.serviceId },
      });

      if (!serviceDetails) {
        throw new NotFoundException(
          `Service with ID ${projectService.serviceId} not found`,
        );
      }

      const unitPrice = projectService.unitPrice || serviceDetails.price;
      const discount = projectService.discount || 0;
      const totalPrice = unitPrice * projectService.quantity - discount;
      subtotal += totalPrice;

      const serviceDescription = `${projectService.service.name}${projectService.service.serviceCode ? ` (${projectService.service.serviceCode})` : ''}${projectService.notes ? ` - ${projectService.notes}` : ''}`;

      invoiceItems.push({
        serviceId: projectService.serviceId,
        quantity: projectService.quantity,
        unitPrice: unitPrice,
        description: serviceDescription,
      });
    }

    // Add products to invoice
    for (const projectProduct of project.products) {
      const productDetails = await prisma.product.findUnique({
        where: { id: projectProduct.productId },
      });

      if (!productDetails) {
        throw new NotFoundException(
          `Product with ID ${projectProduct.productId} not found`,
        );
      }

      const unitPrice = projectProduct.unitPrice || productDetails.sellingPrice;
      const discount = projectProduct.discount || 0;
      const totalPrice = unitPrice * projectProduct.quantity - discount;
      subtotal += totalPrice;

      const productDescription = `${projectProduct.product.name}${projectProduct.product.sku ? ` (SKU: ${projectProduct.product.sku})` : ''}${projectProduct.notes ? ` - ${projectProduct.notes}` : ''}`;

      invoiceItems.push({
        productId: projectProduct.productId,
        quantity: projectProduct.quantity,
        unitPrice: unitPrice,
        description: productDescription,
      });
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        clientPhone: project.clientPhone,
        projectId: projectId,
        subtotal: subtotal,
        total: subtotal,
        notes: notes,
        issuedAt: new Date(),
      },
    });

    // Create invoice items
    await Promise.all(
      invoiceItems.map((item) =>
        prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            serviceId: item.serviceId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            description: item.description,
          },
        }),
      ),
    );

    return invoice;
  }

  // ==================== STATISTICS ====================

  async getProjectStats() {
    const [
      totalProjects,
      pendingProjects,
      inProgressProjects,
      completedProjects,
      cancelledProjects,
      totalValue,
      averageProgress,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: 'PENDING' } }),
      this.prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.project.count({ where: { status: 'COMPLETED' } }),
      this.prisma.project.count({ where: { status: 'CANCELLED' } }),
      this.prisma.project.aggregate({
        _sum: { timeSpent: true },
      }),
      this.prisma.project.aggregate({
        _avg: { progress: true },
      }),
    ]);

    return {
      totalProjects,
      pendingProjects,
      inProgressProjects,
      completedProjects,
      cancelledProjects,
      totalTimeSpent: totalValue._sum.timeSpent || 0,
      averageProgress: Math.round(averageProgress._avg.progress || 0),
    };
  }
}
