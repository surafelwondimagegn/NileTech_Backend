import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: 'User ID who receives the notification' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 'Your project has been updated', description: 'Notification content' })
  @IsString()
  content: string;

  @ApiProperty({ 
    example: 'INFO', 
    description: 'Notification type', 
    enum: ['INFO', 'WARNING', 'ALERT'],
    required: false 
  })
  @IsOptional()
  @IsIn(['INFO', 'WARNING', 'ALERT'])
  type?: string;

  @ApiProperty({ example: false, description: 'Whether the notification has been read', required: false })
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
