import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async create(createPayrollDto: CreatePayrollDto) {
    const { employeeId, amount, period, type, description, paymentDate } = createPayrollDto;

    // Validate employee exists
    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return this.prisma.payroll.create({
      data: {
        employeeId,
        amount,
        period,
        type,
        description,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(query?: any) {
    const { employeeId, period, type, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (period) where.period = period;
    if (type) where.type = type;
    if (status) where.status = status;

    const [payrolls, total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { paymentDate: 'desc' },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.payroll.count({ where }),
    ]);

    return {
      data: payrolls,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: number) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return payroll;
  }

  async update(id: number, updatePayrollDto: UpdatePayrollDto) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return this.prisma.payroll.update({
      where: { id },
      data: updatePayrollDto,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return this.prisma.payroll.delete({
      where: { id },
    });
  }

  async processPayroll(period: string, companyId?: number) {
    // Get all employees for the company
    const where: any = { role: { in: ['EMPLOYEE', 'MANAGER', 'ADMIN'] } };
    if (companyId) where.companyId = companyId;

    const employees = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: {
          select: {
            jobTitle: true,
            hireDate: true,
          },
        },
      },
    });

    if (employees.length === 0) {
      throw new BadRequestException('No employees found for payroll processing');
    }

    const payrollEntries: any[] = [];
    const totalAmount = employees.reduce((sum, employee) => {
      // Calculate salary based on role and other factors
      let baseSalary = 0;
      switch (employee.role) {
        case 'ADMIN':
          baseSalary = 5000;
          break;
        case 'MANAGER':
          baseSalary = 4000;
          break;
        case 'USER':
          baseSalary = 3000;
          break;
        default:
          baseSalary = 2500;
      }

      // Add bonuses, deductions, etc. here
      const finalAmount = baseSalary;

      payrollEntries.push({
        employeeId: employee.id,
        amount: finalAmount,
        period,
        type: 'SALARY',
        description: `Monthly salary for ${period}`,
        paymentDate: new Date(),
        status: 'PENDING',
      });

      return sum + finalAmount;
    }, 0);

    // Create payroll entries
    const createdPayrolls = await Promise.all(
      payrollEntries.map(entry => this.prisma.payroll.create({ data: entry }))
    );

    return {
      message: `Payroll processed for ${employees.length} employees`,
      totalAmount,
      period,
      payrolls: createdPayrolls,
    };
  }

  async getPayrollSummary(query?: any) {
    const { period, companyId, employeeId } = query;

    const where: any = {};
    if (period) where.period = period;
    if (employeeId) where.employeeId = parseInt(employeeId);

    const payrolls = await this.prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            role: true,
            companyId: true,
          },
        },
      },
    });

    // Filter by company if specified
    const filteredPayrolls = companyId 
      ? payrolls.filter(p => p.employee.companyId === (typeof companyId === 'string' ? parseInt(companyId) : companyId || 0))
      : payrolls;

    const totalAmount = filteredPayrolls.reduce((sum, p) => sum + p.amount, 0);
    const totalEmployees = new Set(filteredPayrolls.map(p => p.employeeId)).size;

    // Group by employee
    const payrollByEmployee = filteredPayrolls.reduce((acc, payroll) => {
      const employeeId = payroll.employeeId;
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employeeId,
          employeeName: payroll.employee.name,
          role: payroll.employee.role,
          totalAmount: 0,
          payrolls: [],
        };
      }
      acc[employeeId].totalAmount += payroll.amount;
      acc[employeeId].payrolls.push(payroll);
      return acc;
    }, {});

    return {
      summary: {
        totalAmount,
        totalEmployees,
        period,
        averageSalary: totalEmployees > 0 ? totalAmount / totalEmployees : 0,
      },
      payrollByEmployee: Object.values(payrollByEmployee),
    };
  }

  async approvePayroll(id: number) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    if (payroll.status === 'APPROVED') {
      throw new BadRequestException('Payroll is already approved');
    }

    return this.prisma.payroll.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async generatePayrollReport(period: string, companyId?: number) {
    const payrolls = await this.prisma.payroll.findMany({
      where: { period },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            companyId: true,
          },
        },
      },
    });

    const filteredPayrolls = companyId 
      ? payrolls.filter(p => p.employee.companyId === (typeof companyId === 'string' ? parseInt(companyId) : companyId))
      : payrolls;

    const report = {
      period,
      totalPayrolls: filteredPayrolls.length,
      totalAmount: filteredPayrolls.reduce((sum, p) => sum + p.amount, 0),
      byStatus: filteredPayrolls.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {}),
      byRole: filteredPayrolls.reduce((acc, p) => {
        acc[p.employee.role] = (acc[p.employee.role] || 0) + p.amount;
        return acc;
      }, {}),
      payrolls: filteredPayrolls,
    };

    return report;
  }
}