import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from './send-message.dto';

export class ChatUserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'User role', example: 'DEVELOPER' })
  role: string;
}

export class ChatProjectDto {
  @ApiProperty({ description: 'Project ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Project title', example: 'Website Development' })
  title: string;

  @ApiProperty({ description: 'Project status', example: 'IN_PROGRESS' })
  status: string;
}

export class ChatMessageDto {
  @ApiProperty({ description: 'Message ID', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello! How is the project going?',
  })
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  messageType: MessageType;

  @ApiPropertyOptional({
    description: 'URL to uploaded file',
    example: 'https://example.com/file.pdf',
  })
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'Original filename',
    example: 'document.pdf',
  })
  fileName?: string;

  @ApiPropertyOptional({ description: 'File size in bytes', example: 1024000 })
  fileSize?: number;

  @ApiProperty({ description: 'Whether message was edited', example: false })
  isEdited: boolean;

  @ApiPropertyOptional({
    description: 'When message was edited',
    example: '2024-01-15T10:30:00Z',
  })
  editedAt?: Date;

  @ApiProperty({ description: 'Whether message was read', example: false })
  read: boolean;

  @ApiProperty({
    description: 'When message was created',
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When message was updated',
    example: '2024-01-15T10:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({ type: ChatUserDto, description: 'Message sender' })
  sender: ChatUserDto;

  @ApiPropertyOptional({
    type: ChatUserDto,
    description: 'Message receiver (for direct messages)',
  })
  receiver?: ChatUserDto;

  @ApiPropertyOptional({
    type: ChatProjectDto,
    description: 'Project (for project chat)',
  })
  project?: ChatProjectDto;

  @ApiPropertyOptional({
    type: ChatMessageDto,
    description: 'Message being replied to',
  })
  replyTo?: ChatMessageDto;
}

export class ChatRoomDto {
  @ApiProperty({ description: 'Room type', example: 'project' })
  type: 'direct' | 'project';

  @ApiProperty({
    description: 'Room ID (user ID for direct, project ID for project)',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Room name/title',
    example: 'Website Development Project',
  })
  name: string;

  @ApiProperty({
    description: 'Last message in the room',
    type: ChatMessageDto,
  })
  lastMessage: ChatMessageDto;

  @ApiProperty({ description: 'Number of unread messages', example: 3 })
  unreadCount: number;

  @ApiProperty({
    description: 'When last message was sent',
    example: '2024-01-15T10:00:00Z',
  })
  lastActivity: Date;
}
