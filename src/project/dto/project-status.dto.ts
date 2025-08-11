import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class StartProjectDto {
  @ApiProperty({
    description: 'Optional notes when starting the project',
    example:
      'Project started successfully. Team assigned and initial setup completed.',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Actual start date (if different from planned start date)',
    example: '2025-07-24T09:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startedAt?: Date;

  @ApiProperty({
    description: 'Initial progress percentage',
    example: 5,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  initialProgress?: number;
}

export class CompleteProjectDto {
  @ApiProperty({
    description: 'Notes about project completion',
    example:
      'Project completed successfully. All deliverables handed over to client.',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Actual completion date',
    example: '2025-08-01T17:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  finishedAt?: Date;

  @ApiProperty({
    description: 'Client feedback on project completion',
    example: 'Excellent work! The final deliverable exceeded our expectations.',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientFeedback?: string;

  @ApiProperty({
    description: 'Actual hours spent on the project',
    example: 85,
    required: false,
  })
  @IsOptional()
  actualHours?: number;
}

export class CancelProjectDto {
  @ApiProperty({
    description: 'Reason for project cancellation',
    example: 'Project cancelled due to client budget constraints.',
    required: true,
  })
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'Additional notes about the cancellation',
    example:
      'Client requested cancellation after initial consultation. No work has been started yet.',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Cancellation date',
    example: '2025-07-24T14:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  cancellationDate?: Date;
}

export class ProjectStatusResponseDto {
  @ApiProperty({
    description: 'Status change message',
    example: 'Project started successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated project object',
    type: 'object',
    additionalProperties: false,
  })
  project?: any;

  @ApiProperty({
    description: 'Previous status (if status was changed)',
    example: 'PENDING',
    required: false,
  })
  oldStatus?: string;

  @ApiProperty({
    description: 'New status',
    example: 'IN_PROGRESS',
  })
  newStatus?: string;
}
