import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateNotificationDto {
  // Add your validation properties here
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}