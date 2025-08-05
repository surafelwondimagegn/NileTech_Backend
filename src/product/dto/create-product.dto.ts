import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  Max,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export enum ProductQuality {
  BRAND_NEW = 'BRAND_NEW',
  SECOND_HAND = 'SECOND_HAND',
  REFURBISHED = 'REFURBISHED',
  USED = 'USED',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Laptop Dell XPS 13',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Supplier ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-performance laptop with 16GB RAM and 512GB SSD',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'DELL-XPS-13-2023',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    description: 'Buying price',
    example: 8,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  buyingPrice: number;

  @ApiProperty({
    description: 'Selling price',
    example: 12,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  sellingPrice: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Image URL',
    example: 'https://example.com/images/laptop.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Product weight in kg',
    example: 1.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product brand name',
    example: 'Dell',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Product model number',
    example: 'XPS 13 9310',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Product quality',
    example: ProductQuality.BRAND_NEW,
    enum: ProductQuality,
    default: ProductQuality.BRAND_NEW,
  })
  @IsOptional()
  @IsEnum(ProductQuality)
  quality?: ProductQuality;

  @ApiPropertyOptional({
    description: 'Product condition description',
    example: 'Excellent condition, barely used',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    description: 'Warranty period in days',
    example: 365,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  warranty?: number;

  @ApiPropertyOptional({
    description: 'Supplier or manufacturer name',
    example: 'Dell Technologies',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({
    description: 'Supplier contact information',
    example: 'support@dell.com, +1-800-999-3355',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  supplierContact?: string;

  @ApiPropertyOptional({
    description: 'Minimum stock level for alerts',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Storage location',
    example: 'Warehouse A, Shelf B3',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated tags for categorization',
    example: 'laptop, premium, business, portable',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Budget ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  budgetId?: number;

  @ApiPropertyOptional({
    description:
      'Tax ID for this product (optional - uses default tax if not provided)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  taxId?: number;

  @ApiPropertyOptional({
    description: 'Is the product active?',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
