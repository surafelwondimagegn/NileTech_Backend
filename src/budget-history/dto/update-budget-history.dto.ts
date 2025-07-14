import { PartialType } from '@nestjs/swagger';
import { CreateBudgetHistoryDto } from './create-budget-history.dto';

export class UpdateBudgetHistoryDto extends PartialType(CreateBudgetHistoryDto) {}
