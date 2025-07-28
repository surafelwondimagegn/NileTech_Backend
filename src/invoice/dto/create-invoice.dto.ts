import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsPositive,
  MinLength,
  MaxLength,
  IsDateString,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
}

export enum PaymentTerms {
  IMMEDIATE = 'IMMEDIATE',
  NET_7 = 'NET_7',
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_45 = 'NET_45',
  NET_60 = 'NET_60',
  CUSTOM = 'CUSTOM',
}

export class CreateInvoiceItemInputDto {
  @ApiProperty({
    description: 'Product ID (optional if serviceId is provided)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  productId?: number;

  @ApiProperty({
    description: 'Service ID (optional if productId is provided)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  serviceId?: number;

  @ApiProperty({
    description: 'Quantity of the item',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Unit price for the item',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Discount amount for this item',
    example: 10.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({
    description: 'Discount percentage for this item (0-100)',
    example: 15,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Custom description for the invoice item',
    example: 'Premium service with extended warranty',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Tax rate for this item (0-100)',
    example: 8.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Whether to use default price from product/service',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  useDefaultPrice?: boolean;
}

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Client name for the invoice',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  clientName: string;

  @ApiPropertyOptional({
    description: 'Client email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientEmail?: string;

  @ApiPropertyOptional({
    description: 'Client phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  clientPhone?: string;

  @ApiPropertyOptional({
    description: 'Client address',
    example: '123 Main St, City, State 12345',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  clientAddress?: string;

  @ApiPropertyOptional({
    description: 'Project ID (optional for standalone invoices)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  projectId?: number;

  @ApiPropertyOptional({
    description:
      'Invoice items array (optional - can create invoice without items)',
    type: [CreateInvoiceItemInputDto],
    example: [
      {
        productId: 1,
        quantity: 2,
        unitPrice: 49.99,
        description: 'Premium product with warranty',
      },
      {
        serviceId: 1,
        quantity: 1,
        unitPrice: 199.99,
        description: 'Professional consultation service',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemInputDto)
  items?: CreateInvoiceItemInputDto[];

  @ApiPropertyOptional({
    description: 'Invoice status',
    enum: InvoiceStatus,
    example: InvoiceStatus.DRAFT,
    default: InvoiceStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({
    description: 'Payment terms',
    enum: PaymentTerms,
    example: PaymentTerms.NET_30,
    default: PaymentTerms.NET_30,
  })
  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @ApiPropertyOptional({
    description:
      'Custom payment terms (days) - used when paymentTerms is CUSTOM',
    example: 45,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  customPaymentDays?: number;

  @ApiPropertyOptional({
    description: 'Invoice issue date',
    example: '2025-07-24T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  issuedAt?: Date;

  @ApiPropertyOptional({
    description: 'Invoice due date',
    example: '2025-08-23T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Subtotal amount (calculated automatically if not provided)',
    example: 299.97,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @ApiPropertyOptional({
    description: 'Tax rate for the entire invoice (0-100)',
    example: 8.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Tax amount (calculated automatically if not provided)',
    example: 25.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({
    description: 'Discount amount for the entire invoice',
    example: 50.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Discount percentage for the entire invoice (0-100)',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Shipping amount',
    example: 15.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingAmount?: number;

  @ApiPropertyOptional({
    description: 'Total amount (calculated automatically if not provided)',
    example: 290.47,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Invoice number (auto-generated if not provided)',
    example: 'INV-2025-001',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  invoiceNumber?: string;

  @ApiPropertyOptional({
    description: 'Purchase order number',
    example: 'PO-2025-001',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  purchaseOrderNumber?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the invoice',
    example:
      'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Terms and conditions',
    example: 'All sales are final. Returns accepted within 30 days.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  termsAndConditions?: string;

  @ApiPropertyOptional({
    description: 'Whether to send invoice to client immediately',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  sendToClient?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to include tax in the invoice',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeTax?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to include shipping in the invoice',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeShipping?: boolean;
}
