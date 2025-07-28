import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SellResponseDto {
  @ApiProperty({ description: 'Sale type', example: 'product' })
  type: 'product' | 'service';

  @ApiProperty({ description: 'ID of the SoldProduct or SoldService record' })
  saleId: number;

  @ApiProperty({ description: 'Product or Service ID' })
  itemId: number;

  @ApiProperty({ description: 'Quantity sold' })
  quantity: number;

  @ApiProperty({ description: 'Selling price per unit' })
  sellingPrice: number;

  @ApiProperty({ description: 'Total revenue for this sale' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total profit for this sale' })
  totalProfit: number;

  @ApiPropertyOptional({ description: 'Tax amount for this sale', example: 15 })
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Tax ID used', example: 1 })
  taxId?: number;

  @ApiPropertyOptional({ description: 'Customer name' })
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Sale notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Updated stock (for product sales)' })
  updatedStock?: number;
}
