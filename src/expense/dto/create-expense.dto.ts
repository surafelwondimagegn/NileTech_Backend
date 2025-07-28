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

export class CreateExpenseDto {
  @ApiPropertyOptional({
    description: 'Project ID (optional - for project-related expenses)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  projectId?: number;

  @ApiPropertyOptional({
    description:
      'Sold Product ID (optional - for expenses related to sold products)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  soldProductId?: number;

  @ApiPropertyOptional({
    description: 'Budget ID (optional - for budget-funded expenses)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  budgetId?: number;

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
    example: 'Office supplies purchase',
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
}
