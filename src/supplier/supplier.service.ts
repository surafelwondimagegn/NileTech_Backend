import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    try {
      // Check if supplier name already exists
      const nameExists = await this.checkNameExists(createSupplierDto.name);
      if (nameExists) {
        throw new ConflictException(
          `Supplier with name "${createSupplierDto.name}" already exists`,
        );
      }

      // Clean up empty strings for optional fields
      const cleanData = {
        ...createSupplierDto,
        email: createSupplierDto.email?.trim() || undefined,
        phone: createSupplierDto.phone?.trim() || undefined,
        address: createSupplierDto.address?.trim() || undefined,
        website: createSupplierDto.website?.trim() || undefined,
        contactPerson: createSupplierDto.contactPerson?.trim() || undefined,
        notes: createSupplierDto.notes?.trim() || undefined,
      };

      const supplier = await this.prisma.supplier.create({
        data: cleanData,
      });

      return supplier;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error.code === 'P2002') {
        // Unique constraint violation
        throw new ConflictException(
          'Supplier with this information already exists',
        );
      }

      console.error('Unexpected error in supplier creation:', error);
      throw new BadRequestException(
        'Failed to create supplier. Please try again.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.supplier.findMany({
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Unexpected error in supplier findAll:', error);
      throw new BadRequestException(
        'Failed to retrieve suppliers. Please try again.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              sku: true,
              stock: true,
              isActive: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      return supplier;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Unexpected error in supplier findOne:', error);
      throw new BadRequestException(
        'Failed to retrieve supplier. Please try again.',
      );
    }
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    try {
      // Check if supplier exists
      const existingSupplier = await this.findOne(id);

      // Check if supplier name already exists (if name is being updated)
      if (
        updateSupplierDto.name &&
        updateSupplierDto.name !== existingSupplier.name
      ) {
        const nameExists = await this.checkNameExists(
          updateSupplierDto.name,
          id,
        );
        if (nameExists) {
          throw new ConflictException(
            `Supplier with name "${updateSupplierDto.name}" already exists`,
          );
        }
      }

      // Clean up empty strings for optional fields
      const cleanData = {
        ...updateSupplierDto,
        email: updateSupplierDto.email?.trim() || undefined,
        phone: updateSupplierDto.phone?.trim() || undefined,
        address: updateSupplierDto.address?.trim() || undefined,
        website: updateSupplierDto.website?.trim() || undefined,
        contactPerson: updateSupplierDto.contactPerson?.trim() || undefined,
        notes: updateSupplierDto.notes?.trim() || undefined,
      };

      const supplier = await this.prisma.supplier.update({
        where: { id },
        data: cleanData,
      });

      return supplier;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      console.error('Unexpected error in supplier update:', error);
      throw new BadRequestException(
        'Failed to update supplier. Please try again.',
      );
    }
  }

  async remove(id: number) {
    try {
      // Check if supplier exists
      await this.findOne(id);

      const supplier = await this.prisma.supplier.delete({
        where: { id },
      });

      return supplier;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      if (error.code === 'P2003') {
        // Foreign key constraint violation - supplier is referenced by products
        throw new ConflictException(
          'Cannot delete supplier as it is referenced by products',
        );
      }

      console.error('Unexpected error in supplier deletion:', error);
      throw new BadRequestException(
        'Failed to delete supplier. Please try again.',
      );
    }
  }

  async checkNameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { name };
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }

      const existingSupplier = await this.prisma.supplier.findFirst({
        where: whereClause,
        select: { id: true },
      });

      return !!existingSupplier;
    } catch (error) {
      console.error('Error checking supplier name existence:', error);
      throw new BadRequestException(
        'Failed to check supplier name availability.',
      );
    }
  }

  async getActiveSuppliers() {
    try {
      return await this.prisma.supplier.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error getting active suppliers:', error);
      throw new BadRequestException('Failed to retrieve active suppliers.');
    }
  }

  async getStats() {
    try {
      const [total, active, inactive] = await Promise.all([
        this.prisma.supplier.count(),
        this.prisma.supplier.count({
          where: { isActive: true },
        }),
        this.prisma.supplier.count({
          where: { isActive: false },
        }),
      ]);

      return {
        total,
        active,
        inactive,
        totalValue: 0, // Placeholder for future enhancement
      };
    } catch (error) {
      console.error('Error getting supplier stats:', error);
      throw new BadRequestException('Failed to retrieve supplier statistics.');
    }
  }
} 