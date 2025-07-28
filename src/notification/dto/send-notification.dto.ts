import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { NotificationType } from './create-notification.dto';

export class SendNotificationDto {
  @ApiProperty({
    description: 'User ID who will receive the notification',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;

  @ApiProperty({
    description: 'Notification content',
    example: 'Your order has been processed successfully',
  })
  @IsString()
  @IsNotEmpty()
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
}
