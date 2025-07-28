import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, PaymentTerms } from './create-invoice.dto';

export class InvoiceItemResponseDto {
  @ApiProperty({
    description: 'Invoice item ID',
    example: 1,
  })
  id: number;

  @ApiPropertyOptional({
    description: 'Product ID',
    example: 1,
  })
  productId?: number;

  @ApiPropertyOptional({
    description: 'Service ID',
    example: 2,
  })
  serviceId?: number;

  @ApiProperty({
    description: 'Quantity of the item',
    example: 3,
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit price for the item',
    example: 99.99,
  })
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Discount amount for this item',
    example: 10.0,
  })
  discount?: number;

  @ApiPropertyOptional({
    description: 'Discount percentage for this item',
    example: 15,
  })
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Tax rate for this item',
    example: 8.5,
  })
  taxRate?: number;

  @ApiProperty({
    description: 'Item subtotal (quantity * unitPrice)',
    example: 299.97,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Item total after discounts',
    example: 289.97,
  })
  totalAfterDiscount: number;

  @ApiProperty({
    description: 'Item tax amount',
    example: 24.65,
  })
  taxAmount: number;

  @ApiProperty({
    description: 'Item total including tax',
    example: 314.62,
  })
  total: number;

  @ApiPropertyOptional({
    description: 'Custom description for the invoice item',
    example: 'Premium service with extended warranty',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Product details',
    type: 'object',
    additionalProperties: false,
    example: {
      id: 1,
      name: 'Premium Product',
      sellingPrice: 99.99,
      description: 'High-quality product',
      sku: 'PROD-001',
    },
  })
  product?: {
    id: number;
    name: string;
    sellingPrice: number;
    description?: string;
    sku?: string;
  };

  @ApiPropertyOptional({
    description: 'Service details',
    type: 'object',
    additionalProperties: false,
    example: {
      id: 2,
      name: 'Professional Service',
      price: 199.99,
      description: 'Expert consultation service',
      serviceCode: 'SVC-001',
    },
  })
  service?: {
    id: number;
    name: string;
    price: number;
    description?: string;
    serviceCode?: string;
  };
}

export class InvoiceCalculationDto {
  @ApiProperty({
    description: 'Subtotal amount (sum of all items before discounts)',
    example: 599.94,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Total discount amount',
    example: 50.0,
  })
  totalDiscount: number;

  @ApiProperty({
    description: 'Subtotal after discounts',
    example: 549.94,
  })
  subtotalAfterDiscount: number;

  @ApiProperty({
    description: 'Tax rate applied',
    example: 8.5,
  })
  taxRate: number;

  @ApiProperty({
    description: 'Total tax amount',
    example: 46.74,
  })
  taxAmount: number;

  @ApiProperty({
    description: 'Shipping amount',
    example: 15.0,
  })
  shippingAmount: number;

  @ApiProperty({
    description: 'Grand total',
    example: 611.68,
  })
  grandTotal: number;

  @ApiProperty({
    description: 'Number of items in the invoice',
    example: 3,
  })
  itemCount: number;

  @ApiProperty({
    description: 'Breakdown by item type',
    type: 'object',
    additionalProperties: false,
    example: {
      products: {
        count: 2,
        total: 299.97,
      },
      services: {
        count: 1,
        total: 299.97,
      },
    },
  })
  breakdown: {
    products: {
      count: number;
      total: number;
    };
    services: {
      count: number;
      total: number;
    };
  };
}

export class InvoiceResponseDto {
  @ApiProperty({
    description: 'Invoice ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Invoice number',
    example: 'INV-2025-001',
  })
  invoiceNumber: string;

  @ApiProperty({
    description: 'Client name',
    example: 'John Doe',
  })
  clientName: string;

  @ApiPropertyOptional({
    description: 'Client email',
    example: 'john.doe@example.com',
  })
  clientEmail?: string;

  @ApiPropertyOptional({
    description: 'Client phone',
    example: '+1234567890',
  })
  clientPhone?: string;

  @ApiPropertyOptional({
    description: 'Client address',
    example: '123 Main St, City, State 12345',
  })
  clientAddress?: string;

  @ApiPropertyOptional({
    description: 'Project ID',
    example: 1,
  })
  projectId?: number;

