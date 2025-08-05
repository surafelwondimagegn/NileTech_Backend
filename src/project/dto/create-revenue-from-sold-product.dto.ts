import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRevenueFromSoldProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({
    description: 'Quantity sold',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Selling price per unit',
    example: 200.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiPropertyOptional({
    description: 'Customer name',
    example: 'Jane Smith',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'jane.smith@example.com',
  })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({
    description: 'Customer phone',
    example: '+1987654321',
  })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Revenue from product sale',
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 