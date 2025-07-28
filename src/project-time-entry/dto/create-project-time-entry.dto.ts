import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateProjectTimeEntryDto {
  @ApiProperty({ example: 1, description: 'Project ID' })
  @IsNumber()
  projectId: number;

  @ApiProperty({ example: 1, description: 'User ID who logged the time' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'Working on API development', description: 'Description of the work done' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2024-01-01T09:00:00.000Z', description: 'Start time of work' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2024-01-01T17:00:00.000Z', description: 'End time of work', required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({ example: 480, description: 'Duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ example: false, description: 'Whether this time entry is currently running', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'Additional notes about the work', description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}