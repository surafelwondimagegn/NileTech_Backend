import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsUrl,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Web Development',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Category ID',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    description: 'Service description',
    example:
      'Professional web development services including frontend and backend development',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Service price',
    example: 1500.0,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Service active status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Estimated duration in hours',
    example: 40,
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: 'Unique service code/identifier',
    example: 'WEB-DEV-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  serviceCode?: string;

  @ApiProperty({
    description: 'Service requirements',
    example: 'Client must provide design mockups and content',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  requirements?: string;

  @ApiProperty({
    description: 'Warranty period in days',
    example: 30,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  warrantyDays?: number;

  @ApiProperty({
    description: 'Service expense (cost to provide the service)',
    example: 800.0,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  expense?: number;

  @ApiProperty({
    description: 'Tax ID for the service',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  taxId?: number;
}
