import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateProjectProformaDto {
  @ApiPropertyOptional({
    description: 'Notes for the proforma invoice',
    example: 'Proforma invoice for project completion',
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 