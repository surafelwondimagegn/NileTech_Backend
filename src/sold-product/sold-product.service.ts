import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSoldProductDto } from './dto/create-sold-product.dto';
import { UpdateSoldProductDto } from './dto/update-sold-product.dto';
import { SoldProductResponseDto } from './dto/sold-product-response.dto';

@Injectable()
export class SoldProductService {
  constructor(private prisma: PrismaService) {}

  async create(
    createSoldProductDto: CreateSoldProductDto,
  ): Promise<SoldProductResponseDto> {
    const { productId, quantity, sellingPrice, ...customerData } =
      createSoldProductDto;

    // Check if product exists and has sufficient stock
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!product.isActive) {
      throw new BadRequestException(
        `Product with ID ${productId} is not active`,
      );
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    // Calculate totals
    const totalRevenue = quantity * sellingPrice;
    const totalProfit = quantity * (sellingPrice - product.buyingPrice);

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Create sold product record
      const soldProduct = await tx.soldProduct.create({
        data: {
          productId,
          quantity,
          sellingPrice,
          buyingPrice: product.buyingPrice,
          totalRevenue,
          totalProfit,
          ...customerData,
        },
        include: {
                  product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        },
      });

      // Update product stock
      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });

      // Create inventory transaction record
      await tx.inventoryTransaction.create({
        data: {
          productId,
          quantity,
          transactionType: 'OUTGOING',
          note: `Sold ${quantity} units for $${sellingPrice} each`,
        },
      });

      // Create revenue record
      await tx.revenue.create({
        data: {
          soldProductId: soldProduct.id,
          amount: totalRevenue,
        },
      });

      // Create profit record
      await tx.profit.create({
        data: {
          soldProductId: soldProduct.id,
          amount: totalProfit,
        },
      });

      return soldProduct;
    });

    return {
      id: result.id,
      productId: result.productId,
      quantity: result.quantity,
      sellingPrice: result.sellingPrice,
      buyingPrice: result.buyingPrice,
      totalRevenue: result.totalRevenue,
      totalProfit: result.totalProfit,
      customerName: result.customerName || undefined,
      customerEmail: result.customerEmail || undefined,
      customerPhone: result.customerPhone || undefined,
      notes: result.notes || undefined,
      soldAt: result.soldAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      product: result.product
        ? {
            id: result.product.id,
            name: result.product.name,
            sku: result.product.sku || undefined,
          }
        : undefined,
    };
  }

  async findAll(): Promise<SoldProductResponseDto[]> {
    const soldProducts = await this.prisma.soldProduct.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { soldAt: 'desc' },
    });

    return soldProducts.map((sp) => ({
      id: sp.id,
      productId: sp.productId,
      quantity: sp.quantity,
      sellingPrice: sp.sellingPrice,
      buyingPrice: sp.buyingPrice,
      totalRevenue: sp.totalRevenue,
      totalProfit: sp.totalProfit,
      customerName: sp.customerName || undefined,
      customerEmail: sp.customerEmail || undefined,
      customerPhone: sp.customerPhone || undefined,
      notes: sp.notes || undefined,
      soldAt: sp.soldAt,
      createdAt: sp.createdAt,
      updatedAt: sp.updatedAt,
      product: sp.product
        ? {
            id: sp.product.id,
            name: sp.product.name,
            sku: sp.product.sku || undefined,
          }
        : undefined,
    }));
  }

  async findOne(id: number): Promise<SoldProductResponseDto> {
    const soldProduct = await this.prisma.soldProduct.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    if (!soldProduct) {
      throw new NotFoundException(`Sold product with ID ${id} not found`);
    }

    return {
      id: soldProduct.id,
      productId: soldProduct.productId,
      quantity: soldProduct.quantity,
      sellingPrice: soldProduct.sellingPrice,
      buyingPrice: soldProduct.buyingPrice,
      totalRevenue: soldProduct.totalRevenue,
      totalProfit: soldProduct.totalProfit,
      customerName: soldProduct.customerName || undefined,
      customerEmail: soldProduct.customerEmail || undefined,
      customerPhone: soldProduct.customerPhone || undefined,
      notes: soldProduct.notes || undefined,
      soldAt: soldProduct.soldAt,
      createdAt: soldProduct.createdAt,
      updatedAt: soldProduct.updatedAt,
      product: soldProduct.product
        ? {
            id: soldProduct.product.id,
            name: soldProduct.product.name,
            sku: soldProduct.product.sku || undefined,
          }
        : undefined,
    };
  }

  async update(
    id: number,
    updateSoldProductDto: UpdateSoldProductDto,
  ): Promise<SoldProductResponseDto> {
    // Check if sold product exists
    const existingSoldProduct = await this.prisma.soldProduct.findUnique({
      where: { id },
    });

    if (!existingSoldProduct) {
      throw new NotFoundException(`Sold product with ID ${id} not found`);
    }

    // For sold products, we typically don't allow major updates after creation
    // Only allow updating customer information and notes
    const allowedUpdates = {
      customerName: updateSoldProductDto.customerName,
      customerEmail: updateSoldProductDto.customerEmail,
      customerPhone: updateSoldProductDto.customerPhone,
      notes: updateSoldProductDto.notes,
    };

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    const updatedSoldProduct = await this.prisma.soldProduct.update({
      where: { id },
      data: cleanUpdates,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    return {
      id: updatedSoldProduct.id,
      productId: updatedSoldProduct.productId,
      quantity: updatedSoldProduct.quantity,
      sellingPrice: updatedSoldProduct.sellingPrice,
      buyingPrice: updatedSoldProduct.buyingPrice,
      totalRevenue: updatedSoldProduct.totalRevenue,
      totalProfit: updatedSoldProduct.totalProfit,
      customerName: updatedSoldProduct.customerName || undefined,
      customerEmail: updatedSoldProduct.customerEmail || undefined,
      customerPhone: updatedSoldProduct.customerPhone || undefined,
      notes: updatedSoldProduct.notes || undefined,
      soldAt: updatedSoldProduct.soldAt,
      createdAt: updatedSoldProduct.createdAt,
      updatedAt: updatedSoldProduct.updatedAt,
      product: updatedSoldProduct.product
        ? {
            id: updatedSoldProduct.product.id,
            name: updatedSoldProduct.product.name,
            sku: updatedSoldProduct.product.sku || undefined,
          }
        : undefined,
    };
  }

  async remove(id: number): Promise<void> {
    const soldProduct = await this.prisma.soldProduct.findUnique({
      where: { id },
    });

    if (!soldProduct) {
      throw new NotFoundException(`Sold product with ID ${id} not found`);
    }

    // Use transaction to ensure data consistency when removing
    await this.prisma.$transaction(async (tx) => {
      // Restore product stock
      await tx.product.update({
        where: { id: soldProduct.productId },
        data: { stock: { increment: soldProduct.quantity } },
      });

      // Create inventory transaction for stock restoration
      await tx.inventoryTransaction.create({
        data: {
          productId: soldProduct.productId,
          quantity: soldProduct.quantity,
          transactionType: 'INCOMING',
          note: `Stock restored due to deletion of sale record ID ${id}`,
        },
      });

      // Delete related records first (due to foreign key constraints)
      await tx.revenue.deleteMany({
        where: { soldProductId: id },
      });

      await tx.profit.deleteMany({
        where: { soldProductId: id },
      });

      await tx.expense.deleteMany({
        where: { soldProductId: id },
      });

      // Delete the sold product record
      await tx.soldProduct.delete({
        where: { id },
      });
    });
  }

  async getSalesSummary() {
    const summary = await this.prisma.soldProduct.aggregate({
      _sum: {
        totalRevenue: true,
        totalProfit: true,
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalSales: summary._count.id,
      totalRevenue: summary._sum.totalRevenue || 0,
      totalProfit: summary._sum.totalProfit || 0,
      totalQuantitySold: summary._sum.quantity || 0,
    };
  }

  async getSalesByProduct(
    productId: number,
  ): Promise<SoldProductResponseDto[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const soldProducts = await this.prisma.soldProduct.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { soldAt: 'desc' },
    });

    return soldProducts.map((sp) => ({
      id: sp.id,
      productId: sp.productId,
      quantity: sp.quantity,
      sellingPrice: sp.sellingPrice,
      buyingPrice: sp.buyingPrice,
      totalRevenue: sp.totalRevenue,
      totalProfit: sp.totalProfit,
      customerName: sp.customerName || undefined,
      customerEmail: sp.customerEmail || undefined,
      customerPhone: sp.customerPhone || undefined,
      notes: sp.notes || undefined,
      soldAt: sp.soldAt,
      createdAt: sp.createdAt,
      updatedAt: sp.updatedAt,
      product: sp.product
        ? {
            id: sp.product.id,
            name: sp.product.name,
            sku: sp.product.sku || undefined,
          }
        : undefined,
    }));
  }

  async getSalesByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<SoldProductResponseDto[]> {
    const soldProducts = await this.prisma.soldProduct.findMany({
      where: {
        soldAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { soldAt: 'desc' },
    });

    return soldProducts.map((sp) => ({
      id: sp.id,
      productId: sp.productId,
      quantity: sp.quantity,
      sellingPrice: sp.sellingPrice,
      buyingPrice: sp.buyingPrice,
      totalRevenue: sp.totalRevenue,
      totalProfit: sp.totalProfit,
      customerName: sp.customerName || undefined,
      customerEmail: sp.customerEmail || undefined,
      customerPhone: sp.customerPhone || undefined,
      notes: sp.notes || undefined,
      soldAt: sp.soldAt,
      createdAt: sp.createdAt,
      updatedAt: sp.updatedAt,
      product: sp.product
        ? {
            id: sp.product.id,
            name: sp.product.name,
            sku: sp.product.sku || undefined,
          }
        : undefined,
    }));
  }
}
