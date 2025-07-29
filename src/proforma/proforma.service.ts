import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProformaDto } from './dto/create-proforma.dto';
import { UpdateProformaDto } from './dto/update-proforma.dto';

@Injectable()
export class ProformaService {
  constructor(private prisma: PrismaService) {}

  async create(createProformaDto: CreateProformaDto) {
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      clientAddress, 
      projectId, 
      items, 
      subtotal, 
      taxRate, 
      taxAmount, 
      discountAmount, 
      discountPercentage, 
      shippingAmount, 
      total, 
      currency, 
      notes, 
      termsAndConditions,
      validUntil 
    } = createProformaDto;

    // Validate project if provided
    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
    }

    // Generate proforma number
    const proformaNumber = await this.generateProformaNumber();

    const proforma = await this.prisma.proforma.create({
      data: {
        proformaNumber,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        projectId,
        status: 'DRAFT',
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        discountPercentage,
        shippingAmount,
        total,
        currency,
        notes,
        termsAndConditions,
        validUntil: validUntil ? new Date(validUntil) : null,
        issuedAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Create proforma items
    if (items && items.length > 0) {
      await Promise.all(
        items.map(item => 
          this.prisma.proformaItem.create({
            data: {
              proformaId: proforma.id,
              productId: item.productId,
              serviceId: item.serviceId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              discountPercentage: item.discountPercentage || 0,
              taxRate: item.taxRate || 0,
              subtotal: item.subtotal,
              totalAfterDiscount: item.totalAfterDiscount,
              taxAmount: item.taxAmount || 0,
              total: item.total,
              description: item.description,
            },
          })
        )
      );
    }

    return this.findOne(proforma.id);
  }

  async findAll(query?: any) {
    const { clientName, status, projectId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (clientName) where.clientName = { contains: clientName, mode: 'insensitive' };
    if (status) where.status = status;
    if (projectId) where.projectId = parseInt(projectId);

    const [proformas, total] = await Promise.all([
      this.prisma.proforma.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { issuedAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.proforma.count({ where }),
    ]);

    return {
      data: proformas,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: number) {
    const proforma = await this.prisma.proforma.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            description: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!proforma) {
      throw new NotFoundException(`Proforma with ID ${id} not found`);
    }

    return proforma;
  }

  async update(id: number, updateProformaDto: UpdateProformaDto) {
    const proforma = await this.prisma.proforma.findUnique({
      where: { id },
    });

    if (!proforma) {
      throw new NotFoundException(`Proforma with ID ${id} not found`);
    }

    return this.prisma.proforma.update({
      where: { id },
      data: {
        clientName: updateProformaDto.clientName,
        clientEmail: updateProformaDto.clientEmail,
        clientPhone: updateProformaDto.clientPhone,
        clientAddress: updateProformaDto.clientAddress,
        subtotal: updateProformaDto.subtotal,
        taxRate: updateProformaDto.taxRate,
        taxAmount: updateProformaDto.taxAmount,
        discountAmount: updateProformaDto.discountAmount,
        discountPercentage: updateProformaDto.discountPercentage,
        shippingAmount: updateProformaDto.shippingAmount,
        total: updateProformaDto.total,
        currency: updateProformaDto.currency,
        notes: updateProformaDto.notes,
        termsAndConditions: updateProformaDto.termsAndConditions,
        validUntil: updateProformaDto.validUntil ? new Date(updateProformaDto.validUntil) : undefined,
        status: updateProformaDto.status,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number) {
    const proforma = await this.prisma.proforma.findUnique({
      where: { id },
    });

    if (!proforma) {
      throw new NotFoundException(`Proforma with ID ${id} not found`);
    }

    return this.prisma.proforma.delete({
      where: { id },
    });
  }

  async convertToInvoice(id: number) {
    const proforma = await this.prisma.proforma.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!proforma) {
      throw new NotFoundException(`Proforma with ID ${id} not found`);
    }

    if (proforma.status === 'CONVERTED') {
      throw new BadRequestException('Proforma has already been converted to invoice');
    }

    // Create invoice from proforma
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber: await this.generateInvoiceNumber(),
        clientName: proforma.clientName,
        clientEmail: proforma.clientEmail,
        clientPhone: proforma.clientPhone,
        clientAddress: proforma.clientAddress,
        projectId: proforma.projectId,
        status: 'DRAFT',
        subtotal: proforma.subtotal,
        taxRate: proforma.taxRate,
        taxAmount: proforma.taxAmount,
        discountAmount: proforma.discountAmount,
        discountPercentage: proforma.discountPercentage,
        shippingAmount: proforma.shippingAmount,
        total: proforma.total,
        currency: proforma.currency,
        notes: proforma.notes,
        termsAndConditions: proforma.termsAndConditions,
        issuedAt: new Date(),
      },
    });

    // Create invoice items from proforma items
    await Promise.all(
      proforma.items.map(item =>
        this.prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            serviceId: item.serviceId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            discountPercentage: item.discountPercentage,
            taxRate: item.taxRate,
            subtotal: item.subtotal,
            totalAfterDiscount: item.totalAfterDiscount,
            taxAmount: item.taxAmount,
            total: item.total,
            description: item.description,
          },
        })
      )
    );

    // Update proforma status
    await this.prisma.proforma.update({
      where: { id },
      data: { status: 'CONVERTED' },
    });

    return {
      message: 'Proforma converted to invoice successfully',
      proformaId: id,
      invoiceId: invoice.id,
      invoice: await this.prisma.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          items: true,
        },
      }),
    };
  }

  async approveProforma(id: number) {
    const proforma = await this.prisma.proforma.findUnique({
      where: { id },
    });

    if (!proforma) {
      throw new NotFoundException(`Proforma with ID ${id} not found`);
    }

    if (proforma.status === 'APPROVED') {
      throw new BadRequestException('Proforma is already approved');
    }

    return this.prisma.proforma.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async getProformaStats(query?: any) {
    const { startDate, endDate, status } = query;

    const where: any = {};
    if (startDate || endDate) {
      where.issuedAt = {};
      if (startDate) where.issuedAt.gte = new Date(startDate);
      if (endDate) where.issuedAt.lte = new Date(endDate);
    }
    if (status) where.status = status;

    const proformas = await this.prisma.proforma.findMany({
      where,
      select: {
        id: true,
        total: true,
        status: true,
        issuedAt: true,
      },
    });

    const totalAmount = proformas.reduce((sum, p) => sum + p.total, 0);
    const totalProformas = proformas.length;
    const approvedProformas = proformas.filter(p => p.status === 'APPROVED').length;
    const convertedProformas = proformas.filter(p => p.status === 'CONVERTED').length;

    return {
      summary: {
        totalAmount,
        totalProformas,
        approvedProformas,
        convertedProformas,
        conversionRate: totalProformas > 0 ? (convertedProformas / totalProformas) * 100 : 0,
      },
      byStatus: proformas.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  private async generateProformaNumber(): Promise<string> {
    const lastProforma = await this.prisma.proforma.findFirst({
      orderBy: { id: 'desc' },
    });

    const nextNumber = lastProforma ? parseInt(lastProforma.proformaNumber.replace('PF-', '')) + 1 : 1;
    return `PF-${nextNumber.toString().padStart(6, '0')}`;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const lastInvoice = await this.prisma.invoice.findFirst({
      orderBy: { id: 'desc' },
    });

    const nextNumber = lastInvoice && lastInvoice.invoiceNumber ? parseInt(lastInvoice.invoiceNumber.replace('INV-', '')) + 1 : 1;
    return `INV-${nextNumber.toString().padStart(6, '0')}`;
  }
}