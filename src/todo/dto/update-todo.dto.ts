import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateTodoDto } from './create-todo.dto';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiPropertyOptional({
    description: 'Whether the todo item is completed or not',
    example: true,
    type: 'boolean',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
