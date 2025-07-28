import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsInt, Min, Max } from 'class-validator';

export class CreateProjectMilestoneDto {
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}