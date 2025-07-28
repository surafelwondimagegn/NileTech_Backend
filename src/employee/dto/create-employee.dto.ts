import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 1, description: 'Company ID' })
  @IsNumber()
  companyId: number;

  @ApiProperty({ example: 1, description: 'User ID for authentication', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ example: 'EMP001', description: 'Company-specific employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'John', description: 'Employee first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Employee last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@niletech.com', description: 'Employee email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Employee phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Software Developer', description: 'Employee position' })
  @IsString()
  position: string;

  @ApiProperty({ example: 'Engineering', description: 'Employee department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Employee hire date' })
  @IsDateString()
  hireDate: string;

  @ApiProperty({ example: 75000, description: 'Employee annual salary' })
  @IsNumber()
  salary: number;

  @ApiProperty({ example: 35.5, description: 'Employee hourly rate', required: false })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiProperty({ example: 'FULL_TIME', description: 'Employment type' })
  @IsIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'])
  employmentType: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Employee status', required: false })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'TERMINATED'])
  status?: string;

  @ApiProperty({ example: '123 Employee Street', description: 'Employee address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Employee City', description: 'Employee city', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Employee State', description: 'Employee state', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'USA', description: 'Employee country', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '12345', description: 'Employee postal code', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Emergency contact name', required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ example: '+1987654321', description: 'Emergency contact phone', required: false })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiProperty({ example: 'Spouse', description: 'Emergency contact relation', required: false })
  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  @ApiProperty({ example: '1234567890', description: 'Bank account number', required: false })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiProperty({ example: 'Bank of America', description: 'Bank name', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: '123456789', description: 'Bank routing number', required: false })
  @IsOptional()
  @IsString()
  bankRoutingNumber?: string;

  @ApiProperty({ example: 'TAX123456', description: 'Employee tax ID', required: false })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiProperty({ example: '123-45-6789', description: 'Social security number', required: false })
  @IsOptional()
  @IsString()
  socialSecurityNumber?: string;

  @ApiProperty({ example: '1990-01-01T00:00:00.000Z', description: 'Date of birth', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: 'Male', description: 'Gender', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 'Single', description: 'Marital status', required: false })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiProperty({ example: 'Additional notes about the employee', description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}