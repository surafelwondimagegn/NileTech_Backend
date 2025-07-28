import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
      const employee = await this.prisma.employee.create({
        data: {
          ...createEmployeeDto,
          hireDate: new Date(createEmployeeDto.hireDate),
          dateOfBirth: createEmployeeDto.dateOfBirth ? new Date(createEmployeeDto.dateOfBirth) : undefined,
          status: createEmployeeDto.status ?? 'ACTIVE',
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return employee;
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        throw new ConflictException(`Employee with this ${field} already exists`);
      }
      throw error;
    }
  }

  async findAll(companyId?: number): Promise<Employee[]> {
    return this.prisma.employee.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            payrolls: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payrolls: {
          orderBy: { payDate: 'desc' },
          take: 5,
          select: {
            id: true,
            payPeriodStart: true,
            payPeriodEnd: true,
            payDate: true,
            grossPay: true,
            netPay: true,
            status: true,
          },
        },
        _count: {
          select: {
            payrolls: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findByCompany(companyId: number): Promise<Employee[]> {
    return this.findAll(companyId);
  }

  async findByEmployeeId(employeeId: string, companyId?: number): Promise<Employee> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        employeeId,
        ...(companyId && { companyId }),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    await this.findOne(id); // Check if employee exists

    try {
      const employee = await this.prisma.employee.update({
        where: { id },
        data: {
          ...updateEmployeeDto,
          hireDate: updateEmployeeDto.hireDate ? new Date(updateEmployeeDto.hireDate) : undefined,
          dateOfBirth: updateEmployeeDto.dateOfBirth ? new Date(updateEmployeeDto.dateOfBirth) : undefined,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return employee;
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        throw new ConflictException(`Employee with this ${field} already exists`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if employee exists

    await this.prisma.employee.delete({
      where: { id },
    });
  }

  async updateStatus(id: number, status: string): Promise<Employee> {
    await this.findOne(id); // Check if employee exists

    return this.prisma.employee.update({
      where: { id },
      data: { status },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getEmployeeStats(id: number) {
    const employee = await this.findOne(id);
    
    const payrollStats = await this.prisma.payroll.aggregate({
      where: { employeeId: id },
      _count: true,
      _sum: {
        grossPay: true,
        netPay: true,
        regularHours: true,
        overtimeHours: true,
      },
      _avg: {
        grossPay: true,
        netPay: true,
      },
    });

    const currentYear = new Date().getFullYear();
    const yearlyPayrolls = await this.prisma.payroll.findMany({
      where: {
        employeeId: id,
        payDate: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
      select: {
        grossPay: true,
        netPay: true,
        payDate: true,
      },
    });

    return {
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        status: employee.status,
      },
      payrolls: {
        total: payrollStats._count,
        totalGrossPay: payrollStats._sum.grossPay || 0,
        totalNetPay: payrollStats._sum.netPay || 0,
        averageGrossPay: payrollStats._avg.grossPay || 0,
        averageNetPay: payrollStats._avg.netPay || 0,
        totalHours: (payrollStats._sum.regularHours || 0) + (payrollStats._sum.overtimeHours || 0),
        yearlyGrossPay: yearlyPayrolls.reduce((sum, p) => sum + p.grossPay, 0),
        yearlyNetPay: yearlyPayrolls.reduce((sum, p) => sum + p.netPay, 0),
      },
    };
  }
}