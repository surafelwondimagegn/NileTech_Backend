import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    // Check if payment method with same name already exists
    const existingMethod = await this.prisma.paymentMethod.findUnique({
      where: { name: createPaymentMethodDto.name },
    });

    if (existingMethod) {
      throw new BadRequestException(
        `Payment method with name "${createPaymentMethodDto.name}" already exists`,
      );
    }

    return this.prisma.paymentMethod.create({
      data: createPaymentMethodDto,
      include: {
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.paymentMethod.findMany({
      include: {
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        payments: {
          include: {
            invoice: {
              select: {
                id: true,
                clientName: true,
                total: true,
              },
            },
          },
          orderBy: { paidAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return paymentMethod;
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    // Verify payment method exists
    const existingMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existingMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    // If name is being updated, check for duplicates
    if (
      updatePaymentMethodDto.name &&
      updatePaymentMethodDto.name !== existingMethod.name
    ) {
      const duplicateMethod = await this.prisma.paymentMethod.findUnique({
        where: { name: updatePaymentMethodDto.name },
      });

      if (duplicateMethod) {
        throw new BadRequestException(
          `Payment method with name "${updatePaymentMethodDto.name}" already exists`,
        );
      }
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: updatePaymentMethodDto,
      include: {
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    // Verify payment method exists
    const existingMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    if (!existingMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    // Check if payment method is being used
    if (existingMethod._count.payments > 0) {
      throw new BadRequestException(
        `Cannot delete payment method "${existingMethod.name}" as it is being used by ${existingMethod._count.payments} payment(s)`,
      );
    }

    await this.prisma.paymentMethod.delete({
      where: { id },
    });

    return {
      message: `Payment method "${existingMethod.name}" has been deleted successfully`,
    };
  }

  async getPaymentMethodStats() {
    const [totalMethods, activeMethods, popularMethods] = await Promise.all([
      this.prisma.paymentMethod.count(),
      this.prisma.paymentMethod.count({ where: { isActive: true } }),
      this.prisma.paymentMethod.findMany({
        include: {
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: {
          payments: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    return {
      totalMethods,
      activeMethods,
      popularMethods,
    };
  }

  async seedDefaultPaymentMethods() {
    const defaultMethods = [
      {
        name: 'Cash',
        description: 'Physical cash payments',
        icon: '💵',
        color: '#28a745',
        isActive: true,
      },
      {
        name: 'Bank Transfer',
        description: 'Direct bank transfers',
        icon: '🏦',
        color: '#007bff',
        isActive: true,
      },
      {
        name: 'Credit Card',
        description: 'Credit card payments',
        icon: '💳',
        color: '#6f42c1',
        isActive: true,
      },
      {
        name: 'Debit Card',
        description: 'Debit card payments',
        icon: '💳',
        color: '#fd7e14',
        isActive: true,
      },
      {
        name: 'Mobile Money',
        description: 'Mobile money transfers',
        icon: '📱',
        color: '#20c997',
        isActive: true,
      },
      {
        name: 'Check',
        description: 'Bank check payments',
        icon: '📄',
        color: '#6c757d',
        isActive: true,
      },
    ];

    const createdMethods = [];

    for (const method of defaultMethods) {
      try {
        const created = await this.prisma.paymentMethod.upsert({
          where: { name: method.name },
          update: method,
          create: method,
        });
        createdMethods.push(created);
      } catch (error) {
        // Skip if already exists
      }
    }

    return {
      message: `Successfully seeded ${createdMethods.length} default payment methods`,
      methods: createdMethods,
    };
  }
}
