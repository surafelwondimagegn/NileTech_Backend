import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // ==================== NOTIFICATION & ALERT SYSTEM ====================

  private async notifyProjectCreated(project: any, createdBy: number) {
    const content = `New project "${project.title}" created for ${project.clientName}`;
    
    // Notify admins and managers
    await this.notificationService.createForAdmins(
      content,
      'SUCCESS' as any,
    );

    // Notify assigned user if different from creator
    if (project.assignedToId && project.assignedToId !== createdBy) {
      await this.notificationService.createForUser(
        project.assignedToId,
        `You have been assigned to project "${project.title}"`,
        'INFO' as any,
      );
    }

    // Notify client
    if (project.clientId) {
      await this.notificationService.createForUser(
        project.clientId,
        `Your project "${project.title}" has been created and is being processed`,
        'INFO' as any,
      );
    }
  }

  private async notifyProjectStatusChange(
    project: any,
    oldStatus: string,
    newStatus: string,
    changedBy: number,
  ) {
    const statusMessages = {
      PENDING: 'is pending approval',
      IN_PROGRESS: 'has started',
      COMPLETED: 'has been completed',
      CANCELLED: 'has been cancelled',
    };

    const content = `Project "${project.title}" ${statusMessages[newStatus] || `status changed to ${newStatus}`}`;

    // Notify all project stakeholders
    const stakeholders = [project.clientId, project.assignedToId, changedBy].filter(
      (id) => id && id !== changedBy,
    );

    await Promise.all(
      stakeholders.map((userId) =>
        this.notificationService.createForUser(userId, content, 'INFO' as any),
      ),
    );

    // Notify admins for status changes
    await this.notificationService.createForAdmins(
      `Project "${project.title}" status: ${oldStatus} → ${newStatus}`,
      'INFO' as any,
    );
  }

  private async notifyDeadlineAlert(project: any) {
    const now = new Date();
    const deadline = new Date(project.deadline);
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let alertType = 'INFO' as any;
    let urgency = '';

    if (daysUntilDeadline <= 0) {
      alertType = 'ALERT' as any;
      urgency = 'OVERDUE';
    } else if (daysUntilDeadline <= 1) {
      alertType = 'WARNING' as any;
      urgency = 'DUE TOMORROW';
    } else if (daysUntilDeadline <= 3) {
      alertType = 'WARNING' as any;
      urgency = 'DUE SOON';
    } else if (daysUntilDeadline <= 7) {
      alertType = 'INFO' as any;
      urgency = 'UPCOMING';
    }

    const content = `Project "${project.title}" ${urgency}: ${daysUntilDeadline <= 0 ? 'Overdue' : `Due in ${daysUntilDeadline} day(s)`}`;

    // Notify assigned user
    if (project.assignedToId) {
      await this.notificationService.createForUser(
        project.assignedToId,
        content,
        alertType,
      );
    }

    // Notify client for overdue projects
    if (daysUntilDeadline <= 0 && project.clientId) {
      await this.notificationService.createForUser(
        project.clientId,
        `Your project "${project.title}" is overdue. We're working to complete it as soon as possible.`,
        'WARNING' as any,
      );
    }

    // Notify admins for critical deadlines
    if (daysUntilDeadline <= 3) {
      await this.notificationService.createForAdmins(
        `URGENT: Project "${project.title}" ${urgency}`,
        alertType,
      );
    }
  }

  private async notifyProgressUpdate(project: any, oldProgress: number, newProgress: number, updatedBy: number) {
    const progressChange = newProgress - oldProgress;
    
    if (progressChange > 0) {
      const content = `Project "${project.title}" progress updated: ${oldProgress}% → ${newProgress}% (+${progressChange}%)`;

      // Notify client for significant progress
      if (progressChange >= 10 && project.clientId) {
        await this.notificationService.createForUser(
          project.clientId,
          `Great news! Your project "${project.title}" has made significant progress (${newProgress}% complete)`,
          'SUCCESS' as any,
        );
      }

      // Notify assigned user if different from updater
      if (project.assignedToId && project.assignedToId !== updatedBy) {
        await this.notificationService.createForUser(
          project.assignedToId,
          content,
          'INFO' as any,
        );
      }
    }
  }

  private async notifyMilestoneCompleted(project: any, milestone: any, completedBy: number) {
    const content = `Milestone "${milestone.title}" completed for project "${project.title}"`;

    // Notify all project stakeholders
    const stakeholders = [project.clientId, project.assignedToId].filter(Boolean);

    await Promise.all(
      stakeholders.map((userId) =>
        this.notificationService.createForUser(userId, content, 'SUCCESS' as any),
      ),
    );

    // Notify admins
    await this.notificationService.createForAdmins(content, 'SUCCESS' as any);
  }



  private async notifyServiceAdded(project: any, service: any, addedBy: number) {
    const content = `Service "${service.service.name}" added to project "${project.title}"`;

    // Notify assigned user if different from adder
    if (project.assignedToId && project.assignedToId !== addedBy) {
      await this.notificationService.createForUser(
        project.assignedToId,
        content,
        'INFO' as any,
      );
    }

    // Notify client
    if (project.clientId) {
      await this.notificationService.createForUser(
        project.clientId,
        `New service "${service.service.name}" has been added to your project "${project.title}"`,
        'INFO' as any,
      );
    }
  }

  private async notifyProductAdded(project: any, product: any, addedBy: number) {
    const content = `Product "${product.product.name}" added to project "${project.title}"`;

    // Notify assigned user if different from adder
    if (project.assignedToId && project.assignedToId !== addedBy) {
      await this.notificationService.createForUser(
        project.assignedToId,
        content,
        'INFO' as any,
      );
    }

    // Notify client
    if (project.clientId) {
      await this.notificationService.createForUser(
        project.clientId,
        `New product "${product.product.name}" has been added to your project "${project.title}"`,
        'INFO' as any,
      );
    }
  }

  private async notifyInvoiceCreated(project: any, invoice: any, createdBy: number) {
    const content = `Invoice #${invoice.invoiceNumber} created for project "${project.title}" - Total: $${invoice.total}`;

    // Notify client
    if (project.clientId) {
      await this.notificationService.createForUser(
        project.clientId,
        `Invoice #${invoice.invoiceNumber} has been generated for your project "${project.title}". Amount: $${invoice.total}`,
        'INFO' as any,
      );
    }

    // Notify admins
    await this.notificationService.createForAdmins(content, 'SUCCESS' as any);
  }

  private async notifyProformaCreated(project: any, proforma: any, createdBy: number) {
    const content = `Proforma #${proforma.proformaNumber} created for project "${project.title}" - Total: $${proforma.total}`;

    // Notify client
    if (project.clientId) {
      await this.notificationService.createForUser(
        project.clientId,
        `Proforma #${proforma.proformaNumber} has been generated for your project "${project.title}". Amount: $${proforma.total}`,
        'INFO' as any,
      );
    }

    // Notify admins
    await this.notificationService.createForAdmins(content, 'SUCCESS' as any);
  }

  private async notifyPaymentReceived(project: any, payment: any, receivedBy: number) {
    const content = `Payment received for project "${project.title}" - Amount: $${payment.amount}`;

    // Notify all project stakeholders
    const stakeholders = [project.clientId, project.assignedToId].filter(Boolean);

    await Promise.all(
      stakeholders.map((userId) =>
        this.notificationService.createForUser(userId, content, 'SUCCESS' as any),
      ),
    );

    // Notify admins
    await this.notificationService.createForAdmins(content, 'SUCCESS' as any);
  }

  private async notifyBudgetAlert(project: any, budgetUsage: number, budgetLimit: number) {
    const usagePercentage = (budgetUsage / budgetLimit) * 100;
    
    if (usagePercentage >= 90) {
      const content = `CRITICAL: Project "${project.title}" budget usage at ${usagePercentage.toFixed(1)}% ($${budgetUsage}/${budgetLimit})`;

      // Notify admins and managers
      await this.notificationService.createForAdmins(content, 'ALERT' as any);

      // Notify assigned user
      if (project.assignedToId) {
        await this.notificationService.createForUser(
          project.assignedToId,
          `Budget alert: Project "${project.title}" has used ${usagePercentage.toFixed(1)}% of allocated budget`,
          'WARNING' as any,
        );
      }
    } else if (usagePercentage >= 75) {
      const content = `Project "${project.title}" budget usage at ${usagePercentage.toFixed(1)}%`;

      // Notify assigned user
      if (project.assignedToId) {
        await this.notificationService.createForUser(
          project.assignedToId,
          `Budget warning: Project "${project.title}" has used ${usagePercentage.toFixed(1)}% of allocated budget`,
          'WARNING' as any,
        );
      }
    }
  }

  private async notifyTimeTrackingAlert(project: any, timeEntry: any, userId: number) {
    const duration = timeEntry.duration || 0;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    const content = `Time entry logged for project "${project.title}": ${hours}h ${minutes}m`;

    // Notify assigned user if different from time tracker
    if (project.assignedToId && project.assignedToId !== userId) {
      await this.notificationService.createForUser(
        project.assignedToId,
        content,
        'INFO' as any,
      );
    }

    // Notify admins for long time entries (more than 8 hours)
    if (hours >= 8) {
      await this.notificationService.createForAdmins(
        `Long time entry: ${hours}h ${minutes}m logged for project "${project.title}"`,
        'WARNING' as any,
      );
    }
  }

  // ==================== AUTOMATIC ALERT SCHEDULER ====================

  async scheduleDeadlineAlerts() {
    const now = new Date();
    const upcomingDeadlines = await this.prisma.project.findMany({
      where: {
        deadline: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    for (const project of upcomingDeadlines) {
      await this.notifyDeadlineAlert(project);
    }

    return {
      message: `Deadline alerts processed for ${upcomingDeadlines.length} projects`,
      projects: upcomingDeadlines.length,
    };
  }

  async scheduleBudgetAlerts() {
    const projects = await this.prisma.project.findMany({
      where: {
        budgetId: { not: null },
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
      include: {
        budget: {
          include: {
            expenses: true,
          },
        },
        expenses: true,
      },
    });

    for (const project of projects) {
      if (project.budget) {
        const totalExpenses = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        await this.notifyBudgetAlert(project, totalExpenses, project.budget.amount);
      }
    }

    return {
      message: `Budget alerts processed for ${projects.length} projects`,
      projects: projects.length,
    };
  }

  async scheduleOverdueProjectAlerts() {
    const now = new Date();
    const overdueProjects = await this.prisma.project.findMany({
      where: {
        deadline: { lt: now },
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    for (const project of overdueProjects) {
      await this.notifyDeadlineAlert(project);
    }

    return {
      message: `Overdue alerts processed for ${overdueProjects.length} projects`,
      projects: overdueProjects.length,
    };
  }

  // ==================== PROJECT CREATION ====================

  async create(createProjectDto: CreateProjectDto, createdBy: number) {
    return this.createWithInvoice(createProjectDto, createdBy);
  }

  async createWithInvoice(
    createProjectDto: CreateProjectWithInvoiceDto,
    createdBy: number,
  ) {
    // Verify client exists if provided
    if (createProjectDto.clientId) {
      const client = await this.prisma.user.findUnique({
        where: { id: createProjectDto.clientId },
      });

      if (!client) {
        throw new NotFoundException(
          `Client with ID ${createProjectDto.clientId} not found`,
        );
      }
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
    let createdInvoice: any = null;
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the project
      const newProject = await prisma.project.create({
        data: {
          title: createProjectDto.title,
          description: createProjectDto.description,
          clientName: createProjectDto.clientName,
          clientEmail: createProjectDto.clientEmail,
          clientPhone: createProjectDto.clientPhone,
          clientId: createProjectDto.clientId || null,
          budgetId: createProjectDto.budgetId || null,
          assignedToId: createProjectDto.assignedToId || null,
          status: createProjectDto.status || 'PENDING',
          priority: createProjectDto.priority || 'MEDIUM',
          estimatedHours: createProjectDto.estimatedHours || null,
          timeEstimated: timeEstimated || null,
          progress: createProjectDto.progress || 0,
          timeSpent: createProjectDto.timeSpent ?? 0,
          actualHours: createProjectDto.actualHours ?? (createProjectDto.timeSpent ? Math.round(createProjectDto.timeSpent / 60) : null),
          lastActivityAt: createProjectDto.lastActivityAt ? new Date(createProjectDto.lastActivityAt) : new Date(),
          startedAt: createProjectDto.startedAt ? new Date(createProjectDto.startedAt) : null,
          finishedAt: createProjectDto.finishedAt ? new Date(createProjectDto.finishedAt) : null,
          deadline: createProjectDto.deadline ? new Date(createProjectDto.deadline) : null,
          notes: createProjectDto.notes,
          clientFeedback: createProjectDto.clientFeedback,
          internalNotes: createProjectDto.internalNotes,
          isPublic: createProjectDto.isPublic ?? true,
          allowClientUpdates: createProjectDto.allowClientUpdates ?? false,
          lastUpdatedBy: createdBy,
        },
        include: {
          client: true,
          assignedTo: true,
          budget: true,
        },
      });

      // Create project history entry
      await prisma.projectHistory.create({
        data: {
          projectId: newProject.id,
          action: 'PROJECT_CREATED',
          details: JSON.stringify({
            title: newProject.title,
            clientName: newProject.clientName,
            status: newProject.status,
            priority: newProject.priority,
          }),
          createdBy: createdBy,
        },
      });

      // Create invoice if requested
      let invoice = null;
      if (createProjectDto.createEmptyInvoice || 
          (createProjectDto.services && createProjectDto.services.length > 0) || 
          (createProjectDto.products && createProjectDto.products.length > 0)) {
        
        // Calculate invoice totals
        let subtotal = 0;
        const invoiceItems: any[] = [];

        // Add services to invoice
        if (createProjectDto.services) {
          for (const serviceDto of createProjectDto.services) {
            const serviceDetails = await prisma.service.findUnique({
              where: { id: serviceDto.serviceId },
            });

            if (!serviceDetails) {
              throw new NotFoundException(
                `Service with ID ${serviceDto.serviceId} not found`,
              );
            }

            const unitPrice = serviceDto.unitPrice || serviceDetails.price || 0;
            const discount = serviceDto.discount || 0;
            const totalPrice = unitPrice * serviceDto.quantity - discount;
            subtotal += totalPrice;

            const serviceDescription = `${serviceDetails.name}${serviceDetails.serviceCode ? ` (${serviceDetails.serviceCode})` : ''}${serviceDto.notes ? ` - ${serviceDto.notes}` : ''}`;

            invoiceItems.push({
              serviceId: serviceDto.serviceId,
              quantity: serviceDto.quantity,
              unitPrice: unitPrice,
              description: serviceDescription,
            });
          }
        }

        // Add products to invoice
        if (createProjectDto.products) {
          for (const productDto of createProjectDto.products) {
            const productDetails = await prisma.product.findUnique({
              where: { id: productDto.productId },
            });

            if (!productDetails) {
              throw new NotFoundException(
                `Product with ID ${productDto.productId} not found`,
              );
            }

            const unitPrice = productDto.unitPrice || productDetails.sellingPrice || 0;
            const discount = productDto.discount || 0;
            const totalPrice = unitPrice * productDto.quantity - discount;
            subtotal += totalPrice;

            const productDescription = `${productDetails.name}${productDetails.sku ? ` (SKU: ${productDetails.sku})` : ''}${productDto.notes ? ` - ${productDto.notes}` : ''}`;

            invoiceItems.push({
              productId: productDto.productId,
              quantity: productDto.quantity,
              unitPrice: unitPrice,
              description: productDescription,
            });
          }
        }

        // Generate invoice number
        const invoiceCount = await prisma.invoice.count();
        const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

        // Create invoice
        const createdInvoice = await prisma.invoice.create({
          data: {
            invoiceNumber: invoiceNumber,
            clientName: newProject.clientName || 'Client',
            clientEmail: newProject.clientEmail || null,
            clientPhone: newProject.clientPhone || null,
            projectId: newProject.id,
            subtotal: subtotal,
            total: subtotal,
            notes: createProjectDto.invoiceNotes,
            issuedAt: new Date(),
            status: 'DRAFT',
            paymentTerms: 'NET_30',
            currency: 'USD',
            includeTax: false,
            includeShipping: false,
          },
        });

        // Create invoice items
        await Promise.all(
          invoiceItems.map((item) =>
            prisma.invoiceItem.create({
              data: {
                invoiceId: createdInvoice.id,
                serviceId: item.serviceId || null,
                productId: item.productId || null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                description: item.description,
                subtotal: item.quantity * item.unitPrice,
                totalAfterDiscount: item.quantity * item.unitPrice,
                total: item.quantity * item.unitPrice,
              },
            }),
          ),
        );
      }

      // Send notifications
      await this.notifyProjectCreated(newProject, createdBy);
      if (createdInvoice) {
        await this.notifyInvoiceCreated(newProject, createdInvoice, createdBy);
      }

      return {
        project: newProject,
        invoice: createdInvoice,
      };
    });

    return result;
  }

  async createWithBoth(
    createProjectDto: CreateProjectWithInvoiceDto,
    createdBy: number,
  ) {
    try {
      // Verify client exists if provided
      if (createProjectDto.clientId) {
        const client = await this.prisma.user.findUnique({
          where: { id: createProjectDto.clientId },
        });

        if (!client) {
          throw new NotFoundException(
            `Client with ID ${createProjectDto.clientId} not found`,
          );
        }
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

      // Verify services exist if provided
      if (createProjectDto.services) {
        for (const serviceDto of createProjectDto.services) {
          const service = await this.prisma.service.findUnique({
            where: { id: serviceDto.serviceId },
          });
          if (!service) {
            throw new NotFoundException(
              `Service with ID ${serviceDto.serviceId} not found`,
            );
          }
        }
      }

      // Verify products exist if provided
      if (createProjectDto.products) {
        for (const productDto of createProjectDto.products) {
          const product = await this.prisma.product.findUnique({
            where: { id: productDto.productId },
          });
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${productDto.productId} not found`,
            );
          }
        }
      }

      // Calculate estimated time in minutes if hours provided
      let timeEstimated = createProjectDto.timeEstimated;
      if (createProjectDto.estimatedHours && !timeEstimated) {
        timeEstimated = createProjectDto.estimatedHours * 60;
      }

      // Create project with both invoice and proforma in transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create the project
        const newProject = await prisma.project.create({
          data: {
            title: createProjectDto.title,
            description: createProjectDto.description,
            clientName: createProjectDto.clientName,
            clientEmail: createProjectDto.clientEmail,
            clientPhone: createProjectDto.clientPhone,
            clientId: createProjectDto.clientId || null,
            budgetId: createProjectDto.budgetId || null,
            assignedToId: createProjectDto.assignedToId || null,
            status: createProjectDto.status || 'PENDING',
            priority: createProjectDto.priority || 'MEDIUM',
            estimatedHours: createProjectDto.estimatedHours || null,
            timeEstimated: timeEstimated || null,
            progress: createProjectDto.progress || 0,
            timeSpent: createProjectDto.timeSpent ?? 0,
            actualHours: createProjectDto.actualHours ?? (createProjectDto.timeSpent ? Math.round(createProjectDto.timeSpent / 60) : null),
            lastActivityAt: createProjectDto.lastActivityAt ? new Date(createProjectDto.lastActivityAt) : new Date(),
            startedAt: createProjectDto.startedAt ? new Date(createProjectDto.startedAt) : null,
            finishedAt: createProjectDto.finishedAt ? new Date(createProjectDto.finishedAt) : null,
            deadline: createProjectDto.deadline ? new Date(createProjectDto.deadline) : null,
            notes: createProjectDto.notes,
            clientFeedback: createProjectDto.clientFeedback,
            internalNotes: createProjectDto.internalNotes,
            isPublic: createProjectDto.isPublic ?? true,
            allowClientUpdates: createProjectDto.allowClientUpdates ?? false,
            lastUpdatedBy: createdBy,
          },
          include: {
            client: true,
            assignedTo: true,
            budget: true,
          },
        });

        // Create project history entry
        await prisma.projectHistory.create({
          data: {
            projectId: newProject.id,
            action: 'PROJECT_CREATED',
            details: JSON.stringify({
              title: newProject.title,
              clientName: newProject.clientName,
              status: newProject.status,
              priority: newProject.priority,
            }),
            createdBy: createdBy,
          },
        });

        // Add services to project if provided
        if (createProjectDto.services && createProjectDto.services.length > 0) {
          for (const serviceDto of createProjectDto.services) {
            await prisma.projectService.create({
              data: {
                projectId: newProject.id,
                serviceId: serviceDto.serviceId,
                quantity: serviceDto.quantity || 1,
                unitPrice: serviceDto.unitPrice || null,
                unitCost: serviceDto.unitCost || null,
                discount: serviceDto.discount || 0,
                status: serviceDto.status || 'PENDING',
                startDate: serviceDto.startDate ? new Date(serviceDto.startDate) : null,
                endDate: serviceDto.endDate ? new Date(serviceDto.endDate) : null,
                assignedTo: serviceDto.assignedTo || null,
                notes: serviceDto.notes,
              },
            });
          }
        }

        // Add products to project if provided
        if (createProjectDto.products && createProjectDto.products.length > 0) {
          for (const productDto of createProjectDto.products) {
            await prisma.projectProduct.create({
              data: {
                projectId: newProject.id,
                productId: productDto.productId,
                quantity: productDto.quantity || 1,
                unitPrice: productDto.unitPrice || null,
                unitCost: productDto.unitCost || null,
                discount: productDto.discount || 0,
                status: productDto.status || 'PENDING',
                orderDate: productDto.orderDate ? new Date(productDto.orderDate) : null,
                receivedDate: productDto.receivedDate ? new Date(productDto.receivedDate) : null,
                installedDate: productDto.installedDate ? new Date(productDto.installedDate) : null,
                notes: productDto.notes,
              },
            });
          }
        }

        // Create milestones if provided
        if (createProjectDto.milestones && createProjectDto.milestones.length > 0) {
          for (const milestoneDto of createProjectDto.milestones) {
            await prisma.projectMilestone.create({
              data: {
                projectId: newProject.id,
                title: milestoneDto.title,
                description: milestoneDto.description,
                dueDate: milestoneDto.dueDate ? new Date(milestoneDto.dueDate) : null,
                order: milestoneDto.order || 1,
              },
            });
          }
        }

        // Create invoice
        let invoice = null;
        if (createProjectDto.createEmptyInvoice || (createProjectDto.services && createProjectDto.services.length > 0) || (createProjectDto.products && createProjectDto.products.length > 0)) {
          // Calculate invoice totals
          let subtotal = 0;
          const invoiceItems: any[] = [];

          // Add services to invoice
          if (createProjectDto.services) {
            for (const serviceDto of createProjectDto.services) {
              const serviceDetails = await prisma.service.findUnique({
                where: { id: serviceDto.serviceId },
              });

              if (!serviceDetails) {
                throw new NotFoundException(
                  `Service with ID ${serviceDto.serviceId} not found`,
                );
              }

              const unitPrice = serviceDto.unitPrice || serviceDetails.price || 0;
              const discount = serviceDto.discount || 0;
              const totalPrice = unitPrice * serviceDto.quantity - discount;
              subtotal += totalPrice;

              const serviceDescription = `${serviceDetails.name}${serviceDetails.serviceCode ? ` (${serviceDetails.serviceCode})` : ''}${serviceDto.notes ? ` - ${serviceDto.notes}` : ''}`;

              invoiceItems.push({
                serviceId: serviceDto.serviceId,
                quantity: serviceDto.quantity,
                unitPrice: unitPrice,
                description: serviceDescription,
              });
            }
          }

          // Add products to invoice
          if (createProjectDto.products) {
            for (const productDto of createProjectDto.products) {
              const productDetails = await prisma.product.findUnique({
                where: { id: productDto.productId },
              });

              if (!productDetails) {
                throw new NotFoundException(
                  `Product with ID ${productDto.productId} not found`,
                );
              }

              const unitPrice = productDto.unitPrice || productDetails.sellingPrice || 0;
              const discount = productDto.discount || 0;
              const totalPrice = unitPrice * productDto.quantity - discount;
              subtotal += totalPrice;

              const productDescription = `${productDetails.name}${productDetails.sku ? ` (SKU: ${productDetails.sku})` : ''}${productDto.notes ? ` - ${productDto.notes}` : ''}`;

              invoiceItems.push({
                productId: productDto.productId,
                quantity: productDto.quantity,
                unitPrice: unitPrice,
                description: productDescription,
              });
            }
          }

          // Generate invoice number
          const invoiceCount = await prisma.invoice.count();
          const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

          // Create invoice
          const createdInvoice2 = await prisma.invoice.create({
            data: {
              invoiceNumber: invoiceNumber,
              clientName: newProject.clientName || 'Client',
              clientEmail: newProject.clientEmail || null,
              clientPhone: newProject.clientPhone || null,
              projectId: newProject.id,
              subtotal: subtotal,
              total: subtotal,
              notes: createProjectDto.invoiceNotes,
              issuedAt: new Date(),
              status: 'DRAFT',
              paymentTerms: 'NET_30',
              currency: 'USD',
              includeTax: false,
              includeShipping: false,
            },
          });

          // Create invoice items
          await Promise.all(
            invoiceItems.map((item) =>
              prisma.invoiceItem.create({
                data: {
                  invoiceId: createdInvoice2.id,
                  serviceId: item.serviceId || null,
                  productId: item.productId || null,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  description: item.description,
                  subtotal: item.quantity * item.unitPrice,
                  totalAfterDiscount: item.quantity * item.unitPrice,
                  total: item.quantity * item.unitPrice,
                },
              }),
            ),
          );
        }

        // Create proforma
        let createdProforma: any = null;
        if (createProjectDto.createEmptyProforma || (createProjectDto.services && createProjectDto.services.length > 0) || (createProjectDto.products && createProjectDto.products.length > 0)) {
          // Calculate proforma totals
          let subtotal = 0;
          const proformaItems: any[] = [];

          // Add services to proforma
          if (createProjectDto.services) {
            for (const serviceDto of createProjectDto.services) {
              const serviceDetails = await prisma.service.findUnique({
                where: { id: serviceDto.serviceId },
              });

              if (!serviceDetails) {
                throw new NotFoundException(
                  `Service with ID ${serviceDto.serviceId} not found`,
                );
              }

              const unitPrice = serviceDto.unitPrice || serviceDetails.price || 0;
              const discount = serviceDto.discount || 0;
              const totalPrice = unitPrice * serviceDto.quantity - discount;
              subtotal += totalPrice;

              const serviceDescription = `${serviceDetails.name}${serviceDetails.serviceCode ? ` (${serviceDetails.serviceCode})` : ''}${serviceDto.notes ? ` - ${serviceDto.notes}` : ''}`;

              proformaItems.push({
                serviceId: serviceDto.serviceId,
                quantity: serviceDto.quantity,
                unitPrice: unitPrice,
                description: serviceDescription,
              });
            }
          }

          // Add products to proforma
          if (createProjectDto.products) {
            for (const productDto of createProjectDto.products) {
              const productDetails = await prisma.product.findUnique({
                where: { id: productDto.productId },
              });

              if (!productDetails) {
                throw new NotFoundException(
                  `Product with ID ${productDto.productId} not found`,
                );
              }

              const unitPrice = productDto.unitPrice || productDetails.sellingPrice || 0;
              const discount = productDto.discount || 0;
              const totalPrice = unitPrice * productDto.quantity - discount;
              subtotal += totalPrice;

              const productDescription = `${productDetails.name}${productDetails.sku ? ` (SKU: ${productDetails.sku})` : ''}${productDto.notes ? ` - ${productDto.notes}` : ''}`;

              proformaItems.push({
                productId: productDto.productId,
                quantity: productDto.quantity,
                unitPrice: unitPrice,
                description: productDescription,
              });
            }
          }

          // Generate proforma number
          const proformaCount = await prisma.proforma.count();
          const proformaNumber = `PROF-${String(proformaCount + 1).padStart(6, '0')}`;

          // Create proforma
          createdProforma = await prisma.proforma.create({
            data: {
              proformaNumber: proformaNumber,
              clientName: newProject.clientName || 'Client',
              clientEmail: newProject.clientEmail || null,
              clientPhone: newProject.clientPhone || null,
              projectId: newProject.id,
              subtotal: subtotal,
              total: subtotal,
              notes: createProjectDto.proformaNotes,
              issuedAt: new Date(),
              status: 'DRAFT',
              currency: 'USD',
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
          });

          // Create proforma items
          await Promise.all(
            proformaItems.map((item) =>
              prisma.proformaItem.create({
                data: {
                  proformaId: createdProforma.id,
                  serviceId: item.serviceId || null,
                  productId: item.productId || null,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  description: item.description,
                  subtotal: item.quantity * item.unitPrice,
                  totalAfterDiscount: item.quantity * item.unitPrice,
                  total: item.quantity * item.unitPrice,
                },
              }),
            ),
          );
        }

        return {
          project: newProject,
          invoice,
          proforma: createdProforma,
        };
      });

      // Send notifications outside transaction
      await this.notifyProjectCreated(result.project, createdBy);
      if (result.invoice) {
        await this.notifyInvoiceCreated(result.project, result.invoice, createdBy);
      }
      if (result.proforma) {
        await this.notifyProformaCreated(result.project, result.proforma, createdBy);
      }

      return result;
    } catch (error) {
      console.error('Error in createWithBoth:', error);
      throw error;
    }
  }

  async createWithProforma(
    createProjectDto: CreateProjectWithInvoiceDto,
    createdBy: number,
  ) {
    try {
      // Verify client exists if provided
      if (createProjectDto.clientId) {
        const client = await this.prisma.user.findUnique({
          where: { id: createProjectDto.clientId },
        });

        if (!client) {
          throw new NotFoundException(
            `Client with ID ${createProjectDto.clientId} not found`,
          );
        }
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

      // Verify services exist if provided
      if (createProjectDto.services) {
        for (const serviceDto of createProjectDto.services) {
          const service = await this.prisma.service.findUnique({
            where: { id: serviceDto.serviceId },
          });
          if (!service) {
            throw new NotFoundException(
              `Service with ID ${serviceDto.serviceId} not found`,
            );
          }
        }
      }

      // Verify products exist if provided
      if (createProjectDto.products) {
        for (const productDto of createProjectDto.products) {
          const product = await this.prisma.product.findUnique({
            where: { id: productDto.productId },
          });
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${productDto.productId} not found`,
            );
          }
        }
      }

      // Calculate estimated time in minutes if hours provided
      let timeEstimated = createProjectDto.timeEstimated;
      if (createProjectDto.estimatedHours && !timeEstimated) {
        timeEstimated = createProjectDto.estimatedHours * 60;
      }

      // Create project with proforma only in transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create the project
        const newProject = await prisma.project.create({
          data: {
            title: createProjectDto.title,
            description: createProjectDto.description,
            clientName: createProjectDto.clientName,
            clientEmail: createProjectDto.clientEmail,
            clientPhone: createProjectDto.clientPhone,
            clientId: createProjectDto.clientId || null,
            budgetId: createProjectDto.budgetId || null,
            assignedToId: createProjectDto.assignedToId || null,
            status: createProjectDto.status || 'PENDING',
            priority: createProjectDto.priority || 'MEDIUM',
            estimatedHours: createProjectDto.estimatedHours || null,
            timeEstimated: timeEstimated || null,
            progress: createProjectDto.progress || 0,
            timeSpent: createProjectDto.timeSpent ?? 0,
            actualHours: createProjectDto.actualHours ?? (createProjectDto.timeSpent ? Math.round(createProjectDto.timeSpent / 60) : null),
            lastActivityAt: createProjectDto.lastActivityAt ? new Date(createProjectDto.lastActivityAt) : new Date(),
            startedAt: createProjectDto.startedAt ? new Date(createProjectDto.startedAt) : null,
            finishedAt: createProjectDto.finishedAt ? new Date(createProjectDto.finishedAt) : null,
            deadline: createProjectDto.deadline ? new Date(createProjectDto.deadline) : null,
            notes: createProjectDto.notes,
            clientFeedback: createProjectDto.clientFeedback,
            internalNotes: createProjectDto.internalNotes,
            isPublic: createProjectDto.isPublic ?? true,
            allowClientUpdates: createProjectDto.allowClientUpdates ?? false,
            lastUpdatedBy: createdBy,
          },
          include: {
            client: true,
            assignedTo: true,
            budget: true,
          },
        });

        // Create project history entry
        await prisma.projectHistory.create({
          data: {
            projectId: newProject.id,
            action: 'PROJECT_CREATED',
            details: JSON.stringify({
              title: newProject.title,
              clientName: newProject.clientName,
              status: newProject.status,
              priority: newProject.priority,
            }),
            createdBy: createdBy,
          },
        });

        // Add services to project if provided
        if (createProjectDto.services && createProjectDto.services.length > 0) {
          for (const serviceDto of createProjectDto.services) {
            await prisma.projectService.create({
              data: {
                projectId: newProject.id,
                serviceId: serviceDto.serviceId,
                quantity: serviceDto.quantity || 1,
                unitPrice: serviceDto.unitPrice || null,
                unitCost: serviceDto.unitCost || null,
                discount: serviceDto.discount || 0,
                status: serviceDto.status || 'PENDING',
                startDate: serviceDto.startDate ? new Date(serviceDto.startDate) : null,
                endDate: serviceDto.endDate ? new Date(serviceDto.endDate) : null,
                assignedTo: serviceDto.assignedTo || null,
                notes: serviceDto.notes,
              },
            });
          }
        }

        // Add products to project if provided
        if (createProjectDto.products && createProjectDto.products.length > 0) {
          for (const productDto of createProjectDto.products) {
            await prisma.projectProduct.create({
              data: {
                projectId: newProject.id,
                productId: productDto.productId,
                quantity: productDto.quantity || 1,
                unitPrice: productDto.unitPrice || null,
                unitCost: productDto.unitCost || null,
                discount: productDto.discount || 0,
                status: productDto.status || 'PENDING',
                orderDate: productDto.orderDate ? new Date(productDto.orderDate) : null,
                receivedDate: productDto.receivedDate ? new Date(productDto.receivedDate) : null,
                installedDate: productDto.installedDate ? new Date(productDto.installedDate) : null,
                notes: productDto.notes,
              },
            });
          }
        }

        // Create milestones if provided
        if (createProjectDto.milestones && createProjectDto.milestones.length > 0) {
          for (const milestoneDto of createProjectDto.milestones) {
            await prisma.projectMilestone.create({
              data: {
                projectId: newProject.id,
                title: milestoneDto.title,
                description: milestoneDto.description,
                dueDate: milestoneDto.dueDate ? new Date(milestoneDto.dueDate) : null,
                order: milestoneDto.order || 1,
              },
            });
          }
        }

        // Create proforma only
        let proforma: any = null;
        if (createProjectDto.createEmptyProforma || 
            (createProjectDto.services && createProjectDto.services.length > 0) || 
            (createProjectDto.products && createProjectDto.products.length > 0)) {
          
          // Generate proforma number
          const proformaCount = await prisma.proforma.count();
          const proformaNumber = `PROF-${new Date().getFullYear()}-${String(proformaCount + 1).padStart(3, '0')}`;

          // Calculate totals
          let subtotal = 0;
          const proformaItems: any[] = [];

          // Add services to proforma
          if (createProjectDto.services) {
            for (const serviceDto of createProjectDto.services) {
              const service = await prisma.service.findUnique({
                where: { id: serviceDto.serviceId },
              });
              
              if (!service) {
                throw new NotFoundException(`Service with ID ${serviceDto.serviceId} not found`);
              }
              
              const unitPrice = serviceDto.unitPrice || service.price || 0;
              const quantity = serviceDto.quantity || 1;
              const itemTotal = unitPrice * quantity;
              subtotal += itemTotal;

              proformaItems.push({
                serviceId: serviceDto.serviceId,
                productId: null,
                quantity: quantity,
                unitPrice: unitPrice,
                description: service.name,
              });
            }
          }

          // Add products to proforma
          if (createProjectDto.products) {
            for (const productDto of createProjectDto.products) {
              const product = await prisma.product.findUnique({
                where: { id: productDto.productId },
              });
              
              if (!product) {
                throw new NotFoundException(`Product with ID ${productDto.productId} not found`);
              }
              
              const unitPrice = productDto.unitPrice || product.sellingPrice || 0;
              const quantity = productDto.quantity || 1;
              const itemTotal = unitPrice * quantity;
              subtotal += itemTotal;

              proformaItems.push({
                serviceId: null,
                productId: productDto.productId,
                quantity: quantity,
                unitPrice: unitPrice,
                description: product.name,
              });
            }
          }

          // Create proforma
          proforma = await prisma.proforma.create({
            data: {
              proformaNumber: proformaNumber,
              clientName: newProject.clientName || 'Client',
              clientEmail: newProject.clientEmail || null,
              clientPhone: newProject.clientPhone || null,
              projectId: newProject.id,
              subtotal: subtotal,
              total: subtotal,
              notes: createProjectDto.proformaNotes,
              issuedAt: new Date(),
              status: 'DRAFT',
              currency: 'USD',
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
          }) as any;

          // Create proforma items
          await Promise.all(
            (proformaItems as any[]).map((item: any) =>
              prisma.proformaItem.create({
                data: {
                  proformaId: proforma.id,
                  serviceId: item.serviceId || null,
                  productId: item.productId || null,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  description: item.description,
                  subtotal: item.quantity * item.unitPrice,
                  totalAfterDiscount: item.quantity * item.unitPrice,
                  total: item.quantity * item.unitPrice,
                },
              }),
            ),
          );
        }

        return {
          project: newProject,
          proforma,
        };
      });

      // Send notifications outside transaction
      await this.notifyProjectCreated(result.project, createdBy);
      if (result.proforma) {
        await this.notifyProformaCreated(result.project, result.proforma, createdBy);
      }

      return result;
    } catch (error) {
      console.error('Error creating project with proforma:', error);
      throw error;
    }
  }

  async createWithoutInvoice(
    createProjectDto: CreateProjectWithoutInvoiceDto,
    createdBy: number,
  ) {
    // Verify client exists if provided
    if (createProjectDto.clientId) {
      const client = await this.prisma.user.findUnique({
        where: { id: createProjectDto.clientId },
      });

      if (!client) {
        throw new NotFoundException(
          `Client with ID ${createProjectDto.clientId} not found`,
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
          clientId: createProjectDto.clientId || null,
          budgetId: createProjectDto.budgetId || null,
          assignedToId: createProjectDto.assignedToId || null,
          status: createProjectDto.status || 'PENDING',
          priority: createProjectDto.priority || 'MEDIUM',
          estimatedHours: createProjectDto.estimatedHours || null,
          timeEstimated: timeEstimated || null,
          progress: createProjectDto.progress || 0,
          timeSpent: createProjectDto.timeSpent ?? 0,
          actualHours: createProjectDto.actualHours ?? (createProjectDto.timeSpent ? Math.round(createProjectDto.timeSpent / 60) : null),
          lastActivityAt: createProjectDto.lastActivityAt ? new Date(createProjectDto.lastActivityAt) : new Date(),
          startedAt: createProjectDto.startedAt ? new Date(createProjectDto.startedAt) : null,
          finishedAt: createProjectDto.finishedAt ? new Date(createProjectDto.finishedAt) : null,
          deadline: createProjectDto.deadline ? new Date(createProjectDto.deadline) : null,
          notes: createProjectDto.notes,
          clientFeedback: createProjectDto.clientFeedback,
          internalNotes: createProjectDto.internalNotes,
          isPublic: createProjectDto.isPublic ?? true,
          allowClientUpdates: createProjectDto.allowClientUpdates ?? false,
          lastUpdatedBy: createdBy,
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
                  expense: service.unitCost || 0,
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

            const projectService = await prisma.projectService.create({
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
              },
            });
            await this.notifyServiceAdded(newProject, projectService, createdBy);
            return projectService;
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

            const projectProduct = await prisma.projectProduct.create({
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
            await this.notifyProductAdded(newProject, projectProduct, createdBy);
            return projectProduct;
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
        invoice = await this.createProjectInvoice(
          newProject.id,
          createdBy,
          createProjectDto.notes,
        );

        // Get the created invoice items
        invoiceItems = await prisma.invoiceItem.findMany({
          where: { invoiceId: invoice.id },
          include: {
            service: true,
            product: true,
          },
        });
        await this.notifyInvoiceCreated(newProject, invoice, createdBy);
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

    await this.notifyProgressUpdate(project, oldProgress, newProgress, updatedBy);

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

    await this.notifyTimeTrackingAlert(project, timeEntry, userId);

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

    const endTime = stopTimeEntryDto.endTime ? new Date(stopTimeEntryDto.endTime) : new Date();
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

    // Get project for notification
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (project) {
      await this.notifyTimeTrackingAlert(project, updatedEntry, userId);
    }

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

    await this.notifyTimeTrackingAlert(project, timeEntry, userId);

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

    // Delete related records first
    await this.prisma.$transaction(async (prisma) => {
      // Delete project-related records in the correct order
      await prisma.projectTimeEntry.deleteMany({
        where: { projectId: id },
      });

      await prisma.projectMilestone.deleteMany({
        where: { projectId: id },
      });

      await prisma.projectHistory.deleteMany({
        where: { projectId: id },
      });

      await prisma.projectUpdate.deleteMany({
        where: { projectId: id },
      });

      await prisma.projectService.deleteMany({
        where: { projectId: id },
      });

      await prisma.projectProduct.deleteMany({
        where: { projectId: id },
      });

      await prisma.expense.deleteMany({
        where: { projectId: id },
      });

      await prisma.message.deleteMany({
        where: { projectId: id },
      });

      await prisma.task.deleteMany({
        where: { projectId: id },
      });

      await prisma.revenue.deleteMany({
        where: { projectId: id },
      });

      await prisma.profit.deleteMany({
        where: { projectId: id },
      });

      // Instead of deleting invoices and proformas, set their projectId to null
      // This keeps the invoices and proformas but removes the project association
      await prisma.invoice.updateMany({
        where: { projectId: id },
        data: { projectId: null },
      });

      await prisma.proforma.updateMany({
        where: { projectId: id },
        data: { projectId: null },
      });

      // Finally delete the project
      await prisma.project.delete({
        where: { id },
      });
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
      include: {
        client: true,
        assignedTo: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status !== 'PENDING') {
      throw new BadRequestException(
        `Project is not in PENDING status. Current status: ${project.status}`,
      );
    }

    const oldStatus = project.status;
    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: startProjectDto.startedAt || new Date(),
        notes: startProjectDto.notes || project.notes,
      },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    // Create project history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'PROJECT_STARTED',
        details: JSON.stringify({
          startedAt: updatedProject.startedAt,
          notes: startProjectDto.notes,
        }),
        createdBy: startedBy,
      },
    });

    // Send notifications
    await this.notifyProjectStatusChange(updatedProject, oldStatus, 'IN_PROGRESS', startedBy);

    return {
      message: 'Project started successfully',
      project: updatedProject,
      oldStatus,
      newStatus: 'IN_PROGRESS',
    };
  }

  async completeProject(
    projectId: number,
    completeProjectDto: CompleteProjectDto,
    completedBy: number,
  ): Promise<ProjectStatusResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        `Project is not in progress. Current status: ${project.status}`,
      );
    }

    const oldStatus = project.status;
    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'COMPLETED',
        finishedAt: completeProjectDto.finishedAt || new Date(),
        progress: 100,
        notes: completeProjectDto.notes || project.notes,
        clientFeedback: completeProjectDto.clientFeedback || project.clientFeedback,
      },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    // Create project history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'PROJECT_COMPLETED',
        details: JSON.stringify({
          finishedAt: updatedProject.finishedAt,
          notes: completeProjectDto.notes,
          clientFeedback: completeProjectDto.clientFeedback,
        }),
        createdBy: completedBy,
      },
    });

    // Capture revenue from project services and products
    const projectWithItems = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        services: {
          include: { service: true },
        },
        products: {
          include: { product: true },
        },
      },
    });

    if (!projectWithItems) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const revenueResults: any[] = [];

    // Capture revenue from services
    for (const projectService of projectWithItems.services) {
      try {
        const serviceRevenue = await this.createRevenueFromSoldService(
          projectService.serviceId,
          projectService.quantity,
          projectService.unitPrice || projectService.service.price,
          projectWithItems.clientName || '',
          projectWithItems.clientEmail || undefined,
          projectWithItems.clientPhone || undefined,
          `Revenue from completed project: ${projectWithItems.title}`,
        );
        revenueResults.push({
          type: 'service',
          serviceName: projectService.service.name,
          revenue: serviceRevenue,
        });
      } catch (error) {
        console.error(`Failed to capture revenue for service ${projectService.serviceId}:`, error);
      }
    }

    // Capture revenue from products
    for (const projectProduct of projectWithItems.products) {
      try {
        const productRevenue = await this.createRevenueFromSoldProduct(
          projectProduct.productId,
          projectProduct.quantity,
          projectProduct.unitPrice || projectProduct.product.sellingPrice,
          projectWithItems.clientName || '',
          projectWithItems.clientEmail || undefined,
          projectWithItems.clientPhone || undefined,
          `Revenue from completed project: ${projectWithItems.title}`,
        );
        revenueResults.push({
          type: 'product',
          productName: projectProduct.product.name,
          revenue: productRevenue,
        });
      } catch (error) {
        console.error(`Failed to capture revenue for product ${projectProduct.productId}:`, error);
      }
    }

    // Send notifications
    await this.notifyProjectStatusChange(updatedProject, oldStatus, 'COMPLETED', completedBy);

    return {
      message: 'Project completed successfully',
      project: updatedProject,
      oldStatus,
      newStatus: 'COMPLETED',
      revenueCaptured: revenueResults.length > 0,
      revenueResults,
    } as any;
  }

  async cancelProject(
    projectId: number,
    cancelProjectDto: CancelProjectDto,
    cancelledBy: number,
  ): Promise<ProjectStatusResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed project');
    }

    const oldStatus = project.status;
    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'CANCELLED',
        notes: cancelProjectDto.notes || project.notes,
      },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    // Create project history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'PROJECT_CANCELLED',
        details: JSON.stringify({
          reason: cancelProjectDto.reason,
          notes: cancelProjectDto.notes,
        }),
        createdBy: cancelledBy,
      },
    });

    // Send notifications
    await this.notifyProjectStatusChange(updatedProject, oldStatus, 'CANCELLED', cancelledBy);

    return {
      message: 'Project cancelled successfully',
      project: updatedProject,
      oldStatus,
      newStatus: 'CANCELLED',
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
      include: {
        client: true,
        assignedTo: true,
      },
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
          expense: serviceDto.unitCost || 0,
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

    // Send notifications
    await this.notifyServiceAdded(project, projectService, addedBy);

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
      include: {
        client: true,
        assignedTo: true,
      },
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
      if (!productDto.productName) {
        throw new BadRequestException(
          'Product name is required when creating a new product',
        );
      }

      const newProduct = await this.prisma.product.create({
        data: {
          name: productDto.productName,
          description: productDto.productDescription,
          buyingPrice: productDto.unitCost || 0,
          sellingPrice: productDto.unitPrice || 0,
          stock: productDto.quantity || 0,
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

    // Send notifications
    await this.notifyProductAdded(project, projectProduct, addedBy);

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
        clientEmail: project.clientEmail || null,
        clientPhone: project.clientPhone || null,
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

    // Create project history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'INVOICE_CREATED',
        details: JSON.stringify({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
        }),
        createdBy: createdBy,
      },
    });

    // Send notifications
    await this.notifyInvoiceCreated(project, invoice, createdBy);

    return invoice;
  }

  async createProjectProforma(
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

    // Calculate proforma totals
    let subtotal = 0;
    const proformaItems: any[] = [];

    // Add services to proforma
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

      proformaItems.push({
        serviceId: projectService.serviceId,
        quantity: projectService.quantity,
        unitPrice: unitPrice,
        description: serviceDescription,
      });
    }

    // Add products to proforma
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

      proformaItems.push({
        productId: projectProduct.productId,
        quantity: projectProduct.quantity,
        unitPrice: unitPrice,
        description: productDescription,
      });
    }

    // Generate proforma number
    const lastProforma = await this.prisma.proforma.findFirst({
      orderBy: { proformaNumber: 'desc' },
    });
    const proformaNumber = lastProforma
      ? parseInt(lastProforma.proformaNumber) + 1
      : 1;

    // Create proforma
    const proforma = await this.prisma.proforma.create({
      data: {
        proformaNumber: proformaNumber.toString().padStart(6, '0'),
        clientName: project.clientName || '',
        clientEmail: project.clientEmail || null,
        clientPhone: project.clientPhone || null,
        projectId: projectId,
        subtotal: subtotal,
        total: subtotal,
        notes: notes,
        issuedAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Create proforma items
    await Promise.all(
      proformaItems.map((item) =>
        this.prisma.proformaItem.create({
          data: {
            proformaId: proforma.id,
            serviceId: item.serviceId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            description: item.description,
          },
        }),
      ),
    );

    // Create project history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'PROFORMA_CREATED',
        details: JSON.stringify({
          proformaId: proforma.id,
          proformaNumber: proforma.proformaNumber,
          total: proforma.total,
        }),
        createdBy: createdBy,
      },
    });

    // Send notifications
    await this.notifyProformaCreated(project, proforma, createdBy);

    return proforma;
  }

  // ==================== REVENUE MANAGEMENT ====================

  async createRevenueFromInvoice(
    invoiceId: number,
    amount: number,
    receivedAt: Date = new Date(),
  ) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        project: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    // Create revenue record
    const revenue = await this.prisma.revenue.create({
      data: {
        projectId: invoice.projectId,
        invoiceId: invoiceId,
        amount: amount,
        receivedAt: receivedAt,
      },
    });

    // Create project history entry
    if (invoice.projectId) {
      await this.prisma.projectHistory.create({
        data: {
          projectId: invoice.projectId,
          action: 'REVENUE_RECEIVED',
          details: JSON.stringify({
            invoiceId: invoiceId,
            amount: amount,
            revenueId: revenue.id,
          }),
          createdBy: 1, // System user
        },
      });
    }

    await this.notifyPaymentReceived(invoice.project, revenue, 1); // Assuming 1 is system user

    return revenue;
  }

  async createRevenueFromSoldService(
    serviceId: number,
    quantity: number,
    sellingPrice: number,
    customerName?: string,
    customerEmail?: string,
    customerPhone?: string,
    notes?: string,
  ) {
    // Create sold service record
    const soldService = await this.prisma.soldService.create({
      data: {
        serviceId: serviceId,
        quantity: quantity,
        sellingPrice: sellingPrice,
        unitExpense: 0, // Will be calculated from service cost
        totalRevenue: quantity * sellingPrice,
        totalProfit: 0, // Will be calculated
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        notes: notes,
      },
    });

    // Get service cost for profit calculation
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (service && service.expense) {
      const totalExpense = quantity * service.expense;
      const totalProfit = soldService.totalRevenue - totalExpense;

      // Update sold service with expense and profit
      await this.prisma.soldService.update({
        where: { id: soldService.id },
        data: {
          unitExpense: service.expense,
          totalProfit: totalProfit,
        },
      });
    }

    // Create revenue record
    const revenue = await this.prisma.revenue.create({
      data: {
        soldServiceId: soldService.id,
        amount: soldService.totalRevenue,
      },
    });

    // Revenue notification handled by the notification service

    return { soldService, revenue };
  }

  async createRevenueFromSoldProduct(
    productId: number,
    quantity: number,
    sellingPrice: number,
    customerName?: string,
    customerEmail?: string,
    customerPhone?: string,
    notes?: string,
  ) {
    // Get product details for cost calculation
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check stock availability
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    // Create sold product record
    const soldProduct = await this.prisma.soldProduct.create({
      data: {
        productId: productId,
        quantity: quantity,
        sellingPrice: sellingPrice,
        buyingPrice: product.buyingPrice,
        totalRevenue: quantity * sellingPrice,
        totalProfit: quantity * (sellingPrice - product.buyingPrice),
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        notes: notes,
      },
    });

    // Update product stock
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: product.stock - quantity,
      },
    });

    // Create inventory transaction
    await this.prisma.inventoryTransaction.create({
      data: {
        productId: productId,
        quantity: quantity,
        transactionType: 'OUTGOING',
        note: `Sold to ${customerName || 'Customer'}`,
      },
    });

    // Create revenue record
    const revenue = await this.prisma.revenue.create({
      data: {
        soldProductId: soldProduct.id,
        amount: soldProduct.totalRevenue,
      },
    });

    // Revenue notification handled by the notification service

    return { soldProduct, revenue };
  }

  // ==================== EXPENSE MANAGEMENT ====================

  async createProjectExpense(
    projectId: number,
    amount: number,
    note: string,
    fundingSource: 'BUDGET' | 'PROFIT' = 'BUDGET',
    budgetId?: number,
  ) {
    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Validate budget if using budget funding
    if (fundingSource === 'BUDGET' && budgetId) {
      const budget = await this.prisma.budget.findUnique({
        where: { id: budgetId },
        include: {
          expenses: {
            where: {
              fundingSource: 'BUDGET',
            },
          },
        },
      });

      if (!budget) {
        throw new NotFoundException(`Budget with ID ${budgetId} not found`);
      }

      const totalExpenses = budget.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );
      const availableFunds = budget.amount - totalExpenses;

      if (availableFunds < amount) {
        throw new BadRequestException(
          `Insufficient budget funds. Available: $${availableFunds.toFixed(2)}, Required: $${amount.toFixed(2)}`,
        );
      }
    }

    // Create expense
    const expense = await this.prisma.expense.create({
      data: {
        projectId: projectId,
        budgetId: budgetId,
        amount: amount,
        note: note,
        fundingSource: fundingSource,
      },
    });

    // Create project history entry
    await this.prisma.projectHistory.create({
      data: {
        projectId: projectId,
        action: 'EXPENSE_ADDED',
        details: JSON.stringify({
          expenseId: expense.id,
          amount: amount,
          note: note,
          fundingSource: fundingSource,
        }),
        createdBy: 1, // System user
      },
    });

    return expense;
  }

  // ==================== PROFIT CALCULATION ====================

  async calculateProjectProfit(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        services: {
          include: { service: true },
        },
        products: {
          include: { product: true },
        },
        Revenue: true,
        expenses: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    let totalRevenue = 0;
    let totalCost = 0;
    let totalExpenses = 0;

    // Calculate revenue from project
    project.Revenue.forEach((revenue) => {
      totalRevenue += revenue.amount;
    });

    // Calculate costs from services
    project.services.forEach((projectService) => {
              const unitCost = projectService.unitCost || projectService.service?.expense || 0;
      const quantity = projectService.quantity || 1;
      totalCost += unitCost * quantity;
    });

    // Calculate costs from products
    project.products.forEach((projectProduct) => {
      const unitCost = projectProduct.unitCost || projectProduct.product?.buyingPrice || 0;
      const quantity = projectProduct.quantity || 1;
      totalCost += unitCost * quantity;
    });

    // Calculate expenses
    project.expenses.forEach((expense) => {
      totalExpenses += expense.amount;
    });

    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalExpenses;

    // Create or update profit record
    const existingProfit = await this.prisma.profit.findFirst({
      where: { projectId: projectId },
    });

    if (existingProfit) {
      await this.prisma.profit.update({
        where: { id: existingProfit.id },
        data: {
          amount: netProfit,
          calculatedAt: new Date(),
        },
      });
    } else {
      await this.prisma.profit.create({
        data: {
          projectId: projectId,
          amount: netProfit,
        },
      });
    }

    return {
      totalRevenue,
      totalCost,
      totalExpenses,
      grossProfit,
      netProfit,
    };
  }

  // ==================== PROJECT FINANCIAL SUMMARY ====================

  async getProjectFinancialSummary(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        services: {
          include: { service: true },
        },
        products: {
          include: { product: true },
        },
        Revenue: true,
        expenses: true,
        Profit: true,
        invoices: {
          include: {
            Payment: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Calculate totals
    const totalServicesValue = project.services.reduce((sum, ps) => {
      const unitPrice = ps.unitPrice || ps.service?.price || 0;
      const quantity = ps.quantity || 1;
      const discount = ps.discount || 0;
      return sum + (unitPrice * quantity - discount);
    }, 0);

    const totalProductsValue = project.products.reduce((sum, pp) => {
      const unitPrice = pp.unitPrice || pp.product?.sellingPrice || 0;
      const quantity = pp.quantity || 1;
      const discount = pp.discount || 0;
      return sum + (unitPrice * quantity - discount);
    }, 0);

    const totalRevenue = project.Revenue.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalProfit = project.Profit.length > 0 ? project.Profit[0].amount : 0;

    const paidInvoices = project.invoices.filter(invoice => 
      invoice.Payment.length > 0
    );
    const unpaidInvoices = project.invoices.filter(invoice => 
      invoice.Payment.length === 0
    );

    const totalPaidAmount = paidInvoices.reduce((sum, invoice) => {
      return sum + invoice.Payment.reduce((paymentSum, payment) => 
        paymentSum + payment.amount, 0
      );
    }, 0);

    const totalUnpaidAmount = unpaidInvoices.reduce((sum, invoice) => 
      sum + invoice.total, 0
    );

    return {
      projectId: project.id,
      projectTitle: project.title,
      totalServicesValue,
      totalProductsValue,
      totalProjectValue: totalServicesValue + totalProductsValue,
      totalRevenue,
      totalExpenses,
      totalProfit,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      totalPaidAmount,
      totalUnpaidAmount,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    };
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

  // ==================== COMPREHENSIVE ALERT SYSTEM ====================

  async runAllAlerts() {
    const results = await Promise.all([
      this.scheduleDeadlineAlerts(),
      this.scheduleBudgetAlerts(),
      this.scheduleOverdueProjectAlerts(),
    ]);

    return {
      message: 'All alerts processed successfully',
      results,
    };
  }

  async getProjectAlerts(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        budget: {
          include: {
            expenses: true,
          },
        },
        expenses: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const alerts: any[] = [];

    // Deadline alerts
    if (project.deadline) {
      const now = new Date();
      const deadline = new Date(project.deadline);
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline <= 0) {
        alerts.push({
          type: 'DEADLINE_OVERDUE',
          severity: 'CRITICAL',
          message: `Project is overdue by ${Math.abs(daysUntilDeadline)} day(s)`,
          daysUntilDeadline,
        });
      } else if (daysUntilDeadline <= 3) {
        alerts.push({
          type: 'DEADLINE_URGENT',
          severity: 'HIGH',
          message: `Project is due in ${daysUntilDeadline} day(s)`,
          daysUntilDeadline,
        });
      } else if (daysUntilDeadline <= 7) {
        alerts.push({
          type: 'DEADLINE_WARNING',
          severity: 'MEDIUM',
          message: `Project is due in ${daysUntilDeadline} day(s)`,
          daysUntilDeadline,
        });
      }
    }

    // Budget alerts
    if (project.budget) {
      const totalExpenses = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const usagePercentage = (totalExpenses / project.budget.amount) * 100;

      if (usagePercentage >= 90) {
        alerts.push({
          type: 'BUDGET_CRITICAL',
          severity: 'CRITICAL',
          message: `Budget usage at ${usagePercentage.toFixed(1)}%`,
          usagePercentage,
          totalExpenses,
          budgetLimit: project.budget.amount,
        });
      } else if (usagePercentage >= 75) {
        alerts.push({
          type: 'BUDGET_WARNING',
          severity: 'HIGH',
          message: `Budget usage at ${usagePercentage.toFixed(1)}%`,
          usagePercentage,
          totalExpenses,
          budgetLimit: project.budget.amount,
        });
      }
    }

    // Progress alerts
    if (project.progress < 25 && project.status === 'IN_PROGRESS') {
      alerts.push({
        type: 'PROGRESS_SLOW',
        severity: 'MEDIUM',
        message: 'Project progress is below 25%',
        progress: project.progress,
      });
    }

    return {
      projectId: project.id,
      projectTitle: project.title,
      alerts,
      totalAlerts: alerts.length,
    };
  }
}
