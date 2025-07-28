import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service',
}

export class SellCombinedItemDto {
  @ApiProperty({ 
    description: 'Type of item to sell', 
    enum: ItemType,
    example: ItemType.PRODUCT 
  })
  @IsEnum(ItemType)
  type: ItemType;

  @ApiProperty({ description: 'Product ID (required if type is product)', example: 1 })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty({ description: 'Service ID (required if type is service)', example: 1 })
  @IsOptional()
  @IsInt()
  serviceId?: number;

  @ApiProperty({ description: 'Quantity to sell', example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Customer name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({
    description: 'Customer phone',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({
    description: 'Sale notes',
    example: 'Urgent delivery',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SellCombinedDto {
  @ApiProperty({
    type: [SellCombinedItemDto],
    description: 'Array of products and services to sell in a single transaction',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SellCombinedItemDto)
  items: SellCombinedItemDto[];
} 