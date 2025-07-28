import { Module } from '@nestjs/common';
import { BudgetHistoryService } from './budget-history.service';
import { BudgetHistoryController } from './budget-history.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BudgetHistoryController],
  providers: [BudgetHistoryService],
  exports: [BudgetHistoryService],
})
export class BudgetHistoryModule {}
