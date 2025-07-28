import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Todo {
  @ApiProperty({
    description: 'The unique identifier of the todo item',
    example: 1,
    type: 'number',
  })
  id: number;

  @ApiProperty({
    description: 'The ID of the user who owns this todo item',
    example: 1,
    type: 'number',
  })
  userId: number;

  @ApiProperty({
    description: 'The title of the todo item',
    example: 'Complete project documentation',
    type: 'string',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Optional detailed description of the todo item',
    example:
      'Write comprehensive documentation for the API endpoints including authentication, error handling, and usage examples',
    type: 'string',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Whether the todo item is completed or not',
    example: false,
    type: 'boolean',
  })
  completed: boolean;

  @ApiProperty({
    description: 'When the todo item was created',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the todo item was last updated',
    example: '2024-01-15T14:45:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
