import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsPositive, IsBoolean, IsUrl, MaxLength, Min, Max } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ 
    description: 'Product name', 
    example: 'Laptop Dell XPS 13',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ 
    description: 'Category ID', 
    example: 1,
    required: false 
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ 
    description: 'Product description', 
    example: 'High-performance laptop with 16GB RAM and 512GB SSD',
    required: false 
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ 
    description: 'Buying price (cost price)', 
    example: 800.00,
    minimum: 0,
    required: true 
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  buyingPrice: number;

  @ApiProperty({ 
    description: 'Selling price (retail price)', 
    example: 1200.00,
    minimum: 0,
    required: true 
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({ 
    description: 'Initial stock quantity', 
    example: 10,
    minimum: 0,
    required: false 
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiProperty({ 
    description: 'Product image URL', 
    example: 'https://example.com/images/laptop.jpg',
    required: false 
  })
  @IsUrl()
  @IsOptional()
  image?: string;

  @ApiProperty({ 
    description: 'Stock Keeping Unit (SKU)', 
    example: 'LAP-DELL-XPS-001',
    required: false 
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({ 
    description: 'Product barcode', 
    example: '1234567890123',
    required: false 
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  barcode?: string;

  @ApiProperty({ 
    description: 'Product weight in kg', 
    example: 1.5,
    minimum: 0,
    required: false 
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @ApiProperty({ 
    description: 'Product dimensions', 
    example: '30x20x2 cm',
    required: false 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  dimensions?: string;

  @ApiProperty({ 
    description: 'Budget ID to deduct buying price from', 
    example: 1,
    required: false 
  })
  @IsNumber()
  @IsOptional()
  budgetId?: number;

  @ApiProperty({ 
    description: 'Product active status', 
    example: true,
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
