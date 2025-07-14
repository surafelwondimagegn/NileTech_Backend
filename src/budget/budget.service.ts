import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetHistoryService } from '../budget-history/budget-history.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetService {
  constructor(
    private prisma: PrismaService,
    private budgetHistoryService: BudgetHistoryService,
  ) {}

  async create(createBudgetDto: CreateBudgetDto, userId: number) {
    try {
      const budget = await this.prisma.budget.create({
        data: createBudgetDto,
        include: {
          products: true,
        },
      });

      // Create history entry - handle potential user not found error
      try {
        await this.budgetHistoryService.createHistoryEntry({
          budgetId: budget.id,
          action: 'CREATED',
          newValue: JSON.stringify(createBudgetDto),
          changedBy: userId,
        });
      } catch (error) {
        console.warn(`Failed to create budget history entry: ${error.message}`);
        // Continue without history entry if user doesn't exist
      }

      return budget;
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('name')) {
          throw new ConflictException(`Budget with name "${createBudgetDto.name}" already exists`);
        }
        throw new ConflictException('Budget with this information already exists');
      }
      
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw new BadRequestException('Invalid reference data provided');
      }
      
      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException('Required related data not found');
      }
      
      // Log unexpected errors for debugging
      console.error('Unexpected error in budget creation:', error);
      throw new BadRequestException('Failed to create budget. Please try again.');
    }
  }

  async findAll() {
    return this.prisma.budget.findMany({
      include: {
        products: true,
        history: {
          include: {
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
          take: 5, // Get last 5 history entries
        },
      },
    });
  }

  async findOne(id: number) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: {
        products: true,
        history: {
          include: {
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
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return budget;
  }

  async update(id: number, updateBudgetDto: UpdateBudgetDto, userId: number) {
    try {
      // Get current budget to compare changes
      const currentBudget = await this.findOne(id);
      
      const budget = await this.prisma.budget.update({
        where: { id },
        data: updateBudgetDto,
        include: {
          products: true,
        },
      });

      // Determine what changed and create appropriate history entry
      const changes = this.detectChanges(currentBudget, updateBudgetDto);
      
      if (changes.length > 0) {
        try {
          await this.budgetHistoryService.createHistoryEntry({
            budgetId: budget.id,
            action: 'UPDATED',
            oldValue: JSON.stringify(currentBudget),
            newValue: JSON.stringify(updateBudgetDto),
            changedBy: userId,
          });
        } catch (error) {
          console.warn(`Failed to create budget history entry: ${error.message}`);
          // Continue without history entry if user doesn't exist
        }
      }

      return budget;
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        if (error.meta?.target?.includes('name')) {
          throw new ConflictException(`Budget with name "${updateBudgetDto.name}" already exists`);
        }
        throw new ConflictException('Budget with this information already exists');
      }
      
      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Budget with ID ${id} not found`);
      }
      
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw new BadRequestException('Invalid reference data provided');
      }
      
      // Log unexpected errors for debugging
      console.error('Unexpected error in budget update:', error);
      throw new BadRequestException('Failed to update budget. Please try again.');
    }
  }

  async remove(id: number, userId: number) {
    try {
      // Get current budget before deletion
      const currentBudget = await this.findOne(id);
      
      const budget = await this.prisma.budget.delete({
        where: { id },
      });

      // Create history entry for deletion
      try {
        await this.budgetHistoryService.createHistoryEntry({
          budgetId: id,
          action: 'DELETED',
          oldValue: JSON.stringify(currentBudget),
          changedBy: userId,
        });
      } catch (error) {
        console.warn(`Failed to create budget history entry: ${error.message}`);
        // Continue without history entry if user doesn't exist
      }

      return budget;
    } catch (error) {
      if (error.code === 'P2025') {
        // Record not found
        throw new NotFoundException(`Budget with ID ${id} not found`);
      }
      
      if (error.code === 'P2003') {
        // Foreign key constraint violation - budget is referenced by other entities
        throw new ConflictException('Cannot delete budget as it is referenced by other entities');
      }
      
      // Log unexpected errors for debugging
      console.error('Unexpected error in budget deletion:', error);
      throw new BadRequestException('Failed to delete budget. Please try again.');
    }
  }

  async checkNameExists(name: string, excludeId?: number): Promise<boolean> {
    const whereClause: any = { name };
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }
    
    const existingBudget = await this.prisma.budget.findFirst({
      where: whereClause,
      select: { id: true },
    });
    
    return !!existingBudget;
  }

  private detectChanges(currentBudget: any, updateBudgetDto: any): string[] {
    const changes: string[] = [];
    
    if (updateBudgetDto.amount !== undefined && updateBudgetDto.amount !== currentBudget.amount) {
      changes.push('AMOUNT_CHANGED');
    }
    
    if (updateBudgetDto.category !== undefined && updateBudgetDto.category !== currentBudget.category) {
      changes.push('CATEGORY_CHANGED');
    }
    
    if (updateBudgetDto.name !== undefined && updateBudgetDto.name !== currentBudget.name) {
      changes.push('NAME_CHANGED');
    }
    
    if (updateBudgetDto.description !== undefined && updateBudgetDto.description !== currentBudget.description) {
      changes.push('DESCRIPTION_CHANGED');
    }
    
    return changes;
  }
}
