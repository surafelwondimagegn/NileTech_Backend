import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSellProductDto,
  SellMultipleProductsDto,
  SellProductItemDto,
} from './dto/create-sell-product.dto';
import {
  SellMultipleServicesDto,
  SellServiceItemDto,
} from './dto/create-sell-service.dto';
import { SellResponseDto } from './dto/sell-response.dto';
import {
  SellCombinedDto,
  SellCombinedItemDto,
  ItemType,
} from './dto/create-sell-combined.dto';

@Injectable()
export class SellService {
  constructor(private readonly prisma: PrismaService) {}

  async sellProduct(dto: CreateSellProductDto): Promise<SellResponseDto> {
    return this._sellProductCore(dto);
  }

  async sellMultipleProducts(
    dto: SellMultipleProductsDto,
  ): Promise<SellResponseDto[]> {
    return this.prisma.$transaction(async (prisma) => {
      const results: SellResponseDto[] = [];
      for (const item of dto.items) {
        results.push(await this._sellProductCore(item, prisma));
      }
      return results;
    });
  }

  async sellMultipleServices(
    dto: SellMultipleServicesDto,
  ): Promise<SellResponseDto[]> {
    return this.prisma.$transaction(async (prisma) => {
      const results: SellResponseDto[] = [];
      for (const item of dto.items) {
        results.push(await this._sellServiceCore(item, prisma));
      }
      return results;
    });
  }

  async sellCombined(dto: SellCombinedDto): Promise<SellResponseDto[]> {
    return this.prisma.$transaction(async (prisma) => {
      const results: SellResponseDto[] = [];
      
      for (const item of dto.items) {
        if (item.type === ItemType.PRODUCT) {
          if (!item.productId) {
            throw new BadRequestException('Product ID is required for product items');
          }
          const productItem: SellProductItemDto = {
            productId: item.productId,
            quantity: item.quantity,
            customerName: item.customerName,
            customerEmail: item.customerEmail,
            customerPhone: item.customerPhone,
            notes: item.notes,
          };
          results.push(await this._sellProductCore(productItem, prisma));
        } else if (item.type === ItemType.SERVICE) {
          if (!item.serviceId) {
            throw new BadRequestException('Service ID is required for service items');
          }
          const serviceItem: SellServiceItemDto = {
            serviceId: item.serviceId,
            quantity: item.quantity,
            customerName: item.customerName,
            customerEmail: item.customerEmail,
            customerPhone: item.customerPhone,
            notes: item.notes,
          };
          results.push(await this._sellServiceCore(serviceItem, prisma));
        }
      }
      
      return results;
    });
  }

