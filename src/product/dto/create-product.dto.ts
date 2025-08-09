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
  IsNumberString,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value ? parseInt(value) : undefined;
    }
    return value;
  })
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Supplier ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value ? parseInt(value) : undefined;
    }
    return value;
  })
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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = value ? parseFloat(value) : 0;
      return isNaN(parsed) ? 0 : parsed;
    }
    return value || 0;
  })
  buyingPrice: number;

  @ApiProperty({
    description: 'Selling price',
    example: 12,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = value ? parseFloat(value) : 0;
      return isNaN(parsed) ? 0 : parsed;
    }
    return value || 0;
  })
  sellingPrice: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = value ? parseInt(value) : 0;
      return isNaN(parsed) ? 0 : parsed;
    }
    return value || 0;
  })
  stock: number;

  @ApiPropertyOptional({
    description: 'Product image file (will be stored as /uploads/products/{productName}.{extension})',
    type: 'string',
    format: 'binary',
    example: 'laptop.jpg',
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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value ? parseFloat(value) : undefined;
    }
    return value;
  })
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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value ? parseInt(value) : undefined;
    }
    return value;
  })
  warranty?: number;



  @ApiPropertyOptional({
    description: 'Minimum stock level for alerts',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value ? parseInt(value) : undefined;
    }
    return value;
  })
  minStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value ? parseInt(value) : undefined;
    }
    return value;
  })
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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value ? parseInt(value) : undefined;
    }
    return value;
  })
  budgetId?: number;

  @ApiPropertyOptional({
    description:
      'Tax ID for this product (optional - uses default tax if not provided)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value ? parseInt(value) : undefined;
    }
    return value;
  })
  taxId?: number;

  @ApiPropertyOptional({
    description: 'Is the product active?',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1' || value === true;
    }
    return value;
  })
  isActive?: boolean;
}
