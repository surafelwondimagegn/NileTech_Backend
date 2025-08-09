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
  ValidateIf,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Custom date validator that's more flexible
function IsFlexibleDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFlexibleDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === null || value === undefined) {
            return true; // Allow null/undefined
          }
          
          if (value instanceof Date) {
            return !isNaN(value.getTime());
          }
          
          if (typeof value === 'string') {
            const date = new Date(value);
            return !isNaN(date.getTime());
          }
          
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date string or Date object`;
        },
      },
    });
  };
}

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
    example: '2025-08-01T18:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
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
    example: 2,
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
    example: '2025-07-14T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
  startDate?: Date;

  @ApiProperty({
    description: 'End date for the service',
    example: '2025-07-20T18:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
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
    example: '2025-07-14T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
  orderDate?: Date;

  @ApiProperty({
    description: 'Received date',
    example: '2025-07-16T14:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
  receivedDate?: Date;

  @ApiProperty({
    description: 'Installed date',
    example: '2025-07-18T16:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
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
    required: false,
  })
  @IsOptional()
  @IsString()
  clientName?: string;

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
    required: false,
  })
  @IsOptional()
  @IsNumber()
  clientId?: number;

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
    description: 'Total time already spent in minutes',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  timeSpent?: number;

  @ApiProperty({
    description: 'Actual hours worked on the project',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  actualHours?: number;

  @ApiProperty({
    description: 'Timestamp of last activity',
    example: '2025-07-24T12:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
  lastActivityAt?: Date;

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
    example: '2025-07-14T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
  startedAt?: Date;

  @ApiProperty({
    description: 'Finish date',
    example: '2025-08-01T18:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
  finishedAt?: Date;

  @ApiProperty({
    description: 'Project deadline',
    example: '2025-08-01T18:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsFlexibleDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  })
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

  @ApiProperty({
    description: 'Proforma notes (optional)',
    example: 'Terms and conditions, delivery timeline',
    required: false,
  })
  @IsOptional()
  @IsString()
  proformaNotes?: string;

  @ApiProperty({
    description: 'Create empty invoice even if no items are provided',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  createEmptyInvoice?: boolean;

  @ApiProperty({
    description: 'Create empty proforma even if no items are provided',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  createEmptyProforma?: boolean;
}

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

  @ApiProperty({
    description: 'Proforma notes (optional)',
    example: 'Terms and conditions, delivery timeline',
    required: false,
  })
  @IsOptional()
  @IsString()
  proformaNotes?: string;
}

export class CreateProjectDto extends CreateProjectWithInvoiceDto {}
