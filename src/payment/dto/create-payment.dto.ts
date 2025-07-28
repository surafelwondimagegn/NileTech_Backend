import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Invoice ID for the payment',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  invoiceId: number;

  @ApiProperty({
    description: 'Payment method ID',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  methodId: number;

  @ApiProperty({
    description: 'Payment amount',
    example: 299.97,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    default: PaymentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Payment reference number or transaction ID',
    example: 'TXN-2024-001',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({
    description: 'Additional payment notes',
    example: 'Payment received via bank transfer',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
