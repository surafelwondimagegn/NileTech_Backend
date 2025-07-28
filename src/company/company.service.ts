import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  async findAll(query?: any) {
    const { page = 1, limit = 10, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return this.prisma.company.delete({
      where: { id },
    });
  }

  async getCompanyStats(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Get various statistics for the company
    const [
      totalUsers,
      totalProjects,
      totalRevenue,
      totalExpenses,
      totalProducts,
      totalServices,
      activeProjects,
      completedProjects,
    ] = await Promise.all([
      this.prisma.user.count({ where: { companyId } }),
      this.prisma.project.count({ where: { clientId: companyId } }),
      this.prisma.revenue.aggregate({
        where: { project: { clientId: companyId } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { project: { clientId: companyId } },
        _sum: { amount: true },
      }),
      this.prisma.product.count({ where: { companyId } }),
      this.prisma.service.count({ where: { companyId } }),
      this.prisma.project.count({
        where: {
          clientId: companyId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.project.count({
        where: {
          clientId: companyId,
          status: 'COMPLETED',
        },
      }),
    ]);

    return {
      company,
      stats: {
        totalUsers,
        totalProjects,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        totalProducts,
        totalServices,
        activeProjects,
        completedProjects,
        profit: (totalRevenue._sum.amount || 0) - (totalExpenses._sum.amount || 0),
        profitMargin: (totalRevenue._sum.amount || 0) > 0 
          ? (((totalRevenue._sum.amount || 0) - (totalExpenses._sum.amount || 0)) / (totalRevenue._sum.amount || 0)) * 100 
          : 0,
      },
    };
  }

  async getCompanyDashboard(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Get recent activities
    const recentProjects = await this.prisma.project.findMany({
      where: { clientId: companyId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const recentTransactions = await this.prisma.transaction.findMany({
      where: { user: { companyId } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const recentInvoices = await this.prisma.invoice.findMany({
      where: { project: { clientId: companyId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const monthlyRevenue = await this.prisma.revenue.groupBy({
      by: ['receivedAt'],
      where: { project: { clientId: companyId } },
      _sum: { amount: true },
      orderBy: { receivedAt: 'desc' },
      take: 12,
    });

    return {
      company,
      dashboard: {
        recentProjects,
        recentTransactions,
        recentInvoices,
        monthlyRevenue,
      },
    };
  }
}