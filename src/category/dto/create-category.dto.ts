import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ 
    description: 'Category name (must be unique)', 
    example: 'Electronics',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    description: 'Category description', 
    example: 'Electronic devices and accessories',
    required: false 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
