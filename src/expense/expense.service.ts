import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async create(
    createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const {
      projectId,
      soldProductId,
      budgetId,
      amount,
      note,
      fundingSource = 'BUDGET',
    } = createExpenseDto;

    // Validate related entities exist
    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
    }

    if (soldProductId) {
      const soldProduct = await this.prisma.soldProduct.findUnique({
        where: { id: soldProductId },
      });
      if (!soldProduct) {
        throw new NotFoundException(
          `Sold product with ID ${soldProductId} not found`,
        );
      }
    }

    if (budgetId) {
      const budget = await this.prisma.budget.findUnique({
        where: { id: budgetId },
      });
      if (!budget) {
        throw new NotFoundException(`Budget with ID ${budgetId} not found`);
      }
    }

    // Validate funding source logic
    if (fundingSource === 'BUDGET' && !budgetId) {
      throw new BadRequestException(
        'Budget ID is required when funding source is BUDGET',
      );
    }

    if (fundingSource === 'PROFIT' && !soldProductId) {
      throw new BadRequestException(
        'Sold Product ID is required when funding source is PROFIT',
      );
    }

    // Check if budget has sufficient funds (if using budget)
    if (budgetId && fundingSource === 'BUDGET') {
      const budget = await this.prisma.budget.findUnique({
        where: { id: budgetId },
        include: {
          expenses: {
            where: {
              fundingSource: 'BUDGET',
            },
          },
        },
      });

      if (!budget) {
        throw new NotFoundException(`Budget with ID ${budgetId} not found`);
      }

      const totalExpenses = budget.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );
      const availableFunds = budget.amount - totalExpenses;

      if (availableFunds < amount) {
        throw new BadRequestException(
          `Insufficient budget funds. Available: $${availableFunds.toFixed(2)}, Required: $${amount.toFixed(2)}`,
        );
      }
    }

    // Check if sold product has sufficient profit (if using profit)
    if (soldProductId && fundingSource === 'PROFIT') {
      const soldProduct = await this.prisma.soldProduct.findUnique({
        where: { id: soldProductId },
        include: {
          expense: {
            where: {
              fundingSource: 'PROFIT',
            },
          },
        },
      });

      if (!soldProduct) {
        throw new NotFoundException(
          `Sold product with ID ${soldProductId} not found`,
        );
      }

      const totalExpenses = soldProduct.expense.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );
      const availableProfit = soldProduct.totalProfit - totalExpenses;

      if (availableProfit < amount) {
        throw new BadRequestException(
          `Insufficient profit. Available: $${availableProfit.toFixed(2)}, Required: $${amount.toFixed(2)}`,
        );
      }
    }

    // Create the expense
    const expense = await this.prisma.expense.create({
      data: {
        projectId,
        soldProductId,
        budgetId,
        amount,
        note,
        fundingSource,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        soldProduct: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            totalRevenue: true,
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

    return {
      id: expense.id,
      projectId: expense.projectId || undefined,
      soldProductId: expense.soldProductId || undefined,
      budgetId: expense.budgetId || undefined,
      amount: expense.amount,
      note: expense.note,
      fundingSource: expense.fundingSource as 'BUDGET' | 'PROFIT',
      createdAt: expense.createdAt,
      project: expense.project || undefined,
      soldProduct: expense.soldProduct || undefined,
      budget: expense.budget || undefined,
    };
  }

  async findAll(): Promise<ExpenseResponseDto[]> {
    const expenses = await this.prisma.expense.findMany({
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        soldProduct: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            totalRevenue: true,
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
      orderBy: { createdAt: 'desc' },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      projectId: expense.projectId || undefined,
      soldProductId: expense.soldProductId || undefined,
      budgetId: expense.budgetId || undefined,
      amount: expense.amount,
      note: expense.note,
      fundingSource: expense.fundingSource as 'BUDGET' | 'PROFIT',
      createdAt: expense.createdAt,
      project: expense.project || undefined,
      soldProduct: expense.soldProduct || undefined,
      budget: expense.budget || undefined,
    }));
  }

  async findOne(id: number): Promise<ExpenseResponseDto> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        soldProduct: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            totalRevenue: true,
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

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return {
      id: expense.id,
      projectId: expense.projectId || undefined,
      soldProductId: expense.soldProductId || undefined,
      budgetId: expense.budgetId || undefined,
      amount: expense.amount,
      note: expense.note,
      fundingSource: expense.fundingSource as 'BUDGET' | 'PROFIT',
      createdAt: expense.createdAt,
      project: expense.project || undefined,
      soldProduct: expense.soldProduct || undefined,
      budget: expense.budget || undefined,
    };
  }

  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    // Validate related entities if being updated
    if (updateExpenseDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: updateExpenseDto.projectId },
      });
      if (!project) {
        throw new NotFoundException(
          `Project with ID ${updateExpenseDto.projectId} not found`,
        );
      }
    }

    if (updateExpenseDto.soldProductId) {
      const soldProduct = await this.prisma.soldProduct.findUnique({
        where: { id: updateExpenseDto.soldProductId },
      });
      if (!soldProduct) {
        throw new NotFoundException(
          `Sold product with ID ${updateExpenseDto.soldProductId} not found`,
        );
      }
    }

    if (updateExpenseDto.budgetId) {
      const budget = await this.prisma.budget.findUnique({
        where: { id: updateExpenseDto.budgetId },
      });
      if (!budget) {
        throw new NotFoundException(
          `Budget with ID ${updateExpenseDto.budgetId} not found`,
        );
      }
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: updateExpenseDto,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        soldProduct: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            totalRevenue: true,
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

    return {
      id: updatedExpense.id,
      projectId: updatedExpense.projectId || undefined,
      soldProductId: updatedExpense.soldProductId || undefined,
      budgetId: updatedExpense.budgetId || undefined,
      amount: updatedExpense.amount,
      note: updatedExpense.note,
      fundingSource: updatedExpense.fundingSource as 'BUDGET' | 'PROFIT',
      createdAt: updatedExpense.createdAt,
      project: updatedExpense.project || undefined,
      soldProduct: updatedExpense.soldProduct || undefined,
      budget: updatedExpense.budget || undefined,
    };
  }

  async remove(id: number): Promise<void> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    await this.prisma.expense.delete({
      where: { id },
    });
  }

  async getExpensesByProject(projectId: number): Promise<ExpenseResponseDto[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const expenses = await this.prisma.expense.findMany({
      where: { projectId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        soldProduct: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            totalRevenue: true,
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
      orderBy: { createdAt: 'desc' },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      projectId: expense.projectId || undefined,
      soldProductId: expense.soldProductId || undefined,
      budgetId: expense.budgetId || undefined,
      amount: expense.amount,
      note: expense.note,
      fundingSource: expense.fundingSource as 'BUDGET' | 'PROFIT',
      createdAt: expense.createdAt,
      project: expense.project || undefined,
      soldProduct: expense.soldProduct || undefined,
      budget: expense.budget || undefined,
    }));
  }

  async getExpensesByBudget(budgetId: number): Promise<ExpenseResponseDto[]> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    const expenses = await this.prisma.expense.findMany({
      where: { budgetId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        soldProduct: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            totalRevenue: true,
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
      orderBy: { createdAt: 'desc' },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      projectId: expense.projectId || undefined,
      soldProductId: expense.soldProductId || undefined,
      budgetId: expense.budgetId || undefined,
      amount: expense.amount,
      note: expense.note,
      fundingSource: expense.fundingSource as 'BUDGET' | 'PROFIT',
      createdAt: expense.createdAt,
      project: expense.project || undefined,
      soldProduct: expense.soldProduct || undefined,
      budget: expense.budget || undefined,
    }));
  }

  async getExpensesBySoldProduct(
    soldProductId: number,
  ): Promise<ExpenseResponseDto[]> {
    const soldProduct = await this.prisma.soldProduct.findUnique({
      where: { id: soldProductId },
    });

    if (!soldProduct) {
      throw new NotFoundException(
        `Sold product with ID ${soldProductId} not found`,
      );
    }

    const expenses = await this.prisma.expense.findMany({
      where: { soldProductId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        soldProduct: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            totalRevenue: true,
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
      orderBy: { createdAt: 'desc' },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      projectId: expense.projectId || undefined,
      soldProductId: expense.soldProductId || undefined,
      budgetId: expense.budgetId || undefined,
      amount: expense.amount,
      note: expense.note,
      fundingSource: expense.fundingSource as 'BUDGET' | 'PROFIT',
      createdAt: expense.createdAt,
      project: expense.project || undefined,
      soldProduct: expense.soldProduct || undefined,
      budget: expense.budget || undefined,
    }));
  }

  async getExpenseSummary() {
    const summary = await this.prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const budgetExpenses = await this.prisma.expense.aggregate({
      where: { fundingSource: 'BUDGET' },
      _sum: {
        amount: true,
      },
    });

    const profitExpenses = await this.prisma.expense.aggregate({
      where: { fundingSource: 'PROFIT' },
      _sum: {
        amount: true,
      },
    });

    return {
      totalExpenses: summary._count.id,
      totalAmount: summary._sum.amount || 0,
      budgetExpenses: budgetExpenses._sum.amount || 0,
      profitExpenses: profitExpenses._sum.amount || 0,
    };
  }
}
