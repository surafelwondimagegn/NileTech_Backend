import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRevenueFromSoldServiceDto {
  @ApiProperty({
    description: 'Service ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  serviceId: number;

  @ApiProperty({
    description: 'Quantity sold',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Selling price per unit',
    example: 150.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiPropertyOptional({
    description: 'Customer name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'john.doe@example.com',
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
    description: 'Additional notes',
    example: 'Revenue from service sale',
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 