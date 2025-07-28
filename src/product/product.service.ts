import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // Check if product name already exists
      const nameExists = await this.checkNameExists(createProductDto.name);
      if (nameExists) {
        throw new ConflictException(
          `Product with name "${createProductDto.name}" already exists`,
        );
      }

      // Validate that selling price is greater than buying price
      if (createProductDto.sellingPrice <= createProductDto.buyingPrice) {
        throw new BadRequestException(
          'Selling price must be greater than buying price',
        );
      }

      // Validate category exists if provided
      if (createProductDto.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: createProductDto.categoryId },
        });
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${createProductDto.categoryId} not found`,
          );
        }
      }

      // If budgetId is provided, check if budget exists and has sufficient funds
      if (createProductDto.budgetId) {
        const budget = await this.prisma.budget.findUnique({
          where: { id: createProductDto.budgetId },
        });

        if (!budget) {
          throw new NotFoundException(
            `Budget with ID ${createProductDto.budgetId} not found`,
          );
        }

        const totalCost =
          createProductDto.buyingPrice * (createProductDto.stock || 0);
        if (budget.amount < totalCost) {
          throw new BadRequestException(
            `Insufficient budget. Required: ${totalCost}, Available: ${budget.amount}`,
          );
        }

        // Deduct the cost from budget
        await this.prisma.budget.update({
          where: { id: createProductDto.budgetId },
          data: { amount: budget.amount - totalCost },
        });
      }

      // Validate tax exists if provided
      if (createProductDto.taxId) {
        const tax = await this.prisma.tax.findUnique({
          where: { id: createProductDto.taxId },
        });
        if (!tax) {
          throw new NotFoundException(
            `Tax with ID ${createProductDto.taxId} not found`,
          );
        }
        if (!tax.isActive) {
          throw new BadRequestException(`Tax "${tax.name}" is not active`);
        }
      }

      // Extract all valid fields from DTO
      const {
        name,
        categoryId,
        description,
        buyingPrice,
        sellingPrice,
        stock,
        image,
        weight,
        brand,
        model,
        quality,
        condition,
        warranty,
        supplier,
        supplierContact,
        minStockLevel,
        maxStockLevel,
        location,
        tags,
        budgetId,
        taxId,
        isActive,
      } = createProductDto;

      const product = await this.prisma.product.create({
        data: {
          name,
          categoryId,
          description,
          buyingPrice,
          sellingPrice,
          stock,
          image,
          sku: undefined, // Will be set after creation
          weight,
          brand,
          model,
          quality: quality || 'BRAND_NEW',
          condition,
          warranty,
          supplier,
          supplierContact,
          minStockLevel,
          maxStockLevel,
          location,
          tags,
          budgetId,
          taxId,
          isActive: isActive !== undefined ? isActive : true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          budget: {
            select: {
              id: true,
              name: true,
              amount: true,
            },
          },
        },
      });

      // Generate and update SKU after product creation
      const generatedSku = `Nile-Prod-${product.id}`;
      await this.prisma.product.update({
        where: { id: product.id },
        data: { sku: generatedSku },
      });
      product.sku = generatedSku;

      // Send notification
      await this.notificationService.notifyProductCreated(
        product.name,
        product.sellingPrice,
        product.stock,
        undefined, // createdBy parameter
      );

      return product;
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
        if (error.meta?.target?.includes('sku')) {
          throw new ConflictException(
            `Product with SKU "${createProductDto.sku}" already exists`,
          );
        }
        throw new ConflictException(
          'Product with this information already exists',
        );
      }

      if (error.code === 'P2003') {
        // Foreign key constraint violation
        if (error.meta?.fieldName?.includes('categoryId')) {
          throw new BadRequestException('Invalid category ID provided');
        }
        if (error.meta?.fieldName?.includes('budgetId')) {
          throw new BadRequestException('Invalid budget ID provided');
        }
        throw new BadRequestException('Invalid reference data provided');
      }

      console.error('Unexpected error in product creation:', error);
      throw new BadRequestException(
        'Failed to create product. Please try again.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.product.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          budget: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              transactions: true,
              invoiceItems: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Unexpected error in product findAll:', error);
      throw new BadRequestException(
        'Failed to retrieve products. Please try again.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          budget: {
            select: {
              id: true,
              name: true,
              amount: true,
            },
          },
          transactions: {
            select: {
              id: true,
              quantity: true,
              transactionType: true,
              note: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10, // Get last 10 transactions
          },
          _count: {
            select: {
              transactions: true,
              invoiceItems: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Unexpected error in product findOne:', error);
      throw new BadRequestException(
        'Failed to retrieve product. Please try again.',
      );
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);

      // Check if product name already exists (if name is being updated)
      if (
        updateProductDto.name &&
        updateProductDto.name !== existingProduct.name
      ) {
        const nameExists = await this.checkNameExists(
          updateProductDto.name,
          id,
        );
        if (nameExists) {
          throw new ConflictException(
            `Product with name "${updateProductDto.name}" already exists`,
          );
        }
      }

      // Validate category exists if provided
      if (updateProductDto.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: updateProductDto.categoryId },
        });
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${updateProductDto.categoryId} not found`,
          );
        }
      }

      // Validate budget exists if provided
      if (updateProductDto.budgetId) {
        const budget = await this.prisma.budget.findUnique({
          where: { id: updateProductDto.budgetId },
        });
        if (!budget) {
          throw new NotFoundException(
            `Budget with ID ${updateProductDto.budgetId} not found`,
          );
        }
      }

      // Validate that selling price is greater than buying price
      if (
        updateProductDto.sellingPrice !== undefined &&
        updateProductDto.buyingPrice !== undefined
      ) {
        if (updateProductDto.sellingPrice <= updateProductDto.buyingPrice) {
          throw new BadRequestException(
            'Selling price must be greater than buying price',
          );
        }
      } else if (updateProductDto.sellingPrice !== undefined) {
        const buyingPrice =
          updateProductDto.buyingPrice || existingProduct.buyingPrice;
        if (updateProductDto.sellingPrice <= buyingPrice) {
          throw new BadRequestException(
            'Selling price must be greater than buying price',
          );
        }
      } else if (updateProductDto.buyingPrice !== undefined) {
        const sellingPrice =
          updateProductDto.sellingPrice || existingProduct.sellingPrice;
        if (sellingPrice <= updateProductDto.buyingPrice) {
          throw new BadRequestException(
            'Selling price must be greater than buying price',
          );
        }
      }

      const product = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          budget: {
            select: {
              id: true,
              name: true,
              amount: true,
            },
          },
        },
      });

      // Detect changes and send notification
      const changes = this.detectProductChanges(
        existingProduct,
        updateProductDto,
      );
      if (changes.length > 0) {
        await this.notificationService.notifyProductUpdated(
          product.name,
          changes,
        );
      }

      return product;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('sku')) {
          throw new ConflictException(
            `Product with SKU "${updateProductDto.sku}" already exists`,
          );
        }
        throw new ConflictException(
          'Product with this information already exists',
        );
      }

      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      if (error.code === 'P2003') {
        // Foreign key constraint violation
        if (error.meta?.fieldName?.includes('categoryId')) {
          throw new BadRequestException('Invalid category ID provided');
        }
        if (error.meta?.fieldName?.includes('budgetId')) {
          throw new BadRequestException('Invalid budget ID provided');
        }
        throw new BadRequestException('Invalid reference data provided');
      }

      console.error('Unexpected error in product update:', error);
      throw new BadRequestException(
        'Failed to update product. Please try again.',
      );
    }
  }

  async remove(id: number) {
    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);

      const product = await this.prisma.product.delete({
        where: { id },
      });

      // Send notification
      await this.notificationService.notifyProductDeleted(existingProduct.name);

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      if (error.code === 'P2003') {
        // Foreign key constraint violation - product is referenced by other entities
        throw new ConflictException(
          'Cannot delete product as it is referenced by other entities',
        );
      }

      console.error('Unexpected error in product deletion:', error);
      throw new BadRequestException(
        'Failed to delete product. Please try again.',
      );
    }
  }

  async checkSkuExists(sku: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { sku };
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }

      const existingProduct = await this.prisma.product.findFirst({
        where: whereClause,
        select: { id: true },
      });

      return !!existingProduct;
    } catch (error) {
      console.error('Error checking SKU existence:', error);
      throw new BadRequestException('Failed to check SKU availability.');
    }
  }

  async getLowStockProducts(threshold: number = 10) {
    try {
      return await this.prisma.product.findMany({
        where: {
          stock: {
            lte: threshold,
          },
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          stock: 'asc',
        },
      });
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw new BadRequestException('Failed to retrieve low stock products.');
    }
  }

  async getProductsByCategory(categoryId: number) {
    try {
      return await this.prisma.product.findMany({
        where: {
          categoryId,
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw new BadRequestException('Failed to retrieve products by category.');
    }
  }

  async checkNameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { name };
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }

      const existingProduct = await this.prisma.product.findFirst({
        where: whereClause,
        select: { id: true },
      });

      return !!existingProduct;
    } catch (error) {
      console.error('Error checking product name existence:', error);
      throw new BadRequestException(
        'Failed to check product name availability.',
      );
    }
  }

  private detectProductChanges(
    existingProduct: any,
    updateProductDto: any,
  ): string[] {
    const changes: string[] = [];

    if (
      updateProductDto.name &&
      updateProductDto.name !== existingProduct.name
    ) {
      changes.push('name updated');
    }
    if (
      updateProductDto.buyingPrice &&
      updateProductDto.buyingPrice !== existingProduct.buyingPrice
    ) {
      changes.push('buying price updated');
    }
    if (
      updateProductDto.sellingPrice &&
      updateProductDto.sellingPrice !== existingProduct.sellingPrice
    ) {
      changes.push('selling price updated');
    }
    if (
      updateProductDto.stock !== undefined &&
      updateProductDto.stock !== existingProduct.stock
    ) {
      changes.push('stock updated');
    }
    if (
      updateProductDto.isActive !== undefined &&
      updateProductDto.isActive !== existingProduct.isActive
    ) {
      changes.push(updateProductDto.isActive ? 'activated' : 'deactivated');
    }

    return changes;
  }
}
