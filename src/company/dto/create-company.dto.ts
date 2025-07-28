import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Niletech', description: 'Company name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'NILETECH001', description: 'Company registration number', required: false })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ example: 'TAX123456', description: 'Tax identification number', required: false })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiProperty({ example: 'contact@niletech.com', description: 'Company email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', description: 'Company phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Business Street, Tech City', description: 'Company address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Tech City', description: 'Company city', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Tech State', description: 'Company state/province', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'USA', description: 'Company country', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '12345', description: 'Company postal code', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 'https://niletech.com', description: 'Company website', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ example: 'Technology solutions and services', description: 'Company description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://logo.niletech.com/logo.png', description: 'Company logo URL', required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({ example: 'USD', description: 'Default currency', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'UTC', description: 'Company timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: true, description: 'Whether the company is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}