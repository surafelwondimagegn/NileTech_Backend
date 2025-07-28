import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';

@Injectable()
export class InvoiceItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInvoiceItemDto: CreateInvoiceItemDto) {
    const { productId, serviceId } = createInvoiceItemDto;

    // Validate that either productId or serviceId is provided, but not both
    if (!productId && !serviceId) {
      throw new BadRequestException(
        'Invoice item must have either productId or serviceId',
      );
    }
    if (productId && serviceId) {
      throw new BadRequestException(
        'Invoice item cannot have both productId and serviceId',
      );
    }

    // Validate product exists if productId is provided
    if (productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
      if (!product.isActive) {
        throw new BadRequestException(`Product ${product.name} is not active`);
      }
    }

    // Validate service exists if serviceId is provided
    if (serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }
      if (!service.isActive) {
        throw new BadRequestException(`Service ${service.name} is not active`);
      }
    }

    return this.prisma.invoiceItem.create({
      data: {
        invoiceId: createInvoiceItemDto.invoiceId,
        productId: createInvoiceItemDto.productId,
        serviceId: createInvoiceItemDto.serviceId,
        quantity: createInvoiceItemDto.quantity,
        unitPrice: createInvoiceItemDto.unitPrice,
        discount: createInvoiceItemDto.discount,
        discountPercentage: createInvoiceItemDto.discountPercentage,
        taxRate: createInvoiceItemDto.taxRate,
        subtotal: createInvoiceItemDto.subtotal,
        totalAfterDiscount: createInvoiceItemDto.totalAfterDiscount,
        taxAmount: createInvoiceItemDto.taxAmount,
        total: createInvoiceItemDto.total,
        description: createInvoiceItemDto.description,
      },
      include: {
        invoice: {
          select: {
            id: true,
            clientName: true,
            total: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sellingPrice: true,
            sku: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            serviceCode: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.invoiceItem.findMany({
      include: {
        invoice: {
          select: {
            id: true,
            clientName: true,
            total: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sellingPrice: true,
            sku: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            serviceCode: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const invoiceItem = await this.prisma.invoiceItem.findUnique({
      where: { id },
      include: {
        invoice: {
          select: {
            id: true,
            clientName: true,
            total: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sellingPrice: true,
            sku: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            serviceCode: true,
          },
        },
      },
    });

    if (!invoiceItem) {
      throw new NotFoundException(`Invoice item with ID ${id} not found`);
    }

    return invoiceItem;
  }

  async update(id: number, updateInvoiceItemDto: UpdateInvoiceItemDto) {
    // Verify invoice item exists
    const existingItem = await this.prisma.invoiceItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException(`Invoice item with ID ${id} not found`);
    }

    const { productId, serviceId } = updateInvoiceItemDto;

    // Validate that either productId or serviceId is provided, but not both
    if (productId !== undefined && serviceId !== undefined) {
      if (!productId && !serviceId) {
        throw new BadRequestException(
          'Invoice item must have either productId or serviceId',
        );
      }
      if (productId && serviceId) {
        throw new BadRequestException(
          'Invoice item cannot have both productId and serviceId',
        );
      }
    }

    // Validate product exists if productId is being updated
    if (productId !== undefined && productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
      if (!product.isActive) {
        throw new BadRequestException(`Product ${product.name} is not active`);
      }
    }

    // Validate service exists if serviceId is being updated
    if (serviceId !== undefined && serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }
      if (!service.isActive) {
        throw new BadRequestException(`Service ${service.name} is not active`);
      }
    }

    return this.prisma.invoiceItem.update({
      where: { id },
      data: updateInvoiceItemDto,
      include: {
        invoice: {
          select: {
            id: true,
            clientName: true,
            total: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sellingPrice: true,
            sku: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            serviceCode: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    // Verify invoice item exists
    const existingItem = await this.prisma.invoiceItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException(`Invoice item with ID ${id} not found`);
    }

    await this.prisma.invoiceItem.delete({
      where: { id },
    });

    return {
      message: `Invoice item with ID ${id} has been deleted successfully`,
    };
  }

  async findByInvoice(invoiceId: number) {
    // Verify invoice exists
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    return this.prisma.invoiceItem.findMany({
      where: { invoiceId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sellingPrice: true,
            sku: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            serviceCode: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }
}
