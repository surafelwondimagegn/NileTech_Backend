import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ServiceService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    try {
      // Check if service name already exists
      const nameExists = await this.checkNameExists(createServiceDto.name);
      if (nameExists) {
        throw new ConflictException(
          `Service with name "${createServiceDto.name}" already exists`,
        );
      }

      // Generate a unique service code if not provided
      let serviceCode = createServiceDto.serviceCode;
      if (!serviceCode) {
        serviceCode = `SVC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      }

      const service = await this.prisma.service.create({
        data: {
          ...createServiceDto,
          serviceCode,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              projects: true,
              invoiceItems: true,
            },
          },
        },
      });

      // Send notification
      await this.notificationService.notifyServiceCreated(
        service.name,
        service.price,
      );

      return service;
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('serviceCode')) {
          throw new ConflictException(
            `Service with code "${createServiceDto.serviceCode}" already exists`,
          );
        }
        if (error.meta?.target?.includes('name')) {
          throw new ConflictException(
            `Service with name "${createServiceDto.name}" already exists`,
          );
        }
        throw new ConflictException(
          'Service with this information already exists',
        );
      }

      if (error.code === 'P2003') {
        // Foreign key constraint violation
        if (error.meta?.fieldName?.includes('categoryId')) {
          throw new BadRequestException('Invalid category ID provided');
        }
        throw new BadRequestException('Invalid reference data provided');
      }

      console.error('Unexpected error in service creation:', error);
      throw new BadRequestException(
        'Failed to create service. Please try again.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.service.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              projects: true,
              invoiceItems: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Unexpected error in service findAll:', error);
      throw new BadRequestException(
        'Failed to retrieve services. Please try again.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          projects: {
            select: {
              project: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  createdAt: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10, // Get last 10 projects
          },
          _count: {
            select: {
              projects: true,
              invoiceItems: true,
            },
          },
        },
      });

      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Unexpected error in service findOne:', error);
      throw new BadRequestException(
        'Failed to retrieve service. Please try again.',
      );
    }
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    try {
      // Check if service exists
      const existingService = await this.findOne(id);

      // Check if service name already exists (if name is being updated)
      if (
        updateServiceDto.name &&
        updateServiceDto.name !== existingService.name
      ) {
        const nameExists = await this.checkNameExists(
          updateServiceDto.name,
          id,
        );
        if (nameExists) {
          throw new ConflictException(
            `Service with name "${updateServiceDto.name}" already exists`,
          );
        }
      }

      const service = await this.prisma.service.update({
        where: { id },
        data: updateServiceDto,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              projects: true,
              invoiceItems: true,
            },
          },
        },
      });

      // Detect changes and send notification
      const changes = this.detectServiceChanges(
        existingService,
        updateServiceDto,
      );
      if (changes.length > 0) {
        await this.notificationService.notifyServiceUpdated(
          service.name,
          changes,
        );
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('serviceCode')) {
          throw new ConflictException(
            `Service with code "${updateServiceDto.serviceCode}" already exists`,
          );
        }
        if (error.meta?.target?.includes('name')) {
          throw new ConflictException(
            `Service with name "${updateServiceDto.name}" already exists`,
          );
        }
        throw new ConflictException(
          'Service with this information already exists',
        );
      }

      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      console.error('Unexpected error in service update:', error);
      throw new BadRequestException(
        'Failed to update service. Please try again.',
      );
    }
  }

  async remove(id: number) {
    try {
      // Check if service exists
      const existingService = await this.findOne(id);

      const service = await this.prisma.service.delete({
        where: { id },
      });

      // Send notification
      await this.notificationService.notifyServiceDeleted(existingService.name);

      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      if (error.code === 'P2003') {
        // Foreign key constraint violation - service is referenced by projects or invoice items
        throw new ConflictException(
          'Cannot delete service as it is referenced by projects or invoice items',
        );
      }

      console.error('Unexpected error in service deletion:', error);
      throw new BadRequestException(
        'Failed to delete service. Please try again.',
      );
    }
  }

  async findByCategory(categoryId: number) {
    try {
      return await this.prisma.service.findMany({
        where: { categoryId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              projects: true,
              invoiceItems: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Unexpected error in service findByCategory:', error);
      throw new BadRequestException(
        'Failed to retrieve services by category. Please try again.',
      );
    }
  }

  async findActiveServices() {
    try {
      return await this.prisma.service.findMany({
        where: { isActive: true },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              projects: true,
              invoiceItems: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Unexpected error in service findActiveServices:', error);
      throw new BadRequestException(
        'Failed to retrieve active services. Please try again.',
      );
    }
  }

  async checkNameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { name };
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }

      const existingService = await this.prisma.service.findFirst({
        where: whereClause,
        select: { id: true },
      });

      return !!existingService;
    } catch (error) {
      console.error('Error checking service name existence:', error);
      throw new BadRequestException(
        'Failed to check service name availability.',
      );
    }
  }

  async checkServiceCodeExists(
    serviceCode: string,
    excludeId?: number,
  ): Promise<boolean> {
    try {
      const whereClause: any = { serviceCode };
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }

      const existingService = await this.prisma.service.findFirst({
        where: whereClause,
        select: { id: true },
      });

      return !!existingService;
    } catch (error) {
      console.error('Error checking service code existence:', error);
      throw new BadRequestException(
        'Failed to check service code availability.',
      );
    }
  }

  private detectServiceChanges(
    existingService: any,
    updateServiceDto: any,
  ): string[] {
    const changes: string[] = [];

    if (
      updateServiceDto.name &&
      updateServiceDto.name !== existingService.name
    ) {
      changes.push('name updated');
    }
    if (
      updateServiceDto.price &&
      updateServiceDto.price !== existingService.price
    ) {
      changes.push('price updated');
    }
    if (
      updateServiceDto.description &&
      updateServiceDto.description !== existingService.description
    ) {
      changes.push('description updated');
    }
    if (
      updateServiceDto.duration !== undefined &&
      updateServiceDto.duration !== existingService.duration
    ) {
      changes.push('duration updated');
    }
    if (
      updateServiceDto.isActive !== undefined &&
      updateServiceDto.isActive !== existingService.isActive
    ) {
      changes.push(updateServiceDto.isActive ? 'activated' : 'deactivated');
    }
    if (
      updateServiceDto.warrantyDays !== undefined &&
      updateServiceDto.warrantyDays !== existingService.warrantyDays
    ) {
      changes.push('warranty period updated');
    }

    return changes;
  }

  async getServiceStats() {
    const services = await this.findAll();
    
    const totalServices = services.length;
    const activeServices = services.filter(service => service.isActive).length;
    const totalRevenue = services.reduce((sum, service) => sum + service.price, 0);
    const averagePrice = totalServices > 0 ? totalRevenue / totalServices : 0;
    
    // Get unique categories
    const categories = [...new Set(services.map(service => service.category?.name).filter(Boolean))];
    
    // Get services by category
    const servicesByCategory = services.reduce((acc, service) => {
      const categoryName = service.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName]++;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalServices,
      activeServices,
      totalRevenue,
      averagePrice,
      categories,
      servicesByCategory
    };
  }
}
