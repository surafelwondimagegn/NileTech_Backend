import { ApiProperty } from '@nestjs/swagger';

export enum StockTransactionType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export class InventoryTransaction {
  @ApiProperty({ description: 'Unique identifier for the inventory transaction' })
  id: number;

  @ApiProperty({ description: 'Product ID' })
  productId: number;

  @ApiProperty({ description: 'Transaction quantity' })
  quantity: number;

  @ApiProperty({ description: 'Transaction type', enum: StockTransactionType })
  transactionType: StockTransactionType;

  @ApiProperty({ description: 'Transaction note', required: false })
  note?: string;

  @ApiProperty({ description: 'When the transaction was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Associated product' })
  product?: any;
}
