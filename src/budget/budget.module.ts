import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BudgetHistoryModule } from '../budget-history/budget-history.module';

@Module({
  imports: [PrismaModule, BudgetHistoryModule],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
