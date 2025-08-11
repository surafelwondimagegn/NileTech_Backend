import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInvoiceDto,
  CreateInvoiceItemInputDto,
  InvoiceStatus,
  PaymentTerms,
} from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  InvoiceResponseDto,
  InvoiceItemResponseDto,
  InvoiceCalculationDto,
} from './dto/invoice-response.dto';

function generateInvoiceNumber(id: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(id).padStart(5, '0')}`;
}

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    let { items, ...invoiceData } = createInvoiceDto;

    // Validate items array - allow empty invoices
    if (!items) {
      items = [];
    }

    // Validate each item has either productId or serviceId, not both (only if items exist)
    if (items.length > 0) {
      for (const item of items) {
        if (!item.productId && !item.serviceId) {
          throw new BadRequestException(
            'Each invoice item must have either productId or serviceId',
          );
        }
        if (item.productId && item.serviceId) {
          throw new BadRequestException(
            'Invoice item cannot have both productId and serviceId',
          );
        }
      }
    }

    // Validate project if provided
    if (invoiceData.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: invoiceData.projectId },
      });
      if (!project) {
        throw new NotFoundException(
          `Project with ID ${invoiceData.projectId} not found`,
        );
      }
    }

    // Validate email format if provided
    if (invoiceData.clientEmail && invoiceData.clientEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invoiceData.clientEmail)) {
        throw new BadRequestException(
          'clientEmail must be a valid email address',
        );
      }
    }

    // Prepare items, calculate all fields
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let itemCount = 0;
    let productsTotal = 0;
    let servicesTotal = 0;
    const validatedItems: any[] = [];

    // Process items if they exist
    if (items.length > 0) {
      for (const item of items) {
        let unitPrice = item.unitPrice;
        let product: any = null;
        let service: any = null;
        if (item.productId) {
          product = await this.prisma.product.findUnique({
            where: { id: item.productId },
          });
          if (!product)
            throw new NotFoundException(
              `Product with ID ${item.productId} not found`,
            );
          if (!product.isActive)
            throw new BadRequestException(
              `Product ${product.name} is not active`,
            );
          if (
            item.useDefaultPrice ||
            unitPrice === undefined ||
            unitPrice === null
          ) {
            unitPrice = product.sellingPrice;
          }
        } else if (item.serviceId) {
          service = await this.prisma.service.findUnique({
            where: { id: item.serviceId },
          });
          if (!service)
            throw new NotFoundException(
              `Service with ID ${item.serviceId} not found`,
            );
          if (!service.isActive)
            throw new BadRequestException(
              `Service ${service.name} is not active`,
            );
          if (
            item.useDefaultPrice ||
            unitPrice === undefined ||
            unitPrice === null
          ) {
            unitPrice = service.price;
          }
        }
        if (unitPrice === undefined || unitPrice === null) {
          throw new BadRequestException(
            'Unit price is required for each item (or set useDefaultPrice to true)',
          );
        }
        if (unitPrice < 0)
          throw new BadRequestException('Unit price cannot be negative');
        if (item.quantity < 1)
          throw new BadRequestException('Quantity must be at least 1');
        // Calculate item subtotal
        const itemSubtotal = unitPrice * item.quantity;
        // Calculate discount
        let itemDiscount = item.discount || 0;
        if (item.discountPercentage) {
          itemDiscount += (item.discountPercentage / 100) * itemSubtotal;
        }
        if (itemDiscount > itemSubtotal) {
          throw new BadRequestException('Discount cannot exceed item subtotal');
        }
        // Calculate after-discount
        const totalAfterDiscount = itemSubtotal - itemDiscount;
        // Calculate tax
        const taxRate = item.taxRate ?? 0;
        const taxAmount = totalAfterDiscount * (taxRate / 100);
        // Calculate item total
        const itemTotal = totalAfterDiscount + taxAmount;
        // Track totals
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        totalTax += taxAmount;
        itemCount++;
        if (item.productId) productsTotal += itemTotal;
        if (item.serviceId) servicesTotal += itemTotal;
        // Prepare validated item
        validatedItems.push({
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice,
          discount: item.discount || 0,
          discountPercentage: item.discountPercentage || 0,
          taxRate,
          subtotal: itemSubtotal,
          totalAfterDiscount,
          taxAmount,
          total: itemTotal,
          description:
            item.description ||
            (product
              ? `${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}`
              : service
                ? `${service.name}${service.serviceCode ? ` (${service.serviceCode})` : ''}`
                : undefined),
          useDefaultPrice: !!item.useDefaultPrice,
        });
      }
    }

    // Invoice-level discounts
    let invoiceDiscount = invoiceData.discountAmount || 0;
    if (invoiceData.discountPercentage) {
      invoiceDiscount += (invoiceData.discountPercentage / 100) * subtotal;
    }
    if (invoiceDiscount > subtotal) {
      throw new BadRequestException('Invoice discount cannot exceed subtotal');
    }
    // Subtotal after discount
    const subtotalAfterDiscount = subtotal - invoiceDiscount;
    // Invoice-level tax
    const invoiceTaxRate = invoiceData.taxRate ?? 0;
    const invoiceTaxAmount =
      invoiceData.includeTax === false
        ? 0
        : subtotalAfterDiscount * (invoiceTaxRate / 100);
    // Shipping
    const shippingAmount =
      invoiceData.includeShipping === false
        ? 0
        : (invoiceData.shippingAmount ?? 0);
    // Grand total
    const grandTotal =
      subtotalAfterDiscount + invoiceTaxAmount + shippingAmount;

    // Set invoice number (auto-generate after creation)
    const invoiceNumber: string | undefined = invoiceData.invoiceNumber;
    // Set due date
    let dueDate: Date | undefined = invoiceData.dueDate;
    if (!dueDate) {
      const issuedAt = invoiceData.issuedAt
        ? new Date(invoiceData.issuedAt)
        : new Date();
      let days = 0;
      switch (invoiceData.paymentTerms) {
        case PaymentTerms.IMMEDIATE:
          days = 0;
          break;
        case PaymentTerms.NET_7:
          days = 7;
          break;
        case PaymentTerms.NET_15:
          days = 15;
          break;
        case PaymentTerms.NET_30:
          days = 30;
          break;
        case PaymentTerms.NET_45:
          days = 45;
          break;
        case PaymentTerms.NET_60:
          days = 60;
          break;
        case PaymentTerms.CUSTOM:
          days = invoiceData.customPaymentDays || 0;
          break;
        default:
          days = 30;
      }
      dueDate = new Date(issuedAt.getTime() + days * 24 * 60 * 60 * 1000);
    }

    // Create invoice in DB (without invoiceNumber first)
    const created = await this.prisma.invoice.create({
      data: {
        ...invoiceData,
        invoiceNumber: undefined, // Will update after creation
        status: invoiceData.status || InvoiceStatus.DRAFT,
        paymentTerms: invoiceData.paymentTerms || PaymentTerms.NET_30,
        customPaymentDays: invoiceData.customPaymentDays,
        issuedAt: invoiceData.issuedAt || new Date(),
        dueDate,
        subtotal,
        taxRate: invoiceTaxRate,
        taxAmount: invoiceTaxAmount,
        discountAmount: invoiceDiscount,
        discountPercentage: invoiceData.discountPercentage || 0,
        shippingAmount,
        total: grandTotal,
        currency: invoiceData.currency || 'ETB',
        purchaseOrderNumber: invoiceData.purchaseOrderNumber,
        notes: invoiceData.notes,
        termsAndConditions: invoiceData.termsAndConditions,
        includeTax: invoiceData.includeTax !== false,
        includeShipping: invoiceData.includeShipping === true,
        items: {
          create: validatedItems,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientName: true,
            status: true,
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
                serviceCode: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
                description: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    // Generate invoice number if not provided
    if (!created.invoiceNumber) {
      const invoiceNumber = generateInvoiceNumber(created.id);
      try {
        await this.prisma.invoice.update({
          where: { id: created.id },
          data: { invoiceNumber },
        });
        created.invoiceNumber = invoiceNumber;
      } catch (e) {
        // If unique constraint fails, fallback to id
        created.invoiceNumber = `INV-${created.id}`;
      }
    }

    // Prepare response DTO
    const response: InvoiceResponseDto = {
      id: created.id,
      invoiceNumber: created.invoiceNumber,
      clientName: created.clientName || '',
      clientEmail: created.clientEmail || undefined,
      clientPhone: created.clientPhone || undefined,
      clientAddress: created.clientAddress || undefined,
      projectId: created.projectId || undefined,
      project: created.project
        ? {
            id: created.project.id,
            title: created.project.title,
            clientName: created.project.clientName || '',
            status: created.project.status,
          }
        : undefined,
      status: created.status as InvoiceStatus,
      paymentTerms: created.paymentTerms as PaymentTerms,
      customPaymentDays: created.customPaymentDays || undefined,
      issuedAt: created.issuedAt,
      dueDate: created.dueDate || undefined,
      calculations: {
        subtotal,
        totalDiscount: invoiceDiscount,
        subtotalAfterDiscount,
        taxRate: invoiceTaxRate,
        taxAmount: invoiceTaxAmount,
        shippingAmount,
        grandTotal,
        itemCount,
        breakdown: {
          products: {
            count: items?.filter((i) => i.productId).length || 0,
            total: productsTotal,
          },
          services: {
            count: items?.filter((i) => i.serviceId).length || 0,
            total: servicesTotal,
          },
        },
      },
      total: grandTotal,
      currency: created.currency,
      purchaseOrderNumber: created.purchaseOrderNumber || undefined,
      notes: created.notes || undefined,
      termsAndConditions: created.termsAndConditions || undefined,
      items: created.items.map((item) => ({
        id: item.id,
        productId: item.productId || undefined,
        serviceId: item.serviceId || undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        discountPercentage: item.discountPercentage,
        taxRate: item.taxRate,
        subtotal: item.subtotal,
        totalAfterDiscount: item.totalAfterDiscount,
        taxAmount: item.taxAmount,
        total: item.total,
        description: item.description || undefined,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              sellingPrice: item.product.sellingPrice,
              description: item.product.description || undefined,
              sku: item.product.sku || undefined,
            }
          : undefined,
        service: item.service
          ? {
              id: item.service.id,
              name: item.service.name,
              price: item.service.price,
              description: item.service.description || undefined,
              serviceCode: item.service.serviceCode || undefined,
            }
          : undefined,
      })),
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
    return response;
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientName: true,
            status: true,
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
                serviceCode: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
                description: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientName: true,
            status: true,
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
                serviceCode: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
                description: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async findOneDetailed(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientName: true,
            status: true,
          },
        },
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
                serviceCode: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
                description: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Calculate detailed breakdown
    const services = invoice.items.filter((item) => item.serviceId);
    const products = invoice.items.filter((item) => item.productId);

    const servicesTotal = services.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const productsTotal = products.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return {
      ...invoice,
      breakdown: {
        services: {
          items: services.map((item) => ({
            id: item.id,
            name: item.service?.name || 'Unknown Service',
            serviceCode: item.service?.serviceCode,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
          total: servicesTotal,
        },
        products: {
          items: products.map((item) => ({
            id: item.id,
            name: item.product?.name || 'Unknown Product',
            sku: item.product?.sku,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
          total: productsTotal,
        },
        grandTotal: invoice.total,
      },
    };
  }

  async findByProject(projectId: number) {
    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const invoices = await this.prisma.invoice.findMany({
      where: { projectId },
      include: {
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
                serviceCode: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
                description: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return invoices;
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    // Verify invoice exists
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    const { items, ...invoiceData } = updateInvoiceDto;

    // If items are being updated, validate them
    if (items) {
      if (items.length === 0) {
        throw new BadRequestException('Invoice must have at least one item');
      }

      // Validate each item has either productId or serviceId
      for (const item of items) {
        if (!item.productId && !item.serviceId) {
          throw new BadRequestException(
            'Each invoice item must have either productId or serviceId',
          );
        }
        if (item.productId && item.serviceId) {
          throw new BadRequestException(
            'Invoice item cannot have both productId and serviceId',
          );
        }
      }

      // Validate products and services exist
      for (const item of items) {
        if (item.productId) {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${item.productId} not found`,
            );
          }
          if (!product.isActive) {
            throw new BadRequestException(
              `Product ${product.name} is not active`,
            );
          }
        } else if (item.serviceId) {
          const service = await this.prisma.service.findUnique({
            where: { id: item.serviceId },
          });
          if (!service) {
            throw new NotFoundException(
              `Service with ID ${item.serviceId} not found`,
            );
          }
          if (!service.isActive) {
            throw new BadRequestException(
              `Service ${service.name} is not active`,
            );
          }
        }
      }
    }

    // If projectId is being updated, validate it exists
    if (invoiceData.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: invoiceData.projectId },
      });
      if (!project) {
        throw new NotFoundException(
          `Project with ID ${invoiceData.projectId} not found`,
        );
      }
    }

    // Calculate new total if items are being updated
    let newTotal = existingInvoice.total;
    if (items) {
      newTotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
    }

    // Use transaction to update invoice and items atomically
    return this.prisma.$transaction(async (prisma) => {
      // Delete existing items if new items are provided
      if (items) {
        await prisma.invoiceItem.deleteMany({
          where: { invoiceId: id },
        });
      }

      // Update invoice
      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          ...invoiceData,
          total: newTotal,
          ...(items && {
            items: {
              create: items,
            },
          }),
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              clientName: true,
              status: true,
            },
          },
          items: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  description: true,
                  serviceCode: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                  sellingPrice: true,
                  description: true,
                  sku: true,
                },
              },
            },
          },
        },
      });

      return updatedInvoice;
    });
  }

  async remove(id: number) {
    // Verify invoice exists
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    // Use transaction to delete invoice and related items atomically
    return this.prisma.$transaction(async (prisma) => {
      // Delete invoice items first (due to foreign key constraint)
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Delete the invoice
      await prisma.invoice.delete({
        where: { id },
      });

      return { message: `Invoice with ID ${id} has been deleted successfully` };
    });
  }

  async getInvoiceStats() {
    const [totalInvoices, totalAmount, recentInvoices] = await Promise.all([
      this.prisma.invoice.count(),
      this.prisma.invoice.aggregate({
        _sum: { total: true },
      }),
      this.prisma.invoice.findMany({
        take: 5,
        orderBy: { issuedAt: 'desc' },
        select: {
          id: true,
          clientName: true,
          total: true,
          issuedAt: true,
        },
      }),
    ]);

    return {
      totalInvoices,
      totalAmount: totalAmount._sum.total || 0,
      recentInvoices,
    };
  }
}
