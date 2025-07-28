import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  Max,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export enum TaxType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export class CreateTaxDto {
  @ApiProperty({
    description: 'Tax name (must be unique)',
    example: 'VAT',
    maxLength: 100,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Tax description',
    example: 'Value Added Tax at 15%',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tax rate (percentage or fixed amount)',
    example: 15.0,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  rate: number;

  @ApiPropertyOptional({
    description: 'Tax type (percentage or fixed amount)',
    example: TaxType.PERCENTAGE,
    enum: TaxType,
    default: TaxType.PERCENTAGE,
  })
  @IsOptional()
  @IsEnum(TaxType)
  type?: TaxType;

  @ApiPropertyOptional({
    description: 'Whether the tax is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is the default tax for the system',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Country code for region-specific taxes',
    example: 'US',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'State/province for region-specific taxes',
    example: 'CA',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  state?: string;
}
