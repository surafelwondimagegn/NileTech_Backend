import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS',
}

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType = NotificationType.INFO;
}
