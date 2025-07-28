import { ApiProperty } from '@nestjs/swagger';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class Transaction {
  @ApiProperty({ description: 'Unique identifier for the transaction' })
  id: number;

  @ApiProperty({ description: 'Associated user ID', required: false })
  userId?: number;

  @ApiProperty({ description: 'Associated payment ID', required: false })
  paymentId?: number;

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ description: 'Transaction description', required: false })
  description?: string;

  @ApiProperty({ description: 'When the transaction was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Associated user', required: false })
  user?: any;

  @ApiProperty({ description: 'Associated payment', required: false })
  payment?: any;
}
