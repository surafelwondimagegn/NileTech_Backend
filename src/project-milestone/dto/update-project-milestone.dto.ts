import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectMilestoneDto } from './create-project-milestone.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateProjectMilestoneDto extends PartialType(CreateProjectMilestoneDto) {
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}