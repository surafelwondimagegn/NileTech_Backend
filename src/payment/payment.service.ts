import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { invoiceId, methodId, amount } = createPaymentDto;

    // Validate invoice exists
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    // Validate payment method exists and is active
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: methodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment method with ID ${methodId} not found`,
      );
    }

    if (!paymentMethod.isActive) {
      throw new BadRequestException(
        `Payment method "${paymentMethod.name}" is not active`,
      );
    }

    // Check if payment amount exceeds invoice total
    const existingPayments = await this.prisma.payment.findMany({
      where: { invoiceId },
    });

    const totalPaid = existingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const remainingAmount = invoice.total - totalPaid;

    if (amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount (${amount}) exceeds remaining invoice amount (${remainingAmount})`,
      );
    }

    // Create payment
    const payment = await this.prisma.payment.create({
      data: createPaymentDto,
      include: {
        invoice: {
          select: {
            id: true,
            clientName: true,
            total: true,
          },
        },
        method: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    // Update payment status to COMPLETED if full amount is paid
    const newTotalPaid = totalPaid + amount;
    if (newTotalPaid >= invoice.total) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED },
      });
    }

    return payment;
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        invoice: {
          select: {
            id: true,
            clientName: true,
            total: true,
          },
        },
        method: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          select: {
            id: true,
            clientName: true,
            total: true,
            clientEmail: true,
            clientPhone: true,
          },
        },
        method: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByInvoice(invoiceId: number) {
    // Verify invoice exists
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    const payments = await this.prisma.payment.findMany({
      where: { invoiceId },
      include: {
        method: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    // Calculate payment summary
    const totalPaid = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const remainingAmount = invoice.total - totalPaid;

    return {
      invoice: {
        id: invoice.id,
        clientName: invoice.clientName,
        total: invoice.total,
      },
      payments,
      summary: {
        totalPaid,
        remainingAmount,
        isFullyPaid: totalPaid >= invoice.total,
      },
    };
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    // Verify payment exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    const { invoiceId, methodId, amount } = updatePaymentDto;

    // Validate invoice if being updated
    if (invoiceId && invoiceId !== existingPayment.invoiceId) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
      }
    }

    // Validate payment method if being updated
    if (methodId && methodId !== existingPayment.methodId) {
      const paymentMethod = await this.prisma.paymentMethod.findUnique({
        where: { id: methodId },
      });

      if (!paymentMethod) {
        throw new NotFoundException(
          `Payment method with ID ${methodId} not found`,
        );
      }

      if (!paymentMethod.isActive) {
        throw new BadRequestException(
          `Payment method "${paymentMethod.name}" is not active`,
        );
      }
    }

    // Validate amount if being updated
    if (amount && amount !== existingPayment.amount) {
      const targetInvoiceId = invoiceId || existingPayment.invoiceId;
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: targetInvoiceId },
      });

      const existingPayments = await this.prisma.payment.findMany({
        where: {
          invoiceId: targetInvoiceId,
          id: { not: id }, // Exclude current payment
        },
      });

      const totalPaid = existingPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      const remainingAmount = invoice.total - totalPaid;

      if (amount > remainingAmount) {
        throw new BadRequestException(
          `Payment amount (${amount}) exceeds remaining invoice amount (${remainingAmount})`,
        );
      }
    }

    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
      include: {
        invoice: {
          select: {
            id: true,
            clientName: true,
            total: true,
          },
        },
        method: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    // Verify payment exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    await this.prisma.payment.delete({
      where: { id },
    });

    return { message: `Payment with ID ${id} has been deleted successfully` };
  }

  async getPaymentStats() {
    const [totalPayments, totalAmount, recentPayments, statusBreakdown] =
      await Promise.all([
        this.prisma.payment.count(),
        this.prisma.payment.aggregate({
          _sum: { amount: true },
        }),
        this.prisma.payment.findMany({
          take: 5,
          orderBy: { paidAt: 'desc' },
          include: {
            invoice: {
              select: {
                id: true,
                clientName: true,
              },
            },
            method: {
              select: {
                name: true,
                icon: true,
              },
            },
          },
        }),
        this.prisma.payment.groupBy({
          by: ['status'],
          _count: { status: true },
          _sum: { amount: true },
        }),
      ]);

    return {
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      recentPayments,
      statusBreakdown: statusBreakdown.map((item) => ({
        status: item.status,
        count: item._count.status,
        totalAmount: item._sum.amount || 0,
      })),
    };
  }

  async getPaymentsByMethod(methodId: number) {
    // Verify payment method exists
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: methodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment method with ID ${methodId} not found`,
      );
    }

    const payments = await this.prisma.payment.findMany({
      where: { methodId },
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
    });

    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    return {
      paymentMethod: {
        id: paymentMethod.id,
        name: paymentMethod.name,
        icon: paymentMethod.icon,
        color: paymentMethod.color,
      },
      payments,
      summary: {
        totalPayments: payments.length,
        totalAmount,
      },
    };
  }
}
