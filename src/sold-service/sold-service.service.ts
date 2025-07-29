import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSoldServiceDto } from './dto/create-sold-service.dto';
import { UpdateSoldServiceDto } from './dto/update-sold-service.dto';

@Injectable()
export class SoldServiceService {
  constructor(private prisma: PrismaService) {}

  async create(createSoldServiceDto: CreateSoldServiceDto) {
    const { serviceId, quantity, sellingPrice, cost, customerName, customerEmail, customerPhone, notes, taxId } = createSoldServiceDto;

    // Validate service exists
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    // Use default values if not provided
    const finalSellingPrice = sellingPrice || service.price;
    const finalCost = cost || service.cost || 0;

    // Calculate totals
    const totalRevenue = quantity * finalSellingPrice;
    const totalProfit = quantity * (finalSellingPrice - finalCost);

    // Calculate tax if taxId is provided
    let taxAmount = 0;
    if (taxId) {
      const tax = await this.prisma.tax.findUnique({
        where: { id: taxId },
      });
      if (tax) {
        if (tax.type === 'PERCENTAGE') {
          taxAmount = (totalRevenue * tax.rate) / 100;
        } else {
          taxAmount = tax.rate;
        }
      }
    }

    return this.prisma.soldService.create({
      data: {
        serviceId,
        quantity,
        sellingPrice: finalSellingPrice,
        cost: finalCost,
        totalRevenue,
        totalProfit,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        taxId,
        taxAmount,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            cost: true,
          },
        },
        tax: {
          select: {
            id: true,
            name: true,
            rate: true,
            type: true,
          },
        },
      },
    });
  }

  async findAll(query?: any) {
    const { serviceId, customerName, customerEmail, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (serviceId) where.serviceId = parseInt(serviceId);
    if (customerName) where.customerName = { contains: customerName, mode: 'insensitive' };
    if (customerEmail) where.customerEmail = { contains: customerEmail, mode: 'insensitive' };
    if (startDate || endDate) {
      where.soldAt = {};
      if (startDate) where.soldAt.gte = new Date(startDate);
      if (endDate) where.soldAt.lte = new Date(endDate);
    }

    const [soldServices, total] = await Promise.all([
      this.prisma.soldService.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { soldAt: 'desc' },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          tax: {
            select: {
              id: true,
              name: true,
              rate: true,
            },
          },
        },
      }),
      this.prisma.soldService.count({ where }),
    ]);

    return {
      data: soldServices,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: number) {
    const soldService = await this.prisma.soldService.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            cost: true,
          },
        },
        tax: {
          select: {
            id: true,
            name: true,
            rate: true,
            type: true,
          },
        },
      },
    });

    if (!soldService) {
      throw new NotFoundException(`Sold service with ID ${id} not found`);
    }

    return soldService;
  }

  async update(id: number, updateSoldServiceDto: UpdateSoldServiceDto) {
    const soldService = await this.prisma.soldService.findUnique({
      where: { id },
    });

    if (!soldService) {
      throw new NotFoundException(`Sold service with ID ${id} not found`);
    }

    const { quantity, sellingPrice, cost, customerName, customerEmail, customerPhone, notes, taxId } = updateSoldServiceDto;

    // Recalculate totals if price or quantity changes
    let totalRevenue = soldService.totalRevenue;
    let totalProfit = soldService.totalProfit;
    let taxAmount = soldService.taxAmount;

    if (quantity !== undefined || sellingPrice !== undefined || cost !== undefined) {
      const finalQuantity = quantity || soldService.quantity;
      const finalSellingPrice = sellingPrice || soldService.sellingPrice;
      const finalCost = cost !== undefined ? cost : soldService.cost;

      totalRevenue = finalQuantity * finalSellingPrice;
      totalProfit = finalQuantity * (finalSellingPrice - finalCost);

      // Recalculate tax if taxId is provided
      if (taxId) {
        const tax = await this.prisma.tax.findUnique({
          where: { id: taxId },
        });
        if (tax) {
          if (tax.type === 'PERCENTAGE') {
            taxAmount = (totalRevenue * tax.rate) / 100;
          } else {
            taxAmount = tax.rate;
          }
        }
      }
    }

    return this.prisma.soldService.update({
      where: { id },
      data: {
        quantity,
        sellingPrice,
        cost,
        totalRevenue,
        totalProfit,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        taxId,
        taxAmount,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        tax: {
          select: {
            id: true,
            name: true,
            rate: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const soldService = await this.prisma.soldService.findUnique({
      where: { id },
    });

    if (!soldService) {
      throw new NotFoundException(`Sold service with ID ${id} not found`);
    }

    return this.prisma.soldService.delete({
      where: { id },
    });
  }

  async getSalesSummary(query?: any) {
    const { startDate, endDate, serviceId } = query;

    const where: any = {};
    if (startDate || endDate) {
      where.soldAt = {};
      if (startDate) where.soldAt.gte = new Date(startDate);
      if (endDate) where.soldAt.lte = new Date(endDate);
    }
    if (serviceId) where.serviceId = parseInt(serviceId);

    const soldServices = await this.prisma.soldService.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalRevenue = soldServices.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalProfit = soldServices.reduce((sum, item) => sum + item.totalProfit, 0);
    const totalTax = soldServices.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalQuantity = soldServices.reduce((sum, item) => sum + item.quantity, 0);

    // Group by service
    const salesByService = soldServices.reduce((acc, item) => {
      const serviceId = item.service.id;
      if (!acc[serviceId]) {
        acc[serviceId] = {
          serviceId,
          serviceName: item.service.name,
          quantity: 0,
          revenue: 0,
          profit: 0,
          tax: 0,
        };
      }
      acc[serviceId].quantity += item.quantity;
      acc[serviceId].revenue += item.totalRevenue;
      acc[serviceId].profit += item.totalProfit;
      acc[serviceId].tax += item.taxAmount;
      return acc;
    }, {});

    return {
      summary: {
        totalRevenue,
        totalProfit,
        totalTax,
        totalQuantity,
        totalSales: soldServices.length,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      },
      salesByService: Object.values(salesByService),
      period: {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    };
  }
}