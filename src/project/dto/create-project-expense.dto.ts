import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsIn,
} from 'class-validator';

export class CreateProjectExpenseDto {
  @ApiProperty({
    description: 'Expense amount',
    example: 150.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Expense note/description',
    example: 'Office supplies purchase for project',
  })
  @IsString()
  note: string;

  @ApiPropertyOptional({
    description: 'Funding source for the expense',
    example: 'BUDGET',
    enum: ['BUDGET', 'PROFIT'],
    default: 'BUDGET',
  })
  @IsOptional()
  @IsIn(['BUDGET', 'PROFIT'])
  fundingSource?: 'BUDGET' | 'PROFIT' = 'BUDGET';

  @ApiPropertyOptional({
    description: 'Budget ID (optional - for budget-funded expenses)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  budgetId?: number;
} 