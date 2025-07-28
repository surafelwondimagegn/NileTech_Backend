import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../dto/create-project.dto';

export class ProjectServiceEntity {
  @ApiProperty({ description: 'Project Service ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Service ID', example: 1 })
  serviceId: number;

  @ApiProperty({ description: 'Quantity', example: 1 })
  quantity: number;

  @ApiProperty({
    description: 'Unit price (uses service default if not set)',
    example: 150.0,
    required: false,
  })
  unitPrice?: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 10.0,
    required: false,
  })
  discount?: number;

  @ApiProperty({
    description: 'Total price after discount',
    example: 140.0,
    required: false,
  })
  totalPrice?: number;

  @ApiProperty({ description: 'Status', example: 'PENDING', required: false })
  status?: string;

  @ApiProperty({
    description: 'Start date',
    example: '2025-07-14T10:00:00Z',
    required: false,
  })
  startDate?: Date;

  @ApiProperty({
    description: 'End date',
    example: '2025-07-20T18:00:00Z',
    required: false,
  })
  endDate?: Date;

  @ApiProperty({ description: 'Assigned user ID', example: 2, required: false })
  assignedTo?: number;

  @ApiProperty({
    description: 'Notes',
    example: 'Premium service',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-07-14T15:59:53.600Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-14T15:59:53.600Z',
  })
  updatedAt: Date;

  @ApiProperty({ description: 'Service details', required: false })
  service?: {
    id: number;
    name: string;
    price: number;
    description?: string;
  };

  @ApiProperty({ description: 'Assigned user details', required: false })
  assignedToUser?: {
    id: number;
    name: string;
    email: string;
  };
}

export class ProjectProductEntity {
  @ApiProperty({ description: 'Project Product ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Product ID', example: 1 })
  productId: number;

  @ApiProperty({ description: 'Quantity', example: 5 })
  quantity: number;

  @ApiProperty({
    description: 'Unit price (uses product selling price if not set)',
    example: 25.0,
    required: false,
  })
  unitPrice?: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 5.0,
    required: false,
  })
  discount?: number;

  @ApiProperty({
    description: 'Total price after discount',
    example: 120.0,
    required: false,
  })
  totalPrice?: number;

  @ApiProperty({ description: 'Status', example: 'PENDING', required: false })
  status?: string;

  @ApiProperty({
    description: 'Order date',
    example: '2025-07-14T10:00:00Z',
    required: false,
  })
  orderDate?: Date;

  @ApiProperty({
    description: 'Received date',
    example: '2025-07-16T14:00:00Z',
    required: false,
  })
  receivedDate?: Date;

  @ApiProperty({
    description: 'Installed date',
    example: '2025-07-18T16:00:00Z',
    required: false,
  })
  installedDate?: Date;

  @ApiProperty({
    description: 'Notes',
    example: 'High-quality materials',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-07-14T15:59:53.600Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-14T15:59:53.600Z',
  })
  updatedAt: Date;

  @ApiProperty({ description: 'Product details', required: false })
  product?: {
    id: number;
    name: string;
    sellingPrice: number;
    description?: string;
  };
}

export class Project {
  @ApiProperty({ description: 'Project ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Project title', example: 'Website Redesign' })
  title: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Complete website redesign with modern UI/UX',
    required: false,
  })
  description?: string;

  @ApiProperty({ description: 'Client name', example: 'Acme Corp' })
  clientName: string;

  @ApiProperty({
    description: 'Client email',
    example: 'client@acme.com',
    required: false,
  })
  clientEmail?: string;

  @ApiProperty({
    description: 'Client phone',
    example: '+1234567890',
    required: false,
  })
  clientPhone?: string;

  @ApiProperty({ description: 'Client user ID', example: 3 })
  clientId: number;

  @ApiProperty({ description: 'Budget ID', example: 1, required: false })
  budgetId?: number;

  @ApiProperty({ description: 'Assigned user ID', example: 2, required: false })
  assignedToId?: number;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: ProjectStatus.PENDING,
  })
  status: ProjectStatus;

  @ApiProperty({
    description: 'Priority level',
    example: 'HIGH',
    required: false,
  })
  priority?: string;

  @ApiProperty({ description: 'Estimated hours', example: 80, required: false })
  estimatedHours?: number;

  @ApiProperty({
    description: 'Actual hours spent',
    example: 75,
    required: false,
  })
  actualHours?: number;

  @ApiProperty({
    description: 'Start date',
    example: '2025-07-14T10:00:00Z',
    required: false,
  })
  startedAt?: Date;

  @ApiProperty({
    description: 'Finish date',
    example: '2025-08-01T18:00:00Z',
    required: false,
  })
  finishedAt?: Date;

  @ApiProperty({
    description: 'Deadline',
    example: '2025-08-01T18:00:00Z',
    required: false,
  })
  deadline?: Date;

  @ApiProperty({
    description: 'Notes',
    example: 'Urgent project',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Client feedback',
    example: 'Great work!',
    required: false,
  })
  clientFeedback?: string;

  @ApiProperty({
    description: 'Internal notes (staff only)',
    example: 'Technical challenges with API integration',
    required: false,
  })
  internalNotes?: string;

  @ApiProperty({
    description: 'Last updated by user ID',
    example: 2,
    required: false,
  })
  lastUpdatedBy?: number;

  @ApiProperty({
    description: 'Is project visible to client',
    example: true,
    required: false,
  })
  isPublic?: boolean;

  @ApiProperty({
    description: 'Allow client to add updates',
    example: false,
    required: false,
  })
  allowClientUpdates?: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-07-14T15:59:53.600Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-14T15:59:53.600Z',
  })
  updatedAt: Date;

  @ApiProperty({ description: 'Client user info', required: false })
  client?: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty({ description: 'Assigned user info', required: false })
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty({ description: 'Last updated by user info', required: false })
  lastUpdatedByUser?: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty({ description: 'Budget info', required: false })
  budget?: {
    id: number;
    name: string;
    amount: number;
  };

  @ApiProperty({
    description: 'Project services',
    type: [ProjectServiceEntity],
    required: false,
  })
  services?: ProjectServiceEntity[];

  @ApiProperty({
    description: 'Project products',
    type: [ProjectProductEntity],
    required: false,
  })
  products?: ProjectProductEntity[];

  @ApiProperty({
    description: 'Total project value',
    example: 1250.0,
    required: false,
  })
  totalValue?: number;
}
