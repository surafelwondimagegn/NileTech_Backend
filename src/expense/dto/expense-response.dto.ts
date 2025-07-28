import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the expense',
    example: 1,
  })
  id: number;

  @ApiPropertyOptional({
    description: 'Project ID (if expense is related to a project)',
    example: 1,
  })
  projectId?: number;

  @ApiPropertyOptional({
    description: 'Sold Product ID (if expense is related to a sold product)',
    example: 1,
  })
  soldProductId?: number;

  @ApiPropertyOptional({
    description: 'Budget ID (if expense is funded from a budget)',
    example: 1,
  })
  budgetId?: number;

  @ApiProperty({
    description: 'Expense amount',
    example: 150.0,
  })
  amount: number;

  @ApiProperty({
    description: 'Expense note/description',
    example: 'Office supplies purchase',
  })
  note: string;

  @ApiProperty({
    description: 'Funding source for the expense',
    example: 'BUDGET',
    enum: ['BUDGET', 'PROFIT'],
  })
  fundingSource: 'BUDGET' | 'PROFIT';

  @ApiProperty({
    description: 'Date and time when the expense was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Project details (if related to a project)',
  })
  project?: {
    id: number;
    title: string;
    status: string;
  };

  @ApiPropertyOptional({
    description: 'Sold Product details (if related to a sold product)',
  })
  soldProduct?: {
    id: number;
    productId: number;
    quantity: number;
    totalRevenue: number;
  };

  @ApiPropertyOptional({
    description: 'Budget details (if funded from a budget)',
  })
  budget?: {
    id: number;
    name: string;
    amount: number;
  };
}
