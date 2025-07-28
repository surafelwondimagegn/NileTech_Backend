import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Invoices')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new invoice',
    description:
      'Create a new invoice with items (products and/or services). The total will be automatically calculated based on the items provided.',
  })
  @ApiCreatedResponse({
    description: 'Invoice created successfully',
    schema: {
      example: {
        id: 1,
        clientName: 'John Doe',
        clientEmail: 'john.doe@example.com',
        clientPhone: '+1234567890',
        projectId: null,
        total: 349.97,
        issuedAt: '2024-01-15T10:30:00.000Z',
        project: null,
        items: [
          {
            id: 1,
            productId: 1,
            serviceId: null,
            quantity: 2,
            unitPrice: 49.99,
            description: 'Premium Product (SKU: PROD-001)',
            product: {
              id: 1,
              name: 'Premium Product',
              sellingPrice: 49.99,
              description: 'High-quality product',
              sku: 'PROD-001',
            },
            service: null,
          },
          {
            id: 2,
            productId: null,
            serviceId: 1,
            quantity: 1,
            unitPrice: 249.99,
            description: 'Professional Service (SVC-001)',
            product: null,
            service: {
              id: 1,
              name: 'Professional Service',
              price: 249.99,
              description: 'Expert consultation service',
              serviceCode: 'SVC-001',
            },
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors or invalid data',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Invoice must have at least one item',
          'Each invoice item must have either productId or serviceId',
          'Product with ID 999 not found',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: CreateInvoiceDto,
    description: 'Invoice data with items array',
    examples: {
      'Product Invoice': {
        summary: 'Invoice with products only',
        value: {
          clientName: 'John Doe',
          clientEmail: 'john.doe@example.com',
          clientPhone: '+1234567890',
          items: [
            {
              productId: 1,
              quantity: 2,
              unitPrice: 49.99,
              description: 'Premium product with warranty',
            },
          ],
          notes: 'Payment due within 30 days',
        },
      },
      'Service Invoice': {
        summary: 'Invoice with services only',
        value: {
          clientName: 'Jane Smith',
          clientEmail: 'jane.smith@example.com',
          items: [
            {
              serviceId: 1,
              quantity: 1,
              unitPrice: 199.99,
              description: 'Professional consultation service',
            },
          ],
        },
      },
      'Mixed Invoice': {
        summary: 'Invoice with both products and services',
        value: {
          clientName: 'Bob Johnson',
          projectId: 1,
          items: [
            {
              productId: 1,
              quantity: 1,
              unitPrice: 49.99,
            },
            {
              serviceId: 1,
              quantity: 2,
              unitPrice: 99.99,
              description: 'Installation service',
            },
          ],
        },
      },
    },
  })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all invoices',
    description:
      'Retrieve all invoices with their items, ordered by issue date (newest first)',
  })
  @ApiOkResponse({
    description: 'List of invoices retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          clientName: 'John Doe',
          clientEmail: 'john.doe@example.com',
          projectId: null,
          total: 349.97,
          issuedAt: '2024-01-15T10:30:00.000Z',
          project: null,
          items: [
            {
              id: 1,
              productId: 1,
              quantity: 2,
              unitPrice: 49.99,
              description: 'Premium Product (SKU: PROD-001)',
            },
          ],
        },
      ],
    },
  })
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get invoice statistics',
    description:
      'Retrieve invoice statistics including total count, total amount, and recent invoices',
  })
  @ApiOkResponse({
    description: 'Invoice statistics retrieved successfully',
    schema: {
      example: {
        totalInvoices: 25,
        totalAmount: 12500.5,
        recentInvoices: [
          {
            id: 1,
            clientName: 'John Doe',
            total: 349.97,
            issuedAt: '2024-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  getStats() {
    return this.invoiceService.getInvoiceStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an invoice by ID',
    description: 'Retrieve a specific invoice with all its details and items',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Invoice found and retrieved successfully',
    schema: {
      example: {
        id: 1,
        clientName: 'John Doe',
        clientEmail: 'john.doe@example.com',
        projectId: null,
        total: 349.97,
        issuedAt: '2024-01-15T10:30:00.000Z',
        project: null,
        items: [
          {
            id: 1,
            productId: 1,
            quantity: 2,
            unitPrice: 49.99,
            description: 'Premium Product (SKU: PROD-001)',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Invoice not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Invoice with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.findOne(id);
  }

  @Get(':id/detailed')
  @ApiOperation({
    summary: 'Get detailed invoice with breakdown',
    description:
      'Retrieve a detailed invoice with breakdown of services and products, including totals for each category',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Detailed invoice found with breakdown',
    schema: {
      example: {
        id: 1,
        clientName: 'John Doe',
        total: 349.97,
        issuedAt: '2024-01-15T10:30:00.000Z',
        breakdown: {
          services: {
            items: [
              {
                id: 2,
                name: 'Professional Service',
                serviceCode: 'SVC-001',
                description: 'Professional consultation service',
                quantity: 1,
                unitPrice: 249.99,
                total: 249.99,
              },
            ],
            total: 249.99,
          },
          products: {
            items: [
              {
                id: 1,
                name: 'Premium Product',
                sku: 'PROD-001',
                description: 'Premium Product (SKU: PROD-001)',
                quantity: 2,
                unitPrice: 49.99,
                total: 99.98,
              },
            ],
            total: 99.98,
          },
          grandTotal: 349.97,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Invoice not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Invoice with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  findOneDetailed(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.findOneDetailed(id);
  }

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'Get all invoices for a specific project',
    description: 'Retrieve all invoices associated with a specific project',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Project invoices retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          clientName: 'John Doe',
          projectId: 1,
          total: 349.97,
          issuedAt: '2024-01-15T10:30:00.000Z',
          items: [
            {
              id: 1,
              productId: 1,
              quantity: 2,
              unitPrice: 49.99,
              description: 'Premium Product (SKU: PROD-001)',
            },
          ],
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Project not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Project with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.invoiceService.findByProject(projectId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an invoice',
    description:
      'Update an existing invoice. If items are provided, they will replace all existing items and the total will be recalculated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Invoice updated successfully',
    schema: {
      example: {
        id: 1,
        clientName: 'John Doe Updated',
        clientEmail: 'john.updated@example.com',
        total: 399.96,
        issuedAt: '2024-01-15T10:30:00.000Z',
        items: [
          {
            id: 3,
            productId: 1,
            quantity: 3,
            unitPrice: 49.99,
            description: 'Premium Product (SKU: PROD-001)',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Invoice not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Invoice with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invoice must have at least one item',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: UpdateInvoiceDto,
    description: 'Updated invoice data (all fields are optional)',
    examples: {
      'Update Client Info': {
        summary: 'Update only client information',
        value: {
          clientName: 'John Doe Updated',
          clientEmail: 'john.updated@example.com',
        },
      },
      'Update Items': {
        summary: 'Update invoice items',
        value: {
          items: [
            {
              productId: 1,
              quantity: 3,
              unitPrice: 49.99,
            },
          ],
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an invoice',
    description: 'Permanently delete an invoice and all its associated items',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Invoice deleted successfully',
    schema: {
      example: {
        message: 'Invoice with ID 1 has been deleted successfully',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Invoice not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Invoice with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.remove(id);
  }
}
