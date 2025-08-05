import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateRevenueFromInvoiceDto {
  @ApiProperty({
    description: 'Invoice ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  invoiceId: number;

  @ApiProperty({
    description: 'Revenue amount',
    example: 1000.0,
    minimum: 0,
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    description: 'Date when revenue was received',
    example: '2025-08-04T19:59:40.064Z',
  })
  @IsOptional()
  @IsDateString()
  receivedAt?: Date;
} 