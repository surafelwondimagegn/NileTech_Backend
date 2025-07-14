import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateBudgetHistoryDto {
  @ApiProperty({ description: 'Budget ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  budgetId: number;

  @ApiProperty({ 
    description: 'Action performed on the budget', 
    example: 'CREATED',
    enum: ['CREATED', 'UPDATED', 'DELETED', 'AMOUNT_CHANGED', 'CATEGORY_CHANGED']
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ 
    description: 'Previous values (JSON string)', 
    example: '{"amount": 1000, "category": "Materials"}',
    required: false 
  })
  @IsString()
  @IsOptional()
  oldValue?: string;

  @ApiProperty({ 
    description: 'New values (JSON string)', 
    example: '{"amount": 1500, "category": "Materials"}',
    required: false 
  })
  @IsString()
  @IsOptional()
  newValue?: string;

  @ApiProperty({ description: 'User ID who made the change', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  changedBy: number;
}