  @ApiPropertyOptional({
    description: 'Project details',
    type: 'object',
    additionalProperties: false,
    example: {
      id: 1,
      title: 'Website Redesign for Acme Corp',
      clientName: 'Acme Corporation',
      status: 'IN_PROGRESS',
    },
  })
  project?: {
    id: number;
    title: string;
    clientName: string;
    status: string;
  };

  @ApiProperty({
    description: 'Invoice status',
    enum: InvoiceStatus,
    example: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @ApiProperty({
    description: 'Payment terms',
    enum: PaymentTerms,
    example: PaymentTerms.NET_30,
  })
  paymentTerms: PaymentTerms;

  @ApiPropertyOptional({
    description: 'Custom payment days',
    example: 45,
  })
  customPaymentDays?: number;

  @ApiProperty({
    description: 'Invoice issue date',
    example: '2025-07-24T10:00:00.000Z',
  })
  issuedAt: Date;

  @ApiPropertyOptional({
    description: 'Invoice due date',
    example: '2025-08-23T10:00:00.000Z',
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'Invoice calculations',
    type: InvoiceCalculationDto,
  })
  calculations: InvoiceCalculationDto;

  @ApiProperty({
    description: 'Total invoice amount',
    example: 611.68,
  })
  total: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
  })
  currency?: string;

  @ApiPropertyOptional({
    description: 'Purchase order number',
    example: 'PO-2025-001',
  })
  purchaseOrderNumber?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example:
      'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Terms and conditions',
    example: 'All sales are final. Returns accepted within 30 days.',
  })
  termsAndConditions?: string;

  @ApiProperty({
    description: 'Invoice items',
    type: [InvoiceItemResponseDto],
  })
  items: InvoiceItemResponseDto[];

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2025-07-24T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2025-07-24T10:00:00.000Z',
  })
  updatedAt: Date;
}

export class InvoiceSummaryDto {
  @ApiProperty({
    description: 'Invoice ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Invoice number',
    example: 'INV-2025-001',
  })
  invoiceNumber: string;

  @ApiProperty({
    description: 'Client name',
    example: 'John Doe',
  })
  clientName: string;

  @ApiPropertyOptional({
    description: 'Client email',
    example: 'john.doe@example.com',
  })
  clientEmail?: string;

  @ApiProperty({
    description: 'Invoice status',
    enum: InvoiceStatus,
    example: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @ApiProperty({
    description: 'Total amount',
    example: 611.68,
  })
  total: number;

  @ApiProperty({
    description: 'Invoice issue date',
    example: '2025-07-24T10:00:00.000Z',
  })
  issuedAt: Date;

  @ApiPropertyOptional({
    description: 'Invoice due date',
    example: '2025-08-23T10:00:00.000Z',
  })
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Project title',
    example: 'Website Redesign for Acme Corp',
  })
  projectTitle?: string;

  @ApiProperty({
    description: 'Number of items',
    example: 3,
  })
  itemCount: number;
}

export class InvoiceStatsDto {
  @ApiProperty({
    description: 'Total number of invoices',
    example: 150,
  })
  totalInvoices: number;

  @ApiProperty({
    description: 'Total invoice amount',
    example: 75000.5,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Average invoice amount',
    example: 500.0,
  })
  averageAmount: number;

  @ApiProperty({
    description: 'Number of paid invoices',
    example: 120,
  })
  paidInvoices: number;

  @ApiProperty({
    description: 'Number of overdue invoices',
    example: 15,
  })
  overdueInvoices: number;

  @ApiProperty({
    description: 'Number of draft invoices',
    example: 10,
  })
  draftInvoices: number;

  @ApiProperty({
    description: 'Total paid amount',
    example: 60000.0,
  })
  totalPaidAmount: number;

  @ApiProperty({
    description: 'Total outstanding amount',
    example: 15000.5,
  })
  totalOutstandingAmount: number;

  @ApiProperty({
    description: 'Recent invoices',
    type: [InvoiceSummaryDto],
  })
  recentInvoices: InvoiceSummaryDto[];

  @ApiProperty({
    description: 'Status breakdown',
    type: 'object',
    additionalProperties: false,
    example: {
      DRAFT: 10,
      SENT: 25,
      PAID: 120,
      OVERDUE: 15,
      CANCELLED: 5,
      PARTIALLY_PAID: 10,
    },
  })
  statusBreakdown: Record<InvoiceStatus, number>;
}
