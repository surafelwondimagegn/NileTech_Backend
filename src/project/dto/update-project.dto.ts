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
import { ProjectStatus, ProjectPriority } from './create-project.dto';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project title',
    example: 'Updated Website Redesign',
    minLength: 3,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title?: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Updated project description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Client name',
    example: 'Updated Client Name',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({
    description: 'Client email address',
    example: 'updated@client.com',
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
    description: 'Client ID',
    example: 1,
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
    example: ProjectStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({
    description: 'Priority level',
    enum: ProjectPriority,
    example: ProjectPriority.HIGH,
    required: false,
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
    description: 'Total time spent in minutes',
    example: 300,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  timeSpent?: number;

  @ApiProperty({
    description: 'Actual hours worked',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  actualHours?: number;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2025-07-24T15:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
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
    example: 'Updated project notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Client feedback',
    example: 'Updated client feedback',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientFeedback?: string;

  @ApiProperty({
    description: 'Internal notes (visible only to staff)',
    example: 'Updated internal notes',
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
}
