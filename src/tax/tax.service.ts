import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaxDto, TaxType } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaxDto: CreateTaxDto) {
    const {
      name,
      description,
      rate,
      type,
      isActive,
      isDefault,
      country,
      state,
    } = createTaxDto;

    // Check if tax name already exists
    const existingTax = await this.prisma.tax.findUnique({
      where: { name },
    });

    if (existingTax) {
      throw new ConflictException(`Tax with name "${name}" already exists`);
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await this.prisma.tax.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Validate rate based on type
    if (type === TaxType.PERCENTAGE && rate > 100) {
      throw new BadRequestException('Percentage tax rate cannot exceed 100%');
    }

    const tax = await this.prisma.tax.create({
      data: {
        name,
        description,
        rate,
        type: type || TaxType.PERCENTAGE,
        isActive: isActive !== undefined ? isActive : true,
        isDefault: isDefault || false,
        country,
        state,
      },
    });

    return tax;
  }

  async findAll() {
    return this.prisma.tax.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findActive() {
    return this.prisma.tax.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: number) {
    const tax = await this.prisma.tax.findUnique({
      where: { id },
    });

    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }

    return tax;
  }

  async findDefault() {
    const defaultTax = await this.prisma.tax.findFirst({
      where: { isDefault: true, isActive: true },
    });

    if (!defaultTax) {
      throw new NotFoundException('No default tax found');
    }

    return defaultTax;
  }

  async update(id: number, updateTaxDto: UpdateTaxDto) {
    // Check if tax exists
    const existingTax = await this.prisma.tax.findUnique({
      where: { id },
    });

    if (!existingTax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }

    const {
      name,
      description,
      rate,
      type,
      isActive,
      isDefault,
      country,
      state,
    } = updateTaxDto;

    // Check if name is being changed and if it conflicts
    if (name && name !== existingTax.name) {
      const nameConflict = await this.prisma.tax.findUnique({
        where: { name },
      });

      if (nameConflict) {
        throw new ConflictException(`Tax with name "${name}" already exists`);
      }
    }

    // If this is set as default, unset other defaults
    if (isDefault && !existingTax.isDefault) {
      await this.prisma.tax.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Validate rate based on type
    if (rate !== undefined) {
      const taxType = type || existingTax.type;
      if (taxType === TaxType.PERCENTAGE && rate > 100) {
        throw new BadRequestException('Percentage tax rate cannot exceed 100%');
      }
    }

    const updatedTax = await this.prisma.tax.update({
      where: { id },
      data: {
        name,
        description,
        rate,
        type,
        isActive,
        isDefault,
        country,
        state,
      },
    });

    return updatedTax;
  }

  async remove(id: number) {
    // Check if tax exists
    const existingTax = await this.prisma.tax.findUnique({
      where: { id },
    });

    if (!existingTax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }

    // Check if tax is being used by products or services
    const [productsCount, servicesCount, soldProductsCount, invoiceItemsCount] =
      await Promise.all([
        this.prisma.product.count({ where: { taxId: id } }),
        this.prisma.service.count({ where: { taxId: id } }),
        this.prisma.soldProduct.count({ where: { taxId: id } }),
        this.prisma.invoiceItem.count({ where: { taxId: id } }),
      ]);

    if (
      productsCount > 0 ||
      servicesCount > 0 ||
      soldProductsCount > 0 ||
      invoiceItemsCount > 0
    ) {
      throw new BadRequestException(
        `Cannot delete tax. It is being used by ${productsCount} products, ${servicesCount} services, ${soldProductsCount} sold products, and ${invoiceItemsCount} invoice items.`,
      );
    }

    await this.prisma.tax.delete({
      where: { id },
    });

    return { message: `Tax with ID ${id} has been deleted successfully` };
  }

  // Tax calculation methods
  async calculateTax(
    amount: number,
    taxId?: number,
  ): Promise<{ taxAmount: number; taxRate: number; taxName: string }> {
    let tax;

    if (taxId) {
      tax = await this.prisma.tax.findUnique({
        where: { id: taxId },
      });

      if (!tax) {
        throw new NotFoundException(`Tax with ID ${taxId} not found`);
      }

      if (!tax.isActive) {
        throw new BadRequestException(`Tax "${tax.name}" is not active`);
      }
    } else {
      // Use default tax
      tax = await this.prisma.tax.findFirst({
        where: { isDefault: true, isActive: true },
      });

      if (!tax) {
        // No tax applied
        return { taxAmount: 0, taxRate: 0, taxName: 'No Tax' };
      }
    }

    let taxAmount: number;

    if (tax.type === TaxType.PERCENTAGE) {
      taxAmount = (amount * tax.rate) / 100;
    } else {
      taxAmount = tax.rate; // Fixed amount
    }

    return {
      taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimal places
      taxRate: tax.rate,
      taxName: tax.name,
    };
  }

  // Tax accumulation tracking
  async recordTaxAccumulation(
    taxId: number,
    amount: number,
    taxAmount: number,
  ) {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    const year = now.getFullYear();

    // Find existing accumulation record for this month/year
    const existingAccumulation = await this.prisma.taxAccumulation.findUnique({
      where: {
        taxId_month_year: {
          taxId,
          month,
          year,
        },
      },
    });

    if (existingAccumulation) {
      // Update existing record
      await this.prisma.taxAccumulation.update({
        where: {
          taxId_month_year: {
            taxId,
            month,
            year,
          },
        },
        data: {
          totalTax: existingAccumulation.totalTax + taxAmount,
          totalSales: existingAccumulation.totalSales + amount,
        },
      });
    } else {
      // Create new record
      await this.prisma.taxAccumulation.create({
        data: {
          taxId,
          month,
          year,
          totalTax: taxAmount,
          totalSales: amount,
        },
      });
    }
  }

  // Get tax accumulation reports
  async getTaxAccumulation(taxId?: number, year?: number, month?: number) {
    const where: any = {};

    if (taxId) {
      where.taxId = taxId;
    }

    if (year) {
      where.year = year;
    }

    if (month) {
      where.month = month;
    }

    const accumulations = await this.prisma.taxAccumulation.findMany({
      where,
      include: {
        tax: {
          select: {
            id: true,
            name: true,
            rate: true,
            type: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return accumulations;
  }

  // Get tax statistics
  async getTaxStats() {
    const [totalTaxes, activeTaxes, defaultTax] = await Promise.all([
      this.prisma.tax.count(),
      this.prisma.tax.count({ where: { isActive: true } }),
      this.prisma.tax.findFirst({ where: { isDefault: true, isActive: true } }),
    ]);

    // Get current month/year accumulation
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const currentMonthAccumulation = await this.prisma.taxAccumulation.findMany(
      {
        where: {
          month: currentMonth,
          year: currentYear,
        },
        include: {
          tax: {
            select: {
              name: true,
              rate: true,
              type: true,
            },
          },
        },
      },
    );

    const totalCurrentMonthTax = currentMonthAccumulation.reduce(
      (sum, acc) => sum + acc.totalTax,
      0,
    );
    const totalCurrentMonthSales = currentMonthAccumulation.reduce(
      (sum, acc) => sum + acc.totalSales,
      0,
    );

    return {
      totalTaxes,
      activeTaxes,
      defaultTax: defaultTax
        ? {
            id: defaultTax.id,
            name: defaultTax.name,
            rate: defaultTax.rate,
            type: defaultTax.type,
          }
        : null,
      currentMonth: {
        month: currentMonth,
        year: currentYear,
        totalTax: totalCurrentMonthTax,
        totalSales: totalCurrentMonthSales,
        breakdown: currentMonthAccumulation,
      },
    };
  }
}
