import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.prisma.category.create({
        data: createCategoryDto,
        include: {
          products: {
            select: {
              id: true,
              name: true,
              buyingPrice: true,
              sellingPrice: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });

      // Send notification
      await this.notificationService.notifyCategoryCreated(category.name);

      return category;
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('name')) {
          throw new ConflictException(
            `Category with name "${createCategoryDto.name}" already exists`,
          );
        }
        throw new ConflictException(
          'Category with this information already exists',
        );
      }

      if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw new BadRequestException('Invalid reference data provided');
      }

      // Log unexpected errors for debugging
      console.error('Unexpected error in category creation:', error);
      throw new BadRequestException(
        'Failed to create category. Please try again.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.category.findMany({
        include: {
          _count: {
            select: {
              products: true,
              services: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Unexpected error in category findAll:', error);
      throw new BadRequestException(
        'Failed to retrieve categories. Please try again.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              buyingPrice: true,
              sellingPrice: true,
              stock: true,
              createdAt: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              price: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              products: true,
              services: true,
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Unexpected error in category findOne:', error);
      throw new BadRequestException(
        'Failed to retrieve category. Please try again.',
      );
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      // Check if category exists
      const existingCategory = await this.findOne(id);

      const category = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
        include: {
          products: {
            select: {
              id: true,
              name: true,
              buyingPrice: true,
              sellingPrice: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });

      // Send notification for category update
      if (
        updateCategoryDto.name &&
        updateCategoryDto.name !== existingCategory.name
      ) {
        await this.notificationService.notifyCategoryUpdated(
          category.name,
          existingCategory.name,
        );
      } else {
        await this.notificationService.notifyCategoryUpdated(category.name);
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('name')) {
          throw new ConflictException(
            `Category with name "${updateCategoryDto.name}" already exists`,
          );
        }
        throw new ConflictException(
          'Category with this information already exists',
        );
      }

      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      console.error('Unexpected error in category update:', error);
      throw new BadRequestException(
        'Failed to update category. Please try again.',
      );
    }
  }

  async remove(id: number) {
    try {
      // Check if category exists
      const existingCategory = await this.findOne(id);

      const category = await this.prisma.category.delete({
        where: { id },
      });

      // Send notification
      await this.notificationService.notifyCategoryDeleted(
        existingCategory.name,
      );

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      if (error.code === 'P2003') {
        // Foreign key constraint violation - category is referenced by products or services
        throw new ConflictException(
          'Cannot delete category as it is referenced by products or services',
        );
      }

      console.error('Unexpected error in category deletion:', error);
      throw new BadRequestException(
        'Failed to delete category. Please try again.',
      );
    }
  }

  async checkNameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { name };
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }

      const existingCategory = await this.prisma.category.findFirst({
        where: whereClause,
        select: { id: true },
      });

      return !!existingCategory;
    } catch (error) {
      console.error('Error checking category name existence:', error);
      throw new BadRequestException(
        'Failed to check category name availability.',
      );
    }
  }
}
