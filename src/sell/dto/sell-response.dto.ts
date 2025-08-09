import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentInfoDto {
  @ApiProperty({ description: 'Payment ID' })
  id: number;

  @ApiProperty({ description: 'Payment method name', example: 'Cash' })
  methodName: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Payment status', example: 'COMPLETED' })
  status: string;

  @ApiPropertyOptional({ description: 'Payment reference' })
  reference?: string;

  @ApiPropertyOptional({ description: 'Payment notes' })
  notes?: string;
}

export class TransactionInfoDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: number;

  @ApiProperty({ description: 'Transaction amount' })
  amount: number;

  @ApiProperty({ description: 'Transaction type', example: 'CREDIT' })
  type: string;

  @ApiPropertyOptional({ description: 'Transaction description' })
  description?: string;
}

export class ReceiptInfoDto {
  @ApiProperty({ description: 'Receipt ID' })
  id: number;

  @ApiProperty({ description: 'Receipt number' })
  number: string;

  @ApiPropertyOptional({ description: 'Receipt note' })
  note?: string;
}

export class NotificationInfoDto {
  @ApiProperty({ description: 'Notification ID' })
  id: number;

  @ApiProperty({ description: 'Notification content' })
  content: string;

  @ApiProperty({ description: 'Notification type', example: 'SUCCESS' })
  type: string;

  @ApiProperty({ description: 'Whether notification is read', example: false })
  read: boolean;
}

export class InventoryTransactionInfoDto {
  @ApiProperty({ description: 'Inventory transaction ID' })
  id: number;

  @ApiProperty({ description: 'Quantity changed' })
  quantity: number;

  @ApiProperty({ description: 'Transaction type', example: 'OUTGOING' })
  transactionType: string;

  @ApiPropertyOptional({ description: 'Transaction note' })
  note?: string;
}

export class SellResponseDto {
  @ApiProperty({ description: 'Sale type', example: 'product' })
  type: 'product' | 'service';

  @ApiProperty({ description: 'ID of the SoldProduct or SoldService record' })
  saleId: number;

  @ApiProperty({ description: 'Product or Service ID' })
  itemId: number;

  @ApiProperty({ description: 'Quantity sold' })
  quantity: number;

  @ApiProperty({ description: 'Selling price per unit' })
  sellingPrice: number;

  @ApiProperty({ description: 'Total revenue for this sale' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total profit for this sale' })
  totalProfit: number;

  @ApiPropertyOptional({ description: 'Tax amount for this sale', example: 15 })
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Tax ID used', example: 1 })
  taxId?: number;

  @ApiPropertyOptional({ description: 'Customer name' })
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Sale notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Updated stock (for product sales)' })
  updatedStock?: number;

  @ApiProperty({ description: 'Payment information' })
  payment: PaymentInfoDto;

  @ApiProperty({ description: 'Transaction information' })
  transaction: TransactionInfoDto;

  @ApiProperty({ description: 'Receipt information' })
  receipt: ReceiptInfoDto;

  @ApiPropertyOptional({ description: 'Notification information' })
  notification?: NotificationInfoDto;

  @ApiPropertyOptional({ description: 'Inventory transaction (for product sales)' })
  inventoryTransaction?: InventoryTransactionInfoDto;
}
