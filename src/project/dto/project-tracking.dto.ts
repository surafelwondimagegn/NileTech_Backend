import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  Min,
  Max,
  IsPositive,
  IsBoolean,
} from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({
    description: 'Project progress (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({
    description: 'Notes about the progress update',
    example: 'Completed design phase and started development',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class StartTimeEntryDto {
  @ApiProperty({
    description: 'Description of the work being done',
    example: 'Working on user authentication module',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Implementing JWT token validation',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Custom start time (if different from now)',
    example: '2025-07-24T09:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: Date;
}

export class StopTimeEntryDto {
  @ApiProperty({
    description: 'Additional notes when stopping the time entry',
    example: 'Completed authentication module',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Custom end time (if different from now)',
    example: '2025-07-24T17:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endTime?: Date;
}

export class CreateTimeEntryDto {
  @ApiProperty({
    description: 'Description of the work done',
    example: 'Database schema design',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Start time of the work',
    example: '2025-07-24T09:00:00Z',
  })
  @IsDateString()
  startTime: Date;

  @ApiProperty({
    description: 'End time of the work',
    example: '2025-07-24T17:00:00Z',
  })
  @IsDateString()
  endTime: Date;

  @ApiProperty({
    description:
      'Duration in minutes (optional - will be calculated if not provided)',
    example: 480,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  duration?: number;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Completed ERD and implemented initial migrations',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMilestoneDto {
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
    description: 'Milestone progress (0-100)',
    example: 75,
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
    description: 'Whether the milestone is completed',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

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

export class ProjectTimeEntryResponseDto {
  @ApiProperty({
    description: 'Time entry ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  projectId: number;

  @ApiProperty({
    description: 'User ID',
    example: 2,
  })
  userId: number;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  userName: string;

  @ApiProperty({
    description: 'Description of the work',
    example: 'Working on user authentication module',
  })
  description: string;

  @ApiProperty({
    description: 'Start time',
    example: '2025-07-24T09:00:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'End time',
    example: '2025-07-24T17:00:00.000Z',
    required: false,
  })
  endTime?: Date;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 480,
  })
  duration: number;

  @ApiProperty({
    description: 'Duration in hours',
    example: 8,
  })
  durationHours: number;

  @ApiProperty({
    description: 'Whether this time entry is currently active',
    example: false,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Completed authentication module',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Created at',
    example: '2025-07-24T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2025-07-24T17:00:00.000Z',
  })
  updatedAt: Date;
}

export class ProjectMilestoneResponseDto {
  @ApiProperty({
    description: 'Milestone ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  projectId: number;

  @ApiProperty({
    description: 'Milestone title',
    example: 'Design Phase Complete',
  })
  title: string;

  @ApiProperty({
    description: 'Milestone description',
    example: 'Complete all design mockups and get client approval',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Due date',
    example: '2025-08-01T18:00:00.000Z',
    required: false,
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'Completion date',
    example: '2025-07-28T16:00:00.000Z',
    required: false,
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 75,
  })
  progress: number;

  @ApiProperty({
    description: 'Whether the milestone is completed',
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Order of the milestone',
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Created at',
    example: '2025-07-24T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2025-07-28T16:00:00.000Z',
  })
  updatedAt: Date;
}

export class ProjectTrackingResponseDto {
  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Project title',
    example: 'Website Redesign for Acme Corp',
  })
  title: string;

  @ApiProperty({
    description: 'Current progress (0-100)',
    example: 65,
  })
  progress: number;

  @ApiProperty({
    description: 'Total time spent in minutes',
    example: 3840,
  })
  timeSpent: number;

  @ApiProperty({
    description: 'Total time spent in hours',
    example: 64,
  })
  timeSpentHours: number;

  @ApiProperty({
    description: 'Estimated time in minutes',
    example: 4800,
    required: false,
  })
  timeEstimated?: number;

  @ApiProperty({
    description: 'Estimated time in hours',
    example: 80,
    required: false,
  })
  timeEstimatedHours?: number;

  @ApiProperty({
    description: 'Time efficiency percentage',
    example: 80,
  })
  timeEfficiency: number;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2025-07-24T17:00:00.000Z',
    required: false,
  })
  lastActivityAt?: Date;

  @ApiProperty({
    description: 'Project status',
    example: 'IN_PROGRESS',
  })
  status: string;

  @ApiProperty({
    description: 'Project priority',
    example: 'HIGH',
  })
  priority: string;

  @ApiProperty({
    description: 'Project deadline',
    example: '2025-08-01T18:00:00.000Z',
    required: false,
  })
  deadline?: Date;

  @ApiProperty({
    description: 'Days remaining until deadline',
    example: 8,
    required: false,
  })
  daysRemaining?: number;

  @ApiProperty({
    description: 'Whether project is on track',
    example: true,
  })
  isOnTrack: boolean;

  @ApiProperty({
    description: 'Milestones',
    type: [ProjectMilestoneResponseDto],
  })
  milestones: ProjectMilestoneResponseDto[];

  @ApiProperty({
    description: 'Recent time entries',
    type: [ProjectTimeEntryResponseDto],
  })
  recentTimeEntries: ProjectTimeEntryResponseDto[];

  @ApiProperty({
    description: 'Total time entries count',
    example: 15,
  })
  totalTimeEntries: number;
}
