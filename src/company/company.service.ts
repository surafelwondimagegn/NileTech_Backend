import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      const company = await this.prisma.company.create({
        data: {
          ...createCompanyDto,
          isActive: createCompanyDto.isActive ?? true,
        },
      });
      return company;
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        throw new ConflictException(`Company with this ${field} already exists`);
      }
      throw error;
    }
  }

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            employees: true,
            payrolls: true,
            proformas: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            department: true,
            status: true,
          },
        },
        _count: {
          select: {
            employees: true,
            payrolls: true,
            proformas: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    await this.findOne(id); // Check if company exists

    try {
      const company = await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
      });
      return company;
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        throw new ConflictException(`Company with this ${field} already exists`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if company exists

    await this.prisma.company.delete({
      where: { id },
    });
  }

  async getCompanyStats(id: number) {
    const company = await this.findOne(id);
    
    const [employeeStats, payrollStats, proformaStats] = await Promise.all([
      this.prisma.employee.groupBy({
        by: ['status'],
        where: { companyId: id },
        _count: true,
      }),
      this.prisma.payroll.groupBy({
        by: ['status'],
        where: { companyId: id },
        _count: true,
        _sum: {
          grossPay: true,
          netPay: true,
        },
      }),
      this.prisma.proforma.groupBy({
        by: ['status'],
        where: { companyId: id },
        _count: true,
        _sum: {
          total: true,
        },
      }),
    ]);

    return {
      company: {
        id: company.id,
        name: company.name,
        isActive: company.isActive,
      },
      employees: {
        total: employeeStats.reduce((sum, stat) => sum + stat._count, 0),
        byStatus: employeeStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {}),
      },
      payrolls: {
        total: payrollStats.reduce((sum, stat) => sum + stat._count, 0),
        totalGrossPay: payrollStats.reduce((sum, stat) => sum + (stat._sum.grossPay || 0), 0),
        totalNetPay: payrollStats.reduce((sum, stat) => sum + (stat._sum.netPay || 0), 0),
        byStatus: payrollStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {}),
      },
      proformas: {
        total: proformaStats.reduce((sum, stat) => sum + stat._count, 0),
        totalValue: proformaStats.reduce((sum, stat) => sum + (stat._sum.total || 0), 0),
        byStatus: proformaStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {}),
      },
    };
  }

  async toggleStatus(id: number): Promise<Company> {
    const company = await this.findOne(id);
    
    return this.prisma.company.update({
      where: { id },
      data: { isActive: !company.isActive },
    });
  }
}