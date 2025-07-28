import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateRevenueDto {
  @ApiProperty({ description: 'Associated project ID', required: false })
  @IsOptional()
  @IsNumber()
  projectId?: number;

  @ApiProperty({ description: 'Associated invoice ID', required: false })
  @IsOptional()
  @IsNumber()
  invoiceId?: number;

  @ApiProperty({ description: 'Associated sold product ID', required: false })
  @IsOptional()
  @IsNumber()
  soldProductId?: number;

  @ApiProperty({ description: 'Revenue amount', minimum: 0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Associated sold service ID', required: false })
  @IsOptional()
  @IsNumber()
  soldServiceId?: number;
}
