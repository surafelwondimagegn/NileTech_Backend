import { ApiProperty } from '@nestjs/swagger';

export class Service {
  @ApiProperty({ description: 'Service ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Service name', example: 'Web Development' })
  name: string;

  @ApiProperty({ description: 'Category ID', example: 1, required: false })
  categoryId?: number;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional web development services',
    required: false,
  })
  description?: string;

  @ApiProperty({ description: 'Service price', example: 1500.0 })
  price: number;

  @ApiProperty({ description: 'Service active status', example: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Estimated duration in hours',
    example: 40,
    required: false,
  })
  duration?: number;

  @ApiProperty({
    description: 'Unique service code',
    example: 'WEB-DEV-001',
    required: false,
  })
  serviceCode?: string;

  @ApiProperty({
    description: 'Service requirements',
    example: 'Client must provide design mockups',
    required: false,
  })
  requirements?: string;

  @ApiProperty({
    description: 'Warranty period in days',
    example: 30,
    required: false,
  })
  warrantyDays?: number;

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

  @ApiProperty({ description: 'Category information', required: false })
  category?: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: 'Number of projects using this service',
    example: 5,
  })
  _count?: {
    projects: number;
    invoiceItems: number;
  };
}
