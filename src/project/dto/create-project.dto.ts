import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsArray,
  ValidateNested,
  IsPositive,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProjectStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class ProjectMilestoneDto {
  @ApiProperty({
    description: 'Milestone title',
    example: 'Design Phase Complete',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Milestone description',
    example: 'Complete all design mockups and get client approval',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Due date for the milestone',
    example: '2025-08-01T18:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiProperty({
    description: 'Order of the milestone',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  order?: number;
}

export class ProjectServiceDto {
  @ApiProperty({
    description: 'Service ID (use 0 for new service)',
    example: 1,
  })
  @IsNumber()
  serviceId: number;

  @ApiProperty({
    description: 'Service name (required if serviceId is 0)',
    example: 'Custom Web Development',
    required: false,
  })
  @IsOptional()
  @IsString()
  serviceName?: string;

  @ApiProperty({
    description: 'Service description (required if serviceId is 0)',
    example: 'Custom web development with modern technologies',
    required: false,
  })
  @IsOptional()
  @IsString()
  serviceDescription?: string;

  @ApiProperty({
    description: 'Quantity of the service',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number = 1;

  @ApiProperty({
    description:
      'Unit price for the service (optional - uses service default price if not provided)',
    example: 150.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitPrice?: number;

  @ApiProperty({
    description:
      'Unit cost for the service (optional - uses service default cost if not provided)',
    example: 80.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitCost?: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 10.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({
    description: 'Status of the service',
    example: 'PENDING',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Start date for the service',
    example: '2025-07-14T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({
    description: 'End date for the service',
    example: '2025-07-20T18:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({
    description: 'User ID assigned to this service',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  assignedTo?: number;

  @ApiProperty({
    description: 'Notes for this service',
    example: 'Premium service with extended warranty',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProjectProductDto {
  @ApiProperty({
    description: 'Product ID (use 0 for new product)',
    example: 1,
  })
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: 'Product name (required if productId is 0)',
    example: 'Custom Hardware Component',
    required: false,
  })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({
    description: 'Product description (required if productId is 0)',
    example: 'High-quality custom hardware component',
    required: false,
  })
  @IsOptional()
  @IsString()
  productDescription?: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 5,
    default: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number = 1;

  @ApiProperty({
    description:
      'Unit price for the product (optional - uses product selling price if not provided)',
    example: 25.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitPrice?: number;

  @ApiProperty({
    description:
      'Unit cost for the product (optional - uses product buying price if not provided)',
    example: 15.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitCost?: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 5.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({
    description: 'Status of the product',
    example: 'PENDING',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Order date',
    example: '2025-07-14T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  orderDate?: Date;

  @ApiProperty({
    description: 'Received date',
    example: '2025-07-16T14:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  receivedDate?: Date;

  @ApiProperty({
    description: 'Installed date',
    example: '2025-07-18T16:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  installedDate?: Date;

  @ApiProperty({
    description: 'Notes for this product',
    example: 'High-quality materials',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Base project DTO with common fields
export class BaseProjectDto {
  @ApiProperty({
    description: 'Project title',
    example: 'Website Redesign for Acme Corp',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiProperty({
    description: 'Project description',
    example:
      'Complete website redesign with modern UI/UX and responsive design',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Client name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({
    description: 'Client email address',
    example: 'client@acme.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @ApiProperty({
    description: 'Client phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientPhone?: string;

  @ApiProperty({
    description: 'Client user ID',
    example: 3,
  })
  @IsNumber()
  clientId: number;

  @ApiProperty({
    description: 'Budget ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  budgetId?: number;

  @ApiProperty({
    description: 'Assigned user ID',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  assignedToId?: number;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: ProjectStatus.PENDING,
    default: ProjectStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({
    description: 'Priority level',
    enum: ProjectPriority,
    example: ProjectPriority.MEDIUM,
    default: ProjectPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiProperty({
    description: 'Estimated hours for the project',
    example: 80,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedHours?: number;

  @ApiProperty({
    description: 'Estimated time in minutes',
    example: 4800,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  timeEstimated?: number;

  @ApiProperty({
    description: 'Project progress (0-100)',
    example: 25,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiProperty({
    description: 'Start date',
    example: '2025-07-14T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startedAt?: Date;

  @ApiProperty({
    description: 'Finish date',
    example: '2025-08-01T18:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  finishedAt?: Date;

  @ApiProperty({
    description: 'Project deadline',
    example: '2025-08-01T18:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  deadline?: Date;

  @ApiProperty({
    description: 'Project notes',
    example:
      'Urgent project with high priority. Client needs responsive design.',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Client feedback',
    example: 'Great work on the initial design!',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientFeedback?: string;

  @ApiProperty({
    description: 'Internal notes (visible only to staff)',
    example: 'Technical challenges with API integration',
    required: false,
  })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({
    description: 'Is project visible to client',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Allow client to add updates',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowClientUpdates?: boolean;

  @ApiProperty({
    description: 'Project milestones',
    type: [ProjectMilestoneDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectMilestoneDto)
  milestones?: ProjectMilestoneDto[];
}

// DTO for creating project WITH automatic invoice creation
export class CreateProjectWithInvoiceDto extends BaseProjectDto {
  @ApiProperty({
    description:
      'Services for this project (will be included in automatic invoice)',
    type: [ProjectServiceDto],
    required: false,
    example: [
      {
        serviceId: 1,
        quantity: 2,
        unitPrice: 150.0,
        notes: 'Premium service with extended warranty',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectServiceDto)
  services?: ProjectServiceDto[];

  @ApiProperty({
    description:
      'Products for this project (will be included in automatic invoice)',
    type: [ProjectProductDto],
    required: false,
    example: [
      {
        productId: 1,
        quantity: 5,
        unitPrice: 25.0,
        notes: 'High-quality materials',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectProductDto)
  products?: ProjectProductDto[];

  @ApiProperty({
    description: 'Invoice notes (optional)',
    example: 'Payment due within 30 days',
    required: false,
  })
  @IsOptional()
  @IsString()
  invoiceNotes?: string;
}

// DTO for creating project WITHOUT invoice (empty invoice will be created)
export class CreateProjectWithoutInvoiceDto extends BaseProjectDto {
  @ApiProperty({
    description:
      'Services for this project (will NOT be included in invoice initially)',
    type: [ProjectServiceDto],
    required: false,
    example: [
      {
        serviceId: 1,
        quantity: 2,
        unitPrice: 150.0,
        notes: 'Premium service with extended warranty',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectServiceDto)
  services?: ProjectServiceDto[];

  @ApiProperty({
    description:
      'Products for this project (will NOT be included in invoice initially)',
    type: [ProjectProductDto],
    required: false,
    example: [
      {
        productId: 1,
        quantity: 5,
        unitPrice: 25.0,
        notes: 'High-quality materials',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectProductDto)
  products?: ProjectProductDto[];
}

// Legacy DTO for backward compatibility
export class CreateProjectDto extends CreateProjectWithInvoiceDto {}
