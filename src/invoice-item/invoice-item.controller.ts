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
import { InvoiceItemService } from './invoice-item.service';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('invoice-item')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('invoice-items')
export class InvoiceItemController {
  constructor(private readonly invoiceItemService: InvoiceItemService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new invoice item',
    description:
      'Create a new invoice item with either a product or service. The item will be associated with an invoice.',
  })
  @ApiCreatedResponse({
    description: 'Invoice item created successfully',
    schema: {
      example: {
        id: 1,
        invoiceId: 1,
        productId: 1,
        serviceId: null,
        quantity: 2,
        unitPrice: 49.99,
        description: 'Premium Product (SKU: PROD-001)',
        invoice: {
          id: 1,
          clientName: 'John Doe',
          total: 349.97,
        },
        product: {
          id: 1,
          name: 'Premium Product',
          sellingPrice: 49.99,
          sku: 'PROD-001',
        },
        service: null,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invoice item must have either productId or serviceId',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: CreateInvoiceItemDto,
    description: 'Invoice item data',
    examples: {
      'Product Item': {
        summary: 'Invoice item with product',
        value: {
          invoiceId: 1,
          productId: 1,
          quantity: 2,
          unitPrice: 49.99,
          description: 'Premium product with warranty',
        },
      },
      'Service Item': {
        summary: 'Invoice item with service',
        value: {
          invoiceId: 1,
          serviceId: 1,
          quantity: 1,
          unitPrice: 199.99,
          description: 'Professional consultation service',
        },
      },
    },
  })
  create(@Body() createInvoiceItemDto: CreateInvoiceItemDto) {
    return this.invoiceItemService.create(createInvoiceItemDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all invoice items',
    description:
      'Retrieve all invoice items with their associated invoice, product, and service details',
  })
  @ApiOkResponse({
    description: 'List of invoice items retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          invoiceId: 1,
          productId: 1,
          serviceId: null,
          quantity: 2,
          unitPrice: 49.99,
          description: 'Premium Product (SKU: PROD-001)',
          invoice: {
            id: 1,
            clientName: 'John Doe',
            total: 349.97,
          },
          product: {
            id: 1,
            name: 'Premium Product',
            sellingPrice: 49.99,
            sku: 'PROD-001',
          },
          service: null,
        },
      ],
    },
  })
  findAll() {
    return this.invoiceItemService.findAll();
  }

  @Get('invoice/:invoiceId')
  @ApiOperation({
    summary: 'Get all items for a specific invoice',
    description:
      'Retrieve all invoice items associated with a specific invoice',
  })
  @ApiParam({
    name: 'invoiceId',
    description: 'Invoice ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Invoice items retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          invoiceId: 1,
          productId: 1,
          quantity: 2,
          unitPrice: 49.99,
          description: 'Premium Product (SKU: PROD-001)',
          product: {
            id: 1,
            name: 'Premium Product',
            sellingPrice: 49.99,
            sku: 'PROD-001',
          },
          service: null,
        },
      ],
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
  findByInvoice(@Param('invoiceId', ParseIntPipe) invoiceId: number) {
    return this.invoiceItemService.findByInvoice(invoiceId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an invoice item by ID',
    description: 'Retrieve a specific invoice item with all its details',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice item ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Invoice item found and retrieved successfully',
    schema: {
      example: {
        id: 1,
        invoiceId: 1,
        productId: 1,
        serviceId: null,
        quantity: 2,
        unitPrice: 49.99,
        description: 'Premium Product (SKU: PROD-001)',
        invoice: {
          id: 1,
          clientName: 'John Doe',
          total: 349.97,
        },
        product: {
          id: 1,
          name: 'Premium Product',
          sellingPrice: 49.99,
          sku: 'PROD-001',
        },
        service: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Invoice item not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Invoice item with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceItemService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an invoice item',
    description: 'Update an existing invoice item. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice item ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Invoice item updated successfully',
    schema: {
      example: {
        id: 1,
        invoiceId: 1,
        productId: 1,
        serviceId: null,
        quantity: 3,
        unitPrice: 49.99,
        description: 'Updated description',
        invoice: {
          id: 1,
          clientName: 'John Doe',
          total: 349.97,
        },
        product: {
          id: 1,
          name: 'Premium Product',
          sellingPrice: 49.99,
          sku: 'PROD-001',
        },
        service: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Invoice item not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Invoice item with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invoice item must have either productId or serviceId',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: UpdateInvoiceItemDto,
    description: 'Updated invoice item data (all fields are optional)',
    examples: {
      'Update Quantity': {
        summary: 'Update quantity and unit price',
        value: {
          quantity: 3,
          unitPrice: 49.99,
        },
      },
      'Update Description': {
        summary: 'Update description only',
        value: {
          description: 'Updated product description',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceItemDto: UpdateInvoiceItemDto,
  ) {
    return this.invoiceItemService.update(id, updateInvoiceItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an invoice item',
    description: 'Permanently delete an invoice item',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice item ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Invoice item deleted successfully',
    schema: {
      example: {
        message: 'Invoice item with ID 1 has been deleted successfully',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Invoice item not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Invoice item with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceItemService.remove(id);
  }
}
