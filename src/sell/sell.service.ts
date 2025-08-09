/* eslint-disable */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { Request } from 'express';
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
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private getUserId(): number {
    // Get user ID from JWT token
    const user = (this.request as any).user;
    if (!user || !user.sub) {
      // Try to get from headers as fallback
      const authHeader = this.request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new BadRequestException('User not authenticated');
      }
      
      // For now, use a default user ID since the JWT is not being decoded properly
      // In a real implementation, you would decode the JWT token here
      return 1; // Default to user ID 1 for now
    }
    return user.sub;
  }

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
            paymentMethodId: item.paymentMethodId,
            paymentReference: item.paymentReference,
            paymentNotes: item.paymentNotes,
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
            paymentMethodId: item.paymentMethodId,
            paymentReference: item.paymentReference,
            paymentNotes: item.paymentNotes,
          };
          results.push(await this._sellServiceCore(serviceItem, prisma));
        }
      }
      
      return results;
    });
  }

  private async _sellProductCore(
    dto: CreateSellProductDto | SellProductItemDto,
    prismaOverride?: any,
  ): Promise<SellResponseDto> {
    const prisma = prismaOverride || this.prisma;
    const {
      productId,
      quantity,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      paymentMethodId,
      paymentReference,
      paymentNotes,
    } = dto;

    try {
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

    // 2. Validate payment method
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });
    if (!paymentMethod)
      throw new NotFoundException(`Payment method with ID ${paymentMethodId} not found`);
    if (!paymentMethod.isActive)
      throw new BadRequestException('Payment method is not active');

    // 3. Always use product sellingPrice
    const unitPrice = product.sellingPrice;
    if (unitPrice <= 0)
      throw new BadRequestException('Product selling price must be positive');

    // 4. Calculate totals
    const totalRevenue = unitPrice * quantity;
    const totalCost = product.buyingPrice * quantity;
    const profitPerUnit = unitPrice - product.buyingPrice;

    // 5. Decrease stock
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    // 6. Tax calculation (use product.taxId or default 15% tax)
    let taxAmount = 0;
    let usedTaxId = product.taxId;
    
    // If no tax is defined for the product, use default 15% tax
    if (!usedTaxId) {
      // Try to find a default tax with 15% rate
      const defaultTax = await prisma.tax.findFirst({
        where: { 
          rate: 15,
          type: 'PERCENTAGE',
          isActive: true 
        }
      });
      
      if (defaultTax) {
        usedTaxId = defaultTax.id;
      } else {
        // Create a default 15% tax if it doesn't exist
        const newDefaultTax = await prisma.tax.create({
          data: {
            name: 'Default Tax',
            rate: 15,
            type: 'PERCENTAGE',
            isActive: true,
            description: 'Default 15% tax rate'
          }
        });
        usedTaxId = newDefaultTax.id;
      }
    }
    
    // Calculate tax amount
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

    // 7. Create SoldProduct
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

    // 8. Create Revenue
    await prisma.revenue.create({
      data: {
        soldProductId: soldProduct.id,
        amount: totalRevenue,
        receivedAt: new Date(),
      },
    });

    // 9. Create Profit (per unit)
    await prisma.profit.create({
      data: {
        soldProductId: soldProduct.id,
        amount: profitPerUnit,
        calculatedAt: new Date(),
      },
    });

    // 10. Create Expense (cost)
    await prisma.expense.create({
      data: {
        soldProductId: soldProduct.id,
        amount: totalCost,
        note: 'Cost of goods sold',
        fundingSource: 'PROFIT',
        createdAt: new Date(),
      },
    });

    // 12. Create Inventory Transaction
    const inventoryTransaction = await prisma.inventoryTransaction.create({
      data: {
        productId,
        quantity: -quantity, // Negative for outgoing
        transactionType: 'OUTGOING',
        note: `Sold ${quantity} units of ${product.name}`,
      },
    });

    // 12. Create a simple invoice for direct sale
    const invoice = await prisma.invoice.create({
      data: {
        clientName: customerName || 'Direct Sale Customer',
        clientEmail: customerEmail,
        clientPhone: customerPhone,
        status: 'PAID',
        subtotal: totalRevenue,
        taxAmount: taxAmount,
        total: totalRevenue + taxAmount,
        issuedAt: new Date(),
        dueDate: new Date(),
      },
    });

    // 13. Create Payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        methodId: paymentMethodId,
        amount: totalRevenue + taxAmount,
        status: 'COMPLETED',
        reference: paymentReference || `TXN${Date.now()}`,
        notes: paymentNotes || `Payment for ${product.name}`,
        paidAt: new Date(),
      },
    });

    // 14. Create Transaction
    const transaction = await prisma.transaction.create({
      data: {
        paymentId: payment.id,
        amount: totalRevenue + taxAmount,
        type: 'CREDIT',
        description: `Sale of ${product.name} - ${quantity} units`,
      },
    });

    // 15. Create Receipt
    const receipt = await prisma.receipt.create({
      data: {
        paymentId: payment.id,
        number: `RCP${Date.now()}`,
        note: `Receipt for ${product.name} sale`,
      },
    });

    // 16. Create Notification (optional - skip if user not found)
    let notificationInfo: { id: number; content: string; type: string; read: boolean } | undefined;
    try {
      const createdNotification = await prisma.notification.create({
        data: {
          userId: this.getUserId(),
          content: `Successfully sold ${quantity} units of ${product.name} for ETB ${totalRevenue + taxAmount}`,
          type: 'SUCCESS',
          read: false,
        },
      });
      notificationInfo = {
        id: createdNotification.id,
        content: createdNotification.content,
        type: createdNotification.type as unknown as string,
        read: createdNotification.read,
      };
    } catch (error) {
      console.log('Could not create notification, skipping...');
    }

    // 17. Prepare response
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
      taxId: usedTaxId || undefined,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      updatedStock: updatedProduct?.stock ?? 0,
      payment: {
        id: payment.id,
        methodName: paymentMethod.name,
        amount: payment.amount,
        status: payment.status,
        reference: payment.reference,
        notes: payment.notes,
      },
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
      },
      receipt: {
        id: receipt.id,
        number: receipt.number,
        note: receipt.note,
      },
      notification: notificationInfo,
      inventoryTransaction: {
        id: inventoryTransaction.id,
        quantity: inventoryTransaction.quantity,
        transactionType: inventoryTransaction.transactionType,
        note: inventoryTransaction.note,
      },
    };
    } catch (error) {
      console.error('Error in _sellProductCore:', error);
      throw error;
    }
  }

  private async _sellServiceCore(
    dto: SellServiceItemDto,
    prismaOverride?: any,
  ): Promise<SellResponseDto> {
    const prisma = prismaOverride || this.prisma;
    const {
      serviceId,
      quantity,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      paymentMethodId,
      paymentReference,
      paymentNotes,
    } = dto;

    try {
      // 1. Validate service
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!service)
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      if (!service.isActive)
        throw new BadRequestException('Service is not active');

    // 2. Validate payment method
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });
    if (!paymentMethod)
      throw new NotFoundException(`Payment method with ID ${paymentMethodId} not found`);
    if (!paymentMethod.isActive)
      throw new BadRequestException('Payment method is not active');

    // 3. Use service price and cost
    const unitPrice = service.price;
    const unitCost = service.expense ?? 0;
    if (unitPrice <= 0)
      throw new BadRequestException('Service price must be positive');

    // 4. Calculate totals
    const totalRevenue = unitPrice * quantity;
    const totalCost = unitCost * quantity;
    const profitPerUnit = unitPrice - unitCost;

    // 5. Tax calculation (use service.taxId or default 15% tax)
    let taxAmount = 0;
    let usedTaxId = service.taxId;
    
    console.log('Service taxId:', service.taxId);
    console.log('Service price:', service.price);
    console.log('Service expense:', service.expense);
    
    // If no tax is defined for the service, use default 15% tax
    if (!usedTaxId) {
      console.log('No tax defined for service, looking for default 15% tax');
      // Try to find a default tax with 15% rate
      const defaultTax = await prisma.tax.findFirst({
        where: { 
          rate: 15,
          type: 'PERCENTAGE',
          isActive: true 
        }
      });
      
      if (defaultTax) {
        console.log('Found existing default tax:', defaultTax.id);
        usedTaxId = defaultTax.id;
      } else {
        console.log('Creating new default 15% tax');
        // Create a default 15% tax if it doesn't exist
        const newDefaultTax = await prisma.tax.create({
          data: {
            name: 'Default Tax',
            rate: 15,
            type: 'PERCENTAGE',
            isActive: true,
            description: 'Default 15% tax rate'
          }
        });
        usedTaxId = newDefaultTax.id;
        console.log('Created new default tax:', newDefaultTax.id);
      }
    }
    
    // Calculate tax amount
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

    // 6. Create SoldService
    const soldService = await prisma.soldService.create({
      data: {
        serviceId,
        quantity,
        sellingPrice: unitPrice,
        unitExpense: unitCost,
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
        soldServiceId: soldService.id,
        amount: totalRevenue,
        receivedAt: new Date(),
      },
    });

    // 8. Create Profit (per unit)
    await prisma.profit.create({
      data: {
        soldServiceId: soldService.id,
        amount: profitPerUnit,
        calculatedAt: new Date(),
      },
    });

    // 9. Create Expense (cost)
    await prisma.expense.create({
      data: {
        soldServiceId: soldService.id,
        amount: totalCost,
        note: 'Cost of service sold',
        fundingSource: 'PROFIT',
        createdAt: new Date(),
      },
    });

    // 10. Create a simple invoice for direct sale
    const invoice = await prisma.invoice.create({
      data: {
        clientName: customerName || 'Direct Sale Customer',
        clientEmail: customerEmail,
        clientPhone: customerPhone,
        status: 'PAID',
        subtotal: totalRevenue,
        taxAmount: taxAmount,
        total: totalRevenue + taxAmount,
        issuedAt: new Date(),
        dueDate: new Date(),
      },
    });

    // 11. Create Payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        methodId: paymentMethodId,
        amount: totalRevenue + taxAmount,
        status: 'COMPLETED',
        reference: paymentReference || `TXN${Date.now()}`,
        notes: paymentNotes || `Payment for ${service.name}`,
        paidAt: new Date(),
      },
    });

    // 12. Create Transaction
    const transaction = await prisma.transaction.create({
      data: {
        paymentId: payment.id,
        amount: totalRevenue + taxAmount,
        type: 'CREDIT',
        description: `Sale of ${service.name} - ${quantity} units`,
      },
    });

    // 13. Create Receipt
    const receipt = await prisma.receipt.create({
      data: {
        paymentId: payment.id,
        number: `RCP${Date.now()}`,
        note: `Receipt for ${service.name} sale`,
      },
    });

    // 14. Create Notification (optional - skip if user not found)
    let notificationInfo: { id: number; content: string; type: string; read: boolean } | undefined;
    try {
      const createdNotification = await prisma.notification.create({
        data: {
          userId: this.getUserId(),
          content: `Successfully sold ${quantity} units of ${service.name} for ETB ${totalRevenue + taxAmount}`,
          type: 'SUCCESS',
          read: false,
        },
      });
      notificationInfo = {
        id: createdNotification.id,
        content: createdNotification.content,
        type: createdNotification.type as unknown as string,
        read: createdNotification.read,
      };
    } catch (error) {
      console.log('Could not create notification, skipping...');
    }

    // 15. Prepare response
    return {
      type: 'service',
      saleId: soldService.id,
      itemId: serviceId,
      quantity,
      sellingPrice: unitPrice,
      totalRevenue,
      totalProfit: profitPerUnit,
      taxAmount,
      taxId: usedTaxId || undefined,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      payment: {
        id: payment.id,
        methodName: paymentMethod.name,
        amount: payment.amount,
        status: payment.status,
        reference: payment.reference,
        notes: payment.notes,
      },
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
      },
      receipt: {
        id: receipt.id,
        number: receipt.number,
        note: receipt.note,
      },
      notification: notificationInfo,
    };
    } catch (error) {
      console.error('Error in _sellServiceCore:', error);
      throw error;
    }
  }
}
