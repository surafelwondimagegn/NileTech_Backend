import { ApiProperty } from '@nestjs/swagger';

export class Notification {
  @ApiProperty({ example: 1, description: 'The unique identifier of the notification' })
  id: number;

  @ApiProperty({ example: 1, description: 'User ID who receives the notification' })
  userId: number;

  @ApiProperty({ example: 'Your project has been updated', description: 'Notification content' })
  content: string;

  @ApiProperty({ example: 'INFO', description: 'Notification type', enum: ['INFO', 'WARNING', 'ALERT'] })
  type: string;

  @ApiProperty({ example: false, description: 'Whether the notification has been read' })
  read: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Notification creation date' })
  createdAt: Date;
}