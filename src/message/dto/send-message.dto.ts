import { IsString, IsNumber, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsNumber()
  receiverId: number;

  @IsOptional()
  @IsString()
  additionalData?: string;
}