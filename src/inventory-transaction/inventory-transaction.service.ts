import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { UpdateInventoryTransactionDto } from './dto/update-inventory-transaction.dto';

@Injectable()
export class InventoryTransactionService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryTransactionDto: CreateInventoryTransactionDto) {
    return this.prisma.inventoryTransaction.create({
      data: createInventoryTransactionDto,
      include: {
        product: true,
      },
    });
  }

  async findAll() {
    return this.prisma.inventoryTransaction.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.inventoryTransaction.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
  }

  async update(
    id: number,
    updateInventoryTransactionDto: UpdateInventoryTransactionDto,
  ) {
    return this.prisma.inventoryTransaction.update({
      where: { id },
      data: updateInventoryTransactionDto,
      include: {
        product: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.inventoryTransaction.delete({
      where: { id },
    });
  }

  async getInventoryTransactionStats() {
    const [totalTransactions, totalIncoming, totalOutgoing, transactionsByProduct] = await Promise.all([
      this.prisma.inventoryTransaction.count(),
      this.prisma.inventoryTransaction.count({
        where: {
          transactionType: 'INCOMING',
        },
      }),
      this.prisma.inventoryTransaction.count({
        where: {
          transactionType: 'OUTGOING',
        },
      }),
      this.prisma.inventoryTransaction.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
        },
        _count: true,
      }),
    ]);

    return {
      totalTransactions,
      totalIncoming,
      totalOutgoing,
      transactionsByProduct: transactionsByProduct.map(item => ({
        productId: item.productId,
        totalQuantity: item._sum.quantity || 0,
        transactionCount: item._count,
      })),
    };
  }
}
