import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SoldProductResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the sold product record',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Product ID that was sold',
    example: 1,
  })
  productId: number;

  @ApiProperty({
    description: 'Quantity of products sold',
    example: 5,
  })
  quantity: number;

  @ApiProperty({
    description: 'Price at which the product was sold',
    example: 150.0,
  })
  sellingPrice: number;

  @ApiProperty({
    description: 'Original buying price of the product',
    example: 100.0,
  })
  buyingPrice: number;

  @ApiProperty({
    description: 'Total revenue from this sale (quantity * sellingPrice)',
    example: 750.0,
  })
  totalRevenue: number;

  @ApiProperty({
    description:
      'Total profit from this sale (quantity * (sellingPrice - buyingPrice))',
    example: 250.0,
  })
  totalProfit: number;

  @ApiPropertyOptional({
    description: 'Customer name',
    example: 'John Doe',
  })
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  customerEmail?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  customerPhone?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the sale',
    example: 'Customer requested express delivery',
  })
  notes?: string;

  @ApiProperty({
    description: 'Date and time when the product was sold',
    example: '2024-01-15T10:30:00Z',
  })
  soldAt: Date;

  @ApiProperty({
    description: 'Date and time when the record was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the record was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Product details',
  })
  product?: {
    id: number;
    name: string;
    sku?: string;
    barcode?: string;
  };
}
