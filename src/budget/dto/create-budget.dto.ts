import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'Budget name (must be unique)',
    example: 'Construction Materials Budget',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Budget category',
    example: 'Materials',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Budget description',
    example: 'Budget for construction materials and tools',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Budget amount',
    example: 10000.5,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
