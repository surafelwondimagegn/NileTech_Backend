import { ApiProperty } from '@nestjs/swagger';
import { UpdateType } from '../dto/create-project-update.dto';

export class ProjectUpdate {
  @ApiProperty({ description: 'Update ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Project ID', example: 1 })
  projectId: number;

  @ApiProperty({
    description: 'Update content',
    example:
      'Project status changed to IN_PROGRESS. Development phase has begun.',
  })
  content: string;

  @ApiProperty({
    description: 'Type of update',
    enum: UpdateType,
    example: UpdateType.STATUS,
  })
  type: UpdateType;

  @ApiProperty({ description: 'User ID who created the update', example: 2 })
  createdBy: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-07-14T15:59:53.600Z',
  })
  createdAt: Date;

  @ApiProperty({ description: 'User who created the update', required: false })
  user?: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty({ description: 'Project info', required: false })
  project?: {
    id: number;
    title: string;
    status: string;
  };
}
