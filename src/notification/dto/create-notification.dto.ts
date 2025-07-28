import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS',
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'User ID who will receive the notification',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Notification content',
    example: 'Your order has been processed successfully',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.INFO,
    required: false,
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType = NotificationType.INFO;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  read?: boolean = false;
}
