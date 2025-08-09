import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SellServiceItemDto {
  @ApiProperty({ description: 'Service ID to sell', example: 1 })
  @IsInt()
  serviceId: number;

  @ApiProperty({ description: 'Quantity to sell', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Customer name', example: 'Jane Smith' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'jane@example.com',
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
    example: 'Priority client',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Payment method ID', example: 1 })
  @IsInt()
  paymentMethodId: number;

  @ApiPropertyOptional({ description: 'Payment reference number', example: 'TXN123456' })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Payment notes', example: 'Paid in cash' })
  @IsOptional()
  @IsString()
  paymentNotes?: string;
}

export class SellMultipleServicesDto {
  @ApiProperty({
    type: [SellServiceItemDto],
    description: 'Array of services to sell',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SellServiceItemDto)
  items: SellServiceItemDto[];
}
