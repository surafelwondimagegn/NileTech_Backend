import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetHistoryDto } from './dto/create-budget-history.dto';
import { UpdateBudgetHistoryDto } from './dto/update-budget-history.dto';

@Injectable()
export class BudgetHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(createBudgetHistoryDto: CreateBudgetHistoryDto) {
    return this.prisma.budgetHistory.create({
      data: createBudgetHistoryDto,
      include: {
        budget: {
          include: {
            products: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.budgetHistory.findMany({
      include: {
        budget: {
          include: {
            products: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByBudgetId(budgetId: number) {
    return this.prisma.budgetHistory.findMany({
      where: { budgetId },
      include: {
        budget: {
          include: {
            products: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const budgetHistory = await this.prisma.budgetHistory.findUnique({
      where: { id },
      include: {
        budget: {
          include: {
            products: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!budgetHistory) {
      throw new NotFoundException(`Budget history with ID ${id} not found`);
    }

    return budgetHistory;
  }

  async update(id: number, updateBudgetHistoryDto: UpdateBudgetHistoryDto) {
    // Check if budget history exists
    await this.findOne(id);

    return this.prisma.budgetHistory.update({
      where: { id },
      data: updateBudgetHistoryDto,
      include: {
        budget: {
          include: {
            products: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    // Check if budget history exists
    await this.findOne(id);

    return this.prisma.budgetHistory.delete({
      where: { id },
    });
  }

  // Helper method to create budget history entry
  async createHistoryEntry(data: {
    budgetId: number;
    action: string;
    oldValue?: string;
    newValue?: string;
    changedBy: number;
  }) {
    return this.create({
      budgetId: data.budgetId,
      action: data.action,
      oldValue: data.oldValue,
      newValue: data.newValue,
      changedBy: data.changedBy,
    });
  }
}
