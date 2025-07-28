import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: createTransactionDto,
      include: {
        user: true,
        payment: true,
      },
    });
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      include: {
        user: true,
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        user: true,
        payment: true,
      },
    });
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
      include: {
        user: true,
        payment: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async getTransactionStats() {
    const [totalTransactions, totalAmount, transactionsByType, transactionsByUser] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
      }),
      this.prisma.transaction.groupBy({
        by: ['type'],
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      this.prisma.transaction.groupBy({
        by: ['userId'],
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    return {
      totalTransactions,
      totalAmount: totalAmount._sum.amount || 0,
      transactionsByType: transactionsByType.map(item => ({
        type: item.type,
        count: item._count,
        amount: item._sum.amount || 0,
      })),
      transactionsByUser: transactionsByUser.map(item => ({
        userId: item.userId,
        count: item._count,
        amount: item._sum.amount || 0,
      })),
    };
  }
}
