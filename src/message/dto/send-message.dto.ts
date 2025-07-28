import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello! How is the project going?',
  })
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({
    description: 'Receiver user ID (for direct messages)',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  receiverId?: number;

  @ApiPropertyOptional({
    description: 'Project ID (for project chat room)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  projectId?: number;

  @ApiPropertyOptional({
    description: 'Message type',
    enum: MessageType,
    default: MessageType.TEXT,
    example: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType = MessageType.TEXT;

  @ApiPropertyOptional({
    description: 'URL to uploaded file',
    example: 'https://example.com/file.pdf',
  })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'Original filename',
    example: 'document.pdf',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'File size in bytes', example: 1024000 })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({
    description: 'ID of message to reply to',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  replyToId?: number;
}
