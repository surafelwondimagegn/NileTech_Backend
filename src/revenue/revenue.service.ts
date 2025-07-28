import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';

@Injectable()
export class RevenueService {
  constructor(private prisma: PrismaService) {}

  async create(createRevenueDto: CreateRevenueDto) {
    return this.prisma.revenue.create({
      data: createRevenueDto,
      include: {
        project: true,
        invoice: true,
        soldProduct: true,
        soldService: true,
      },
    });
  }

  async findAll() {
    return this.prisma.revenue.findMany({
      include: {
        project: true,
        invoice: true,
        soldProduct: true,
        soldService: true,
      },
      orderBy: {
        receivedAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.revenue.findUnique({
      where: { id },
      include: {
        project: true,
        invoice: true,
        soldProduct: true,
        soldService: true,
      },
    });
  }

  async update(id: number, updateRevenueDto: UpdateRevenueDto) {
    return this.prisma.revenue.update({
      where: { id },
      data: updateRevenueDto,
      include: {
        project: true,
        invoice: true,
        soldProduct: true,
        soldService: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.revenue.delete({
      where: { id },
    });
  }

  async getRevenueStats() {
    const [totalRevenue, averageRevenue, revenueByMonth, topRevenueSources] = await Promise.all([
      this.prisma.revenue.aggregate({
        _sum: {
          amount: true,
        },
      }),
      this.prisma.revenue.aggregate({
        _avg: {
          amount: true,
        },
      }),
      this.prisma.revenue.groupBy({
        by: ['receivedAt'],
        _sum: {
          amount: true,
        },
        orderBy: {
          receivedAt: 'desc',
        },
        take: 12,
      }),
      this.prisma.revenue.groupBy({
        by: ['soldProductId', 'soldServiceId', 'projectId', 'invoiceId'],
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      averageRevenue: averageRevenue._avg.amount || 0,
      revenueByMonth: revenueByMonth.map(item => ({
        month: item.receivedAt,
        amount: item._sum.amount || 0,
      })),
      topRevenueSources: topRevenueSources.map(item => ({
        sourceId: item.soldProductId || item.soldServiceId || item.projectId || item.invoiceId,
        amount: item._sum.amount || 0,
      })),
    };
  }
}
