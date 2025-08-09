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
import { BudgetHistoryService } from '../budget-history/budget-history.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private budgetHistoryService: BudgetHistoryService,
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

      // Validate supplier exists if provided
      if (createProductDto.supplierId) {
        const supplier = await this.prisma.supplier.findUnique({
          where: { id: createProductDto.supplierId },
        });
        if (!supplier) {
          throw new NotFoundException(
            `Supplier with ID ${createProductDto.supplierId} not found`,
          );
        }
      }

      // Comprehensive budget management for product creation
      let budget = null;
      let budgetHistoryData = null;
      
      if (createProductDto.budgetId) {
        budget = await this.prisma.budget.findUnique({
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

        // Prepare budget history data
        budgetHistoryData = {
          budgetId: createProductDto.budgetId,
          action: 'PRODUCT_CREATED',
          oldValue: JSON.stringify({
            amount: budget.amount,
            description: `Budget before product creation: ${budget.name}`,
          }),
          newValue: JSON.stringify({
            amount: budget.amount - totalCost,
            productName: createProductDto.name,
            productCost: totalCost,
            description: `Budget deducted for product: ${createProductDto.name}`,
          }),
          changedBy: 1, // TODO: Get from JWT token
        };

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
        supplierId,
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
        minStockLevel,
        maxStockLevel,
        location,
        tags,
        budgetId,
        taxId,
        isActive,
      } = createProductDto;

      // Use uploaded image path if provided
      const imageUrl = image || null;

      const product = await this.prisma.product.create({
        data: {
          name,
          categoryId,
          supplierId,
          description,
          buyingPrice,
          sellingPrice,
          stock,
          image: imageUrl,
          sku: undefined, // Will be set after creation
          weight,
          brand,
          model,
          quality: quality || 'BRAND_NEW',
          condition,
          warranty,
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
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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
      const generatedSku = `NP-${product.id.toString().padStart(3, '0')}`;
      await this.prisma.product.update({
        where: { id: product.id },
        data: { sku: generatedSku },
      });
      product.sku = generatedSku;

      // Track budget history if budget was used
      if (budgetHistoryData) {
        await this.budgetHistoryService.createHistoryEntry(budgetHistoryData);
      }

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
            `Product with SKU "${createProductDto.sku || 'undefined'}" already exists`,
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
        if (error.meta?.fieldName?.includes('supplierId')) {
          throw new BadRequestException('Invalid supplier ID provided');
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
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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
      console.log('ProductService.findOne called with id:', id, 'type:', typeof id);
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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

      // Comprehensive budget management for product updates
      let budget = null;
      let budgetHistoryData = null;
      let budgetChanges = null;

      // Handle budget assignment/change
      if (updateProductDto.budgetId !== undefined) {
        budget = await this.prisma.budget.findUnique({
          where: { id: updateProductDto.budgetId },
        });
        
        if (!budget) {
          throw new NotFoundException(
            `Budget with ID ${updateProductDto.budgetId} not found`,
          );
        }

        // If product is being assigned to a budget for the first time
        if (!existingProduct.budgetId && updateProductDto.budgetId) {
          const totalCost = existingProduct.buyingPrice * existingProduct.stock;
          
          if (budget.amount < totalCost) {
            throw new BadRequestException(
              `Insufficient budget for existing product. Required: ${totalCost}, Available: ${budget.amount}`,
            );
          }

          budgetChanges = {
            action: 'BUDGET_ASSIGNED',
            oldValue: JSON.stringify({
              amount: budget.amount,
              description: `Budget before assigning product: ${budget.name}`,
            }),
            newValue: JSON.stringify({
              amount: budget.amount - totalCost,
              productName: existingProduct.name,
              productCost: totalCost,
              description: `Budget assigned to existing product: ${existingProduct.name}`,
            }),
          };

          // Deduct the cost from budget
          await this.prisma.budget.update({
            where: { id: updateProductDto.budgetId },
            data: { amount: budget.amount - totalCost },
          });
        }
        // If product is changing budgets
        else if (existingProduct.budgetId && existingProduct.budgetId !== updateProductDto.budgetId) {
          // Return funds to old budget
          const oldBudget = await this.prisma.budget.findUnique({
            where: { id: existingProduct.budgetId },
          });
          
          if (oldBudget) {
            const returnedAmount = existingProduct.buyingPrice * existingProduct.stock;
            await this.prisma.budget.update({
              where: { id: existingProduct.budgetId },
              data: { amount: oldBudget.amount + returnedAmount },
            });
          }

          // Check new budget capacity
          const totalCost = existingProduct.buyingPrice * existingProduct.stock;
          if (budget.amount < totalCost) {
            throw new BadRequestException(
              `Insufficient budget in new budget. Required: ${totalCost}, Available: ${budget.amount}`,
            );
          }

          budgetChanges = {
            action: 'BUDGET_CHANGED',
            oldValue: JSON.stringify({
              oldBudgetId: existingProduct.budgetId,
              oldBudgetAmount: oldBudget?.amount || 0,
              newBudgetId: updateProductDto.budgetId,
              newBudgetAmount: budget.amount,
              description: `Budget change for product: ${existingProduct.name}`,
            }),
            newValue: JSON.stringify({
              oldBudgetId: existingProduct.budgetId,
              oldBudgetAmount: (oldBudget?.amount || 0) + (existingProduct.buyingPrice * existingProduct.stock),
              newBudgetId: updateProductDto.budgetId,
              newBudgetAmount: budget.amount - totalCost,
              productName: existingProduct.name,
              productCost: totalCost,
              description: `Budget changed for product: ${existingProduct.name}`,
            }),
          };

          // Deduct from new budget
          await this.prisma.budget.update({
            where: { id: updateProductDto.budgetId },
            data: { amount: budget.amount - totalCost },
          });
        }
      }

      // Handle stock changes with budget validation
      if (updateProductDto.stock !== undefined && existingProduct.budgetId) {
        const stockDifference = updateProductDto.stock - existingProduct.stock;
        const costDifference = stockDifference * existingProduct.buyingPrice;
        
        if (stockDifference > 0) { // Stock increase
          const currentBudget = await this.prisma.budget.findUnique({
            where: { id: existingProduct.budgetId },
          });
          
          if (currentBudget && currentBudget.amount < costDifference) {
            throw new BadRequestException(
              `Insufficient budget for stock increase. Required: ${costDifference}, Available: ${currentBudget.amount}`,
            );
          }

          if (currentBudget) {
            budgetChanges = {
              action: 'STOCK_INCREASED',
              oldValue: JSON.stringify({
                amount: currentBudget.amount,
                oldStock: existingProduct.stock,
                description: `Budget before stock increase: ${currentBudget.name}`,
              }),
              newValue: JSON.stringify({
                amount: currentBudget.amount - costDifference,
                newStock: updateProductDto.stock,
                costDifference: costDifference,
                description: `Budget deducted for stock increase: ${existingProduct.name}`,
              }),
            };

            await this.prisma.budget.update({
              where: { id: existingProduct.budgetId },
              data: { amount: currentBudget.amount - costDifference },
            });
          }
        } else if (stockDifference < 0) { // Stock decrease
          const currentBudget = await this.prisma.budget.findUnique({
            where: { id: existingProduct.budgetId },
          });
          
          if (currentBudget) {
            const returnedAmount = Math.abs(costDifference);
            
            budgetChanges = {
              action: 'STOCK_DECREASED',
              oldValue: JSON.stringify({
                amount: currentBudget.amount,
                oldStock: existingProduct.stock,
                description: `Budget before stock decrease: ${currentBudget.name}`,
              }),
              newValue: JSON.stringify({
                amount: currentBudget.amount + returnedAmount,
                newStock: updateProductDto.stock,
                returnedAmount: returnedAmount,
                description: `Budget returned for stock decrease: ${existingProduct.name}`,
              }),
            };

            await this.prisma.budget.update({
              where: { id: existingProduct.budgetId },
              data: { amount: currentBudget.amount + returnedAmount },
            });
          }
        }
      }

      // Handle buying price changes with budget validation
      if (updateProductDto.buyingPrice !== undefined && existingProduct.budgetId) {
        const priceDifference = updateProductDto.buyingPrice - existingProduct.buyingPrice;
        const costDifference = priceDifference * existingProduct.stock;
        
        if (costDifference > 0) { // Price increase
          const currentBudget = await this.prisma.budget.findUnique({
            where: { id: existingProduct.budgetId },
          });
          
          if (currentBudget && currentBudget.amount < costDifference) {
            throw new BadRequestException(
              `Insufficient budget for price increase. Required: ${costDifference}, Available: ${currentBudget.amount}`,
            );
          }

          if (currentBudget) {
            budgetChanges = {
              action: 'PRICE_INCREASED',
              oldValue: JSON.stringify({
                amount: currentBudget.amount,
                oldPrice: existingProduct.buyingPrice,
                description: `Budget before price increase: ${currentBudget.name}`,
              }),
              newValue: JSON.stringify({
                amount: currentBudget.amount - costDifference,
                newPrice: updateProductDto.buyingPrice,
                costDifference: costDifference,
                description: `Budget deducted for price increase: ${existingProduct.name}`,
              }),
            };

            await this.prisma.budget.update({
              where: { id: existingProduct.budgetId },
              data: { amount: currentBudget.amount - costDifference },
            });
          }
        } else if (costDifference < 0) { // Price decrease
          const currentBudget = await this.prisma.budget.findUnique({
            where: { id: existingProduct.budgetId },
          });
          
          if (currentBudget) {
            const returnedAmount = Math.abs(costDifference);
            
            budgetChanges = {
              action: 'PRICE_DECREASED',
              oldValue: JSON.stringify({
                amount: currentBudget.amount,
                oldPrice: existingProduct.buyingPrice,
                description: `Budget before price decrease: ${currentBudget.name}`,
              }),
              newValue: JSON.stringify({
                amount: currentBudget.amount + returnedAmount,
                newPrice: updateProductDto.buyingPrice,
                returnedAmount: returnedAmount,
                description: `Budget returned for price decrease: ${existingProduct.name}`,
              }),
            };

            await this.prisma.budget.update({
              where: { id: existingProduct.budgetId },
              data: { amount: currentBudget.amount + returnedAmount },
            });
          }
        }
      }

      // Prepare budget history data if changes occurred
      if (budgetChanges) {
        budgetHistoryData = {
          budgetId: existingProduct.budgetId || updateProductDto.budgetId,
          action: budgetChanges.action,
          oldValue: budgetChanges.oldValue,
          newValue: budgetChanges.newValue,
          changedBy: 1, // TODO: Get from JWT token
        };
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

      // Keep uploaded image path as is
      const updateData = { ...updateProductDto };


      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
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

      // Track budget history if budget changes occurred
      if (budgetHistoryData) {
        await this.budgetHistoryService.createHistoryEntry(budgetHistoryData);
      }

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
            `Product with SKU "${updateProductDto.sku || 'undefined'}" already exists`,
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

      // Handle budget refund if product has a budget
      let budgetHistoryData = null;
      
      if (existingProduct.budgetId) {
        const budget = await this.prisma.budget.findUnique({
          where: { id: existingProduct.budgetId },
        });
        
        if (budget) {
          const refundAmount = existingProduct.buyingPrice * existingProduct.stock;
          
          // Prepare budget history data
          budgetHistoryData = {
            budgetId: existingProduct.budgetId,
            action: 'PRODUCT_DELETED',
            oldValue: JSON.stringify({
              amount: budget.amount,
              description: `Budget before product deletion: ${budget.name}`,
            }),
            newValue: JSON.stringify({
              amount: budget.amount + refundAmount,
              productName: existingProduct.name,
              refundAmount: refundAmount,
              description: `Budget refunded for deleted product: ${existingProduct.name}`,
            }),
            changedBy: 1, // TODO: Get from JWT token
          };

          // Refund the cost to budget
          await this.prisma.budget.update({
            where: { id: existingProduct.budgetId },
            data: { amount: budget.amount + refundAmount },
          });
        }
      }

      const product = await this.prisma.product.delete({
        where: { id },
      });

      // Track budget history if budget was refunded
      if (budgetHistoryData) {
        await this.budgetHistoryService.createHistoryEntry(budgetHistoryData);
      }

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

  async getProductsByBudget(budgetId: number) {
    try {
      return await this.prisma.product.findMany({
        where: { budgetId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          budget: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Unexpected error in getProductsByBudget:', error);
      throw new BadRequestException(
        'Failed to retrieve products by budget. Please try again.',
      );
    }
  }

  async getProductStats() {
    try {
      const [
        total,
        active,
        inactive,
        inStock,
        lowStock,
        outOfStock,
        totalValue,
        averagePrice
      ] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.product.count({ where: { isActive: false } }),
        this.prisma.product.count({ where: { stock: { gt: 10 } } }),
        this.prisma.product.count({ where: { stock: { lte: 10, gt: 0 } } }),
        this.prisma.product.count({ where: { stock: 0 } }),
        this.prisma.product.aggregate({
          _sum: {
            stock: true,
            buyingPrice: true,
          },
        }),
        this.prisma.product.aggregate({
          _avg: {
            sellingPrice: true,
          },
        }),
      ]);

      const totalValueResult = totalValue._sum.stock && totalValue._sum.buyingPrice 
        ? totalValue._sum.stock * totalValue._sum.buyingPrice 
        : 0;

      return {
        total,
        active,
        inactive,
        inStock,
        lowStock,
        outOfStock,
        totalValue: totalValueResult,
        averagePrice: averagePrice._avg.sellingPrice || 0,
      };
    } catch (error) {
      console.error('Unexpected error in getProductStats:', error);
      throw new BadRequestException(
        'Failed to retrieve product statistics. Please try again.',
      );
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

  // Helper method to calculate product cost
  private calculateProductCost(buyingPrice: number, stock: number): number {
    return buyingPrice * stock;
  }

  // Helper method to validate budget availability
  private async validateBudgetAvailability(
    budgetId: number,
    requiredAmount: number,
  ): Promise<{ budget: any; isAvailable: boolean }> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    return {
      budget,
      isAvailable: budget.amount >= requiredAmount,
    };
  }

  // Helper method to create budget history entry
  private async createBudgetHistoryEntry(data: {
    budgetId: number;
    action: string;
    oldValue: string;
    newValue: string;
    changedBy?: number;
  }) {
    return this.budgetHistoryService.createHistoryEntry({
      ...data,
      changedBy: data.changedBy || 1, // TODO: Get from JWT token
    });
  }
}
