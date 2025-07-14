import { Test, TestingModule } from '@nestjs/testing';
import { BudgetHistoryController } from './budget-history.controller';
import { BudgetHistoryService } from './budget-history.service';

describe('BudgetHistoryController', () => {
  let controller: BudgetHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetHistoryController],
      providers: [BudgetHistoryService],
    }).compile();

    controller = module.get<BudgetHistoryController>(BudgetHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
