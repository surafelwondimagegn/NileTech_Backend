import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsEnum, IsString } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Associated user ID', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: 'Associated payment ID', required: false })
  @IsOptional()
  @IsNumber()
  paymentId?: number;

  @ApiProperty({ description: 'Transaction amount', minimum: 0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ description: 'Transaction description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