  private async _sellProductCore(
    dto: CreateSellProductDto | SellProductItemDto,
    prismaOverride?: PrismaService,
  ): Promise<SellResponseDto> {
    const prisma = prismaOverride || this.prisma;
    const {
      productId,
      quantity,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = dto;

    // 1. Validate product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${productId} not found`);
    if (!product.isActive)
      throw new BadRequestException('Product is not active');
    if (quantity > product.stock)
      throw new BadRequestException('Not enough stock');

    // 2. Always use product sellingPrice
    const unitPrice = product.sellingPrice;
    if (unitPrice <= 0)
      throw new BadRequestException('Product selling price must be positive');

    // 3. Calculate totals
    const totalRevenue = unitPrice * quantity;
    const totalCost = product.buyingPrice * quantity;
    const profitPerUnit = unitPrice - product.buyingPrice;

    // 4. Decrease stock
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    // 5. Tax calculation (only use product.taxId)
    let taxAmount = 0;
    const usedTaxId = product.taxId;
    if (usedTaxId) {
      const tax = await prisma.tax.findUnique({ where: { id: usedTaxId } });
      if (!tax)
        throw new NotFoundException(`Tax with ID ${usedTaxId} not found`);
      if (!tax.isActive)
        throw new BadRequestException(`Tax "${tax.name}" is not active`);
      taxAmount =
        tax.type === 'PERCENTAGE' ? (totalRevenue * tax.rate) / 100 : tax.rate;
      // Accumulate tax
      await prisma.taxAccumulation.upsert({
        where: {
          taxId_month_year: {
            taxId: usedTaxId,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        },
        update: {
          totalTax: { increment: taxAmount },
          totalSales: { increment: totalRevenue },
        },
        create: {
          taxId: usedTaxId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          totalTax: taxAmount,
          totalSales: totalRevenue,
        },
      });
    }

    // 6. Create SoldProduct
    const soldProduct = await prisma.soldProduct.create({
      data: {
        productId,
        quantity,
        sellingPrice: unitPrice,
        buyingPrice: product.buyingPrice,
        totalRevenue,
        totalProfit: profitPerUnit, // store per unit profit
        customerName,
        customerEmail,
        customerPhone,
        notes,
        taxId: usedTaxId,
        taxAmount,
      },
    });

    // 7. Create Revenue
    await prisma.revenue.create({
      data: {
        soldProductId: soldProduct.id,
        amount: totalRevenue,
        receivedAt: new Date(),
      },
    });

    // 8. Create Profit (per unit)
    await prisma.profit.create({
      data: {
        soldProductId: soldProduct.id,
        amount: profitPerUnit,
        calculatedAt: new Date(),
      },
    });

    // 9. Create Expense (cost)
    await prisma.expense.create({
      data: {
        soldProductId: soldProduct.id,
        amount: totalCost,
        note: 'Cost of goods sold',
        fundingSource: 'PROFIT',
        createdAt: new Date(),
      },
    });

    // 10. Prepare response
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    return {
      type: 'product',
      saleId: soldProduct.id,
      itemId: productId,
      quantity,
      sellingPrice: unitPrice,
      totalRevenue,
      totalProfit: profitPerUnit,
      taxAmount,
      taxId: usedTaxId,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      updatedStock: updatedProduct?.stock ?? 0,
    };
  }

  private async _sellServiceCore(
    dto: SellServiceItemDto,
    prismaOverride?: PrismaService,
  ): Promise<SellResponseDto> {
    const prisma = prismaOverride || this.prisma;
    const {
      serviceId,
      quantity,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = dto;

    // 1. Validate service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service)
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    if (!service.isActive)
      throw new BadRequestException('Service is not active');

    // 2. Use service price and cost
    const unitPrice = service.price;
    const unitCost = service.cost ?? 0;
    if (unitPrice <= 0)
      throw new BadRequestException('Service price must be positive');

    // 3. Calculate totals
    const totalRevenue = unitPrice * quantity;
    const totalCost = unitCost * quantity;
    const profitPerUnit = unitPrice - unitCost;

    // 4. Tax calculation (only use service.taxId)
    let taxAmount = 0;
    const usedTaxId = service.taxId;
    if (usedTaxId) {
      const tax = await prisma.tax.findUnique({ where: { id: usedTaxId } });
      if (!tax)
        throw new NotFoundException(`Tax with ID ${usedTaxId} not found`);
      if (!tax.isActive)
        throw new BadRequestException(`Tax "${tax.name}" is not active`);
      taxAmount =
        tax.type === 'PERCENTAGE' ? (totalRevenue * tax.rate) / 100 : tax.rate;
      // Accumulate tax
      await prisma.taxAccumulation.upsert({
        where: {
          taxId_month_year: {
            taxId: usedTaxId,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        },
        update: {
          totalTax: { increment: taxAmount },
          totalSales: { increment: totalRevenue },
        },
        create: {
          taxId: usedTaxId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          totalTax: taxAmount,
          totalSales: totalRevenue,
        },
      });
    }

    // 5. Create SoldService
    const soldService = await prisma.soldService.create({
      data: {
        serviceId,
        quantity,
        sellingPrice: unitPrice,
        cost: unitCost,
        totalRevenue,
        totalProfit: profitPerUnit, // store per unit profit
        customerName,
        customerEmail,
        customerPhone,
        notes,
        taxId: usedTaxId,
        taxAmount,
      },
    });

    // 6. Create Revenue
    await prisma.revenue.create({
      data: {
        soldServiceId: soldService.id,
        amount: totalRevenue,
        receivedAt: new Date(),
      },
    });

    // 7. Create Profit (per unit)
    await prisma.profit.create({
      data: {
        soldServiceId: soldService.id,
        amount: profitPerUnit,
        calculatedAt: new Date(),
      },
    });

    // 8. Create Expense (cost)
    await prisma.expense.create({
      data: {
        soldServiceId: soldService.id,
        amount: totalCost,
        note: 'Cost of service sold',
        fundingSource: 'PROFIT',
        createdAt: new Date(),
      },
    });

    // 9. Prepare response
    return {
      type: 'service',
      saleId: soldService.id,
      itemId: serviceId,
      quantity,
      sellingPrice: unitPrice,
      totalRevenue,
      totalProfit: profitPerUnit,
      taxAmount,
      taxId: usedTaxId,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    };
  }
}
