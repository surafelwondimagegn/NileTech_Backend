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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payment')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new payment',
    description:
      'Create a new payment for an invoice. The system will validate the payment amount and automatically update payment status.',
  })
  @ApiCreatedResponse({
    description: 'Payment created successfully',
    schema: {
      example: {
        id: 1,
        invoiceId: 1,
        methodId: 1,
        amount: 299.97,
        status: 'COMPLETED',
        reference: 'TXN-2024-001',
        notes: 'Payment received via bank transfer',
        paidAt: '2024-01-15T10:30:00.000Z',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        invoice: {
          id: 1,
          clientName: 'John Doe',
          total: 299.97,
        },
        method: {
          id: 1,
          name: 'Bank Transfer',
          icon: '🏦',
          color: '#007bff',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors or business logic violations',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Payment amount (500) exceeds remaining invoice amount (299.97)',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: CreatePaymentDto,
    description: 'Payment data',
    examples: {
      'Full Payment': {
        summary: 'Full payment for an invoice',
        value: {
          invoiceId: 1,
          methodId: 1,
          amount: 299.97,
          reference: 'TXN-2024-001',
          notes: 'Payment received via bank transfer',
        },
      },
      'Partial Payment': {
        summary: 'Partial payment for an invoice',
        value: {
          invoiceId: 1,
          methodId: 2,
          amount: 150.0,
          reference: 'CASH-001',
          notes: 'Partial cash payment',
        },
      },
      'Cash Payment': {
        summary: 'Simple cash payment',
        value: {
          invoiceId: 1,
          methodId: 1,
          amount: 299.97,
        },
      },
    },
  })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all payments',
    description:
      'Retrieve all payments with their associated invoice and payment method details',
  })
  @ApiOkResponse({
    description: 'List of payments retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          invoiceId: 1,
          methodId: 1,
          amount: 299.97,
          status: 'COMPLETED',
          reference: 'TXN-2024-001',
          paidAt: '2024-01-15T10:30:00.000Z',
          invoice: {
            id: 1,
            clientName: 'John Doe',
            total: 299.97,
          },
          method: {
            id: 1,
            name: 'Bank Transfer',
            icon: '🏦',
            color: '#007bff',
          },
        },
      ],
    },
  })
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get payment statistics',
    description:
      'Retrieve payment statistics including total count, total amount, recent payments, and status breakdown',
  })
  @ApiOkResponse({
    description: 'Payment statistics retrieved successfully',
    schema: {
      example: {
        totalPayments: 25,
        totalAmount: 7500.5,
        recentPayments: [
          {
            id: 1,
            amount: 299.97,
            status: 'COMPLETED',
            paidAt: '2024-01-15T10:30:00.000Z',
            invoice: {
              id: 1,
              clientName: 'John Doe',
            },
            method: {
              name: 'Bank Transfer',
              icon: '🏦',
            },
          },
        ],
        statusBreakdown: [
          {
            status: 'COMPLETED',
            count: 20,
            totalAmount: 6000.0,
          },
          {
            status: 'PENDING',
            count: 5,
            totalAmount: 1500.5,
          },
        ],
      },
    },
  })
  getStats() {
    return this.paymentService.getPaymentStats();
  }

  @Get('invoice/:invoiceId')
  @ApiOperation({
    summary: 'Get payments for a specific invoice',
    description:
      'Retrieve all payments for a specific invoice with payment summary',
  })
  @ApiParam({
    name: 'invoiceId',
    description: 'Invoice ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Invoice payments retrieved successfully',
    schema: {
      example: {
        invoice: {
          id: 1,
          clientName: 'John Doe',
          total: 299.97,
        },
        payments: [
          {
            id: 1,
            amount: 299.97,
            status: 'COMPLETED',
            paidAt: '2024-01-15T10:30:00.000Z',
            method: {
              id: 1,
              name: 'Bank Transfer',
              icon: '🏦',
              color: '#007bff',
            },
          },
        ],
        summary: {
          totalPaid: 299.97,
          remainingAmount: 0,
          isFullyPaid: true,
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
  findByInvoice(@Param('invoiceId', ParseIntPipe) invoiceId: number) {
    return this.paymentService.findByInvoice(invoiceId);
  }

  @Get('method/:methodId')
  @ApiOperation({
    summary: 'Get payments by payment method',
    description:
      'Retrieve all payments for a specific payment method with summary statistics',
  })
  @ApiParam({
    name: 'methodId',
    description: 'Payment method ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Payments by method retrieved successfully',
    schema: {
      example: {
        paymentMethod: {
          id: 1,
          name: 'Bank Transfer',
          icon: '🏦',
          color: '#007bff',
        },
        payments: [
          {
            id: 1,
            amount: 299.97,
            status: 'COMPLETED',
            paidAt: '2024-01-15T10:30:00.000Z',
            invoice: {
              id: 1,
              clientName: 'John Doe',
              total: 299.97,
            },
          },
        ],
        summary: {
          totalPayments: 15,
          totalAmount: 4500.0,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Payment method not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Payment method with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  findByMethod(@Param('methodId', ParseIntPipe) methodId: number) {
    return this.paymentService.getPaymentsByMethod(methodId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a payment by ID',
    description:
      'Retrieve a specific payment with detailed invoice and payment method information',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Payment found and retrieved successfully',
    schema: {
      example: {
        id: 1,
        invoiceId: 1,
        methodId: 1,
        amount: 299.97,
        status: 'COMPLETED',
        reference: 'TXN-2024-001',
        notes: 'Payment received via bank transfer',
        paidAt: '2024-01-15T10:30:00.000Z',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        invoice: {
          id: 1,
          clientName: 'John Doe',
          total: 299.97,
          clientEmail: 'john.doe@example.com',
          clientPhone: '+1234567890',
        },
        method: {
          id: 1,
          name: 'Bank Transfer',
          description: 'Direct bank transfers',
          icon: '🏦',
          color: '#007bff',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Payment with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a payment',
    description:
      'Update an existing payment. All fields are optional. The system will validate payment amounts.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Payment updated successfully',
    schema: {
      example: {
        id: 1,
        invoiceId: 1,
        methodId: 1,
        amount: 299.97,
        status: 'COMPLETED',
        reference: 'TXN-2024-UPDATED',
        notes: 'Updated payment notes',
        paidAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        invoice: {
          id: 1,
          clientName: 'John Doe',
          total: 299.97,
        },
        method: {
          id: 1,
          name: 'Bank Transfer',
          icon: '🏦',
          color: '#007bff',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Payment with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors or business logic violations',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Payment amount (500) exceeds remaining invoice amount (299.97)',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: UpdatePaymentDto,
    description: 'Updated payment data (all fields are optional)',
    examples: {
      'Update Amount': {
        summary: 'Update payment amount',
        value: {
          amount: 250.0,
        },
      },
      'Update Status': {
        summary: 'Update payment status',
        value: {
          status: 'COMPLETED',
        },
      },
      'Update Reference': {
        summary: 'Update payment reference',
        value: {
          reference: 'TXN-2024-UPDATED',
        },
      },
      'Update Notes': {
        summary: 'Update payment notes',
        value: {
          notes: 'Updated payment notes',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a payment',
    description: 'Permanently delete a payment',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Payment deleted successfully',
    schema: {
      example: {
        message: 'Payment with ID 1 has been deleted successfully',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Payment with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.remove(id);
  }
}
