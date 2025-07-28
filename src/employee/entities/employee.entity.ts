import { ApiProperty } from '@nestjs/swagger';

export class Employee {
  @ApiProperty({ example: 1, description: 'The unique identifier of the employee' })
  id: number;

  @ApiProperty({ example: 1, description: 'Company ID' })
  companyId: number;

  @ApiProperty({ example: 1, description: 'User ID for authentication', required: false })
  userId?: number | null;

  @ApiProperty({ example: 'EMP001', description: 'Company-specific employee ID' })
  employeeId: string;

  @ApiProperty({ example: 'John', description: 'Employee first name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Employee last name' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@niletech.com', description: 'Employee email' })
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Employee phone number', required: false })
  phone?: string;

  @ApiProperty({ example: 'Software Developer', description: 'Employee position' })
  position: string;

  @ApiProperty({ example: 'Engineering', description: 'Employee department', required: false })
  department?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Employee hire date' })
  hireDate: Date;

  @ApiProperty({ example: 75000, description: 'Employee annual salary' })
  salary: number;

  @ApiProperty({ example: 35.5, description: 'Employee hourly rate', required: false })
  hourlyRate?: number;

  @ApiProperty({ example: 'FULL_TIME', description: 'Employment type' })
  employmentType: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Employee status' })
  status: string;

  @ApiProperty({ example: '123 Employee Street', description: 'Employee address', required: false })
  address?: string;

  @ApiProperty({ example: 'Employee City', description: 'Employee city', required: false })
  city?: string;

  @ApiProperty({ example: 'Employee State', description: 'Employee state', required: false })
  state?: string;

  @ApiProperty({ example: 'USA', description: 'Employee country', required: false })
  country?: string;

  @ApiProperty({ example: '12345', description: 'Employee postal code', required: false })
  postalCode?: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Emergency contact name', required: false })
  emergencyContactName?: string;

  @ApiProperty({ example: '+1987654321', description: 'Emergency contact phone', required: false })
  emergencyContactPhone?: string;

  @ApiProperty({ example: 'Spouse', description: 'Emergency contact relation', required: false })
  emergencyContactRelation?: string;

  @ApiProperty({ example: '1234567890', description: 'Bank account number', required: false })
  bankAccountNumber?: string;

  @ApiProperty({ example: 'Bank of America', description: 'Bank name', required: false })
  bankName?: string;

  @ApiProperty({ example: '123456789', description: 'Bank routing number', required: false })
  bankRoutingNumber?: string;

  @ApiProperty({ example: 'TAX123456', description: 'Employee tax ID', required: false })
  taxId?: string;

  @ApiProperty({ example: '123-45-6789', description: 'Social security number', required: false })
  socialSecurityNumber?: string;

  @ApiProperty({ example: '1990-01-01T00:00:00.000Z', description: 'Date of birth', required: false })
  dateOfBirth?: Date;

  @ApiProperty({ example: 'Male', description: 'Gender', required: false })
  gender?: string;

  @ApiProperty({ example: 'Single', description: 'Marital status', required: false })
  maritalStatus?: string;

  @ApiProperty({ example: 'Additional notes about the employee', description: 'Notes', required: false })
  notes?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Employee creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Employee last update date' })
  updatedAt: Date;
}