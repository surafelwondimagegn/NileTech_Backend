import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  MinLength,
} from 'class-validator';

export enum UpdateType {
  STATUS = 'status',
  MESSAGE = 'message',
  FILE = 'file',
  MILESTONE = 'milestone',
  INVOICE = 'invoice',
  GENERAL = 'general',
}

export class CreateProjectUpdateDto {
  @ApiProperty({
    description: 'Project ID',
    example: 1,
  })
  @IsNumber()
  projectId: number;

  @ApiProperty({
    description: 'Update content',
    example:
      'Project status changed to IN_PROGRESS. Development phase has begun.',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @ApiProperty({
    description: 'Type of update',
    enum: UpdateType,
    example: UpdateType.STATUS,
  })
  @IsEnum(UpdateType)
  type: UpdateType;

  @ApiProperty({
    description: 'User ID who created the update',
    example: 2,
  })
  @IsNumber()
  createdBy: number;
}
