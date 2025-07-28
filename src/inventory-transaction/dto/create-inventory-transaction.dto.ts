import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsEnum, IsOptional, IsString } from 'class-validator';
import { StockTransactionType } from '../entities/inventory-transaction.entity';

export class CreateInventoryTransactionDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Transaction quantity' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Transaction type', enum: StockTransactionType })
  @IsEnum(StockTransactionType)
  transactionType: StockTransactionType;

  @ApiProperty({ description: 'Transaction note', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
