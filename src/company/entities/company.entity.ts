import { ApiProperty } from '@nestjs/swagger';

export class Company {
  @ApiProperty({ example: 1, description: 'The unique identifier of the company' })
  id: number;

  @ApiProperty({ example: 'Niletech', description: 'Company name' })
  name: string;

  @ApiProperty({ example: 'NILETECH001', description: 'Company registration number' })
  registrationNumber?: string | null;

  @ApiProperty({ example: 'TAX123456', description: 'Tax identification number' })
  taxNumber?: string | null;

  @ApiProperty({ example: 'contact@niletech.com', description: 'Company email' })
  email?: string | null;

  @ApiProperty({ example: '+1234567890', description: 'Company phone number' })
  phone?: string | null;

  @ApiProperty({ example: '123 Business Street, Tech City', description: 'Company address' })
  address?: string | null;

  @ApiProperty({ example: 'Tech City', description: 'Company city' })
  city?: string | null;

  @ApiProperty({ example: 'Tech State', description: 'Company state/province' })
  state?: string | null;

  @ApiProperty({ example: 'USA', description: 'Company country' })
  country?: string | null;

  @ApiProperty({ example: '12345', description: 'Company postal code' })
  postalCode?: string | null;

  @ApiProperty({ example: 'https://niletech.com', description: 'Company website' })
  website?: string | null;

  @ApiProperty({ example: 'Technology solutions and services', description: 'Company description' })
  description?: string | null;

  @ApiProperty({ example: 'https://logo.niletech.com/logo.png', description: 'Company logo URL' })
  logo?: string | null;

  @ApiProperty({ example: 'USD', description: 'Default currency' })
  currency?: string | null;

  @ApiProperty({ example: 'UTC', description: 'Company timezone' })
  timezone?: string | null;

  @ApiProperty({ example: true, description: 'Whether the company is active' })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Company creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Company last update date' })
  updatedAt: Date;
}