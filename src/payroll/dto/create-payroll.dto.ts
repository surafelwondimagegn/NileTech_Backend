import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, Min, IsEnum } from 'class-validator';

export enum PayrollType {
  SALARY = 'SALARY',
  BONUS = 'BONUS',
  OVERTIME = 'OVERTIME',
  DEDUCTION = 'DEDUCTION',
  ALLOWANCE = 'ALLOWANCE',
  COMMISSION = 'COMMISSION',
  REIMBURSEMENT = 'REIMBURSEMENT',
}

export enum PayrollStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export class CreatePayrollDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  period: string;

  @IsOptional()
  @IsEnum(PayrollType)
  type?: PayrollType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus = PayrollStatus.PENDING;
}