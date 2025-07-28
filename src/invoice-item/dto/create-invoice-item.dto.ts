import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Custom validator to ensure either productId or serviceId is provided, but not both
function IsProductOrService(validationOptions?: any) {
  return function (object: any, propertyName: string) {
    Validate(
      (value: any, args: any) => {
        const obj = args.object;
        const hasProductId =
          obj.productId !== undefined && obj.productId !== null;
        const hasServiceId =
          obj.serviceId !== undefined && obj.serviceId !== null;

        if (!hasProductId && !hasServiceId) {
          return false; // At least one must be provided
        }
        if (hasProductId && hasServiceId) {
          return false; // Cannot have both
        }
        return true;
      },
      {
        message:
          'Invoice item must have either productId or serviceId, but not both',
        ...validationOptions,
      },
    )(object, propertyName);
  };
}

export class CreateInvoiceItemDto {
  @ApiPropertyOptional({
    description: 'Product ID (required if serviceId is not provided)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsProductOrService()
  productId?: number;

  @ApiPropertyOptional({
    description: 'Service ID (required if productId is not provided)',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsProductOrService()
  serviceId?: number;

  @ApiProperty({
    description: 'Quantity of the item',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Unit price for the item',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Custom description for the invoice item',
    example: 'Premium service with extended warranty',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
