import { ApiProperty } from '@nestjs/swagger';

export class ProjectTimeEntry {
  @ApiProperty({ example: 1, description: 'The unique identifier of the time entry' })
  id: number;

  @ApiProperty({ example: 1, description: 'Project ID' })
  projectId: number;

  @ApiProperty({ example: 1, description: 'User ID who logged the time' })
  userId: number;

  @ApiProperty({ example: 'Working on API development', description: 'Description of the work done' })
  description: string;

  @ApiProperty({ example: '2024-01-01T09:00:00.000Z', description: 'Start time of work' })
  startTime: Date;

  @ApiProperty({ example: '2024-01-01T17:00:00.000Z', description: 'End time of work', required: false })
  endTime?: Date;

  @ApiProperty({ example: 480, description: 'Duration in minutes', required: false })
  duration?: number;

  @ApiProperty({ example: false, description: 'Whether this time entry is currently running' })
  isActive: boolean;

  @ApiProperty({ example: 'Additional notes about the work', description: 'Notes', required: false })
  notes?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Time entry creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Time entry last update date' })
  updatedAt: Date;
}