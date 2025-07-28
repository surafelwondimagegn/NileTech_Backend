import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({
    description: 'The title of the todo item',
    example: 'Complete project documentation',
    maxLength: 255,
    minLength: 1,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Optional detailed description of the todo item',
    example:
      'Write comprehensive documentation for the API endpoints including authentication, error handling, and usage examples',
    maxLength: 1000,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
