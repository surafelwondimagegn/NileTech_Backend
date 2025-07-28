import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateProjectHistoryDto {
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  oldValue?: string;

  @IsOptional()
  @IsString()
  newValue?: string;

  @IsNotEmpty()
  @IsNumber()
  createdBy: number;
}