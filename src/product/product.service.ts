import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // Validate that selling price is greater than buying price
      if (createProductDto.sellingPrice <= createProductDto.buyingPrice) {
        throw new BadRequestException('Selling price must be greater than buying price');
      }

      // If budgetId is provided, check if budget exists and has sufficient funds
      if (createProductDto.budgetId) {
        const budget = await this.prisma.budget.findUnique({
          where: { id: createProductDto.budgetId },
        });

        if (!budget) {
          throw new NotFoundException(`Budget with ID ${createProductDto.budgetId} not found`);
        }

        const totalCost = createProductDto.buyingPrice * (createProductDto.stock || 0);
        if (budget.amount < totalCost) {
          throw new BadRequestException(
            `Insufficient budget. Required: ${totalCost}, Available: ${budget.amount}`
          );
        }

        // Deduct the cost from budget
        await this.prisma.budget.update({
          where: { id: createProductDto.budgetId },
          data: { amount: budget.amount - totalCost },
        });
      }

      const product = await this.prisma.product.create({
        data: createProductDto,
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

      return product;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('sku')) {
          throw new ConflictException(`Product with SKU "${createProductDto.sku}" already exists`);
        }
        if (error.meta?.target?.includes('barcode')) {
          throw new ConflictException(`Product with barcode "${createProductDto.barcode}" already exists`);
        }
        throw new ConflictException('Product with this information already exists');
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
      throw new BadRequestException('Failed to create product. Please try again.');
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
      throw new BadRequestException('Failed to retrieve products. Please try again.');
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
      throw new BadRequestException('Failed to retrieve product. Please try again.');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);

      // Validate that selling price is greater than buying price
      if (updateProductDto.sellingPrice !== undefined && updateProductDto.buyingPrice !== undefined) {
        if (updateProductDto.sellingPrice <= updateProductDto.buyingPrice) {
          throw new BadRequestException('Selling price must be greater than buying price');
        }
      } else if (updateProductDto.sellingPrice !== undefined) {
        const buyingPrice = updateProductDto.buyingPrice || existingProduct.buyingPrice;
        if (updateProductDto.sellingPrice <= buyingPrice) {
          throw new BadRequestException('Selling price must be greater than buying price');
        }
      } else if (updateProductDto.buyingPrice !== undefined) {
        const sellingPrice = updateProductDto.sellingPrice || existingProduct.sellingPrice;
        if (sellingPrice <= updateProductDto.buyingPrice) {
          throw new BadRequestException('Selling price must be greater than buying price');
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

      return product;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('sku')) {
          throw new ConflictException(`Product with SKU "${updateProductDto.sku}" already exists`);
        }
        if (error.meta?.target?.includes('barcode')) {
          throw new ConflictException(`Product with barcode "${updateProductDto.barcode}" already exists`);
        }
        throw new ConflictException('Product with this information already exists');
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
      throw new BadRequestException('Failed to update product. Please try again.');
    }
  }

  async remove(id: number) {
    try {
      // Check if product exists
      await this.findOne(id);

      const product = await this.prisma.product.delete({
        where: { id },
      });

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
        throw new ConflictException('Cannot delete product as it is referenced by other entities');
      }
      
      console.error('Unexpected error in product deletion:', error);
      throw new BadRequestException('Failed to delete product. Please try again.');
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

  async checkBarcodeExists(barcode: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = { barcode };
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }
      
      const existingProduct = await this.prisma.product.findFirst({
        where: whereClause,
        select: { id: true },
      });
      
      return !!existingProduct;
    } catch (error) {
      console.error('Error checking barcode existence:', error);
      throw new BadRequestException('Failed to check barcode availability.');
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
}
