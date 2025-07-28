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
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payment Methods')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new payment method',
    description:
      'Create a new payment method with name, description, icon, and color for UI display.',
  })
  @ApiCreatedResponse({
    description: 'Payment method created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Cash',
        description: 'Physical cash payments',
        isActive: true,
        icon: '💵',
        color: '#28a745',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        _count: {
          payments: 0,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors or duplicate name',
    schema: {
      example: {
        statusCode: 400,
        message: 'Payment method with name "Cash" already exists',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: CreatePaymentMethodDto,
    description: 'Payment method data',
    examples: {
      'Cash Payment': {
        summary: 'Cash payment method',
        value: {
          name: 'Cash',
          description: 'Physical cash payments',
          icon: '💵',
          color: '#28a745',
        },
      },
      'Bank Transfer': {
        summary: 'Bank transfer method',
        value: {
          name: 'Bank Transfer',
          description: 'Direct bank transfers',
          icon: '🏦',
          color: '#007bff',
        },
      },
      'Credit Card': {
        summary: 'Credit card method',
        value: {
          name: 'Credit Card',
          description: 'Credit card payments',
          icon: '💳',
          color: '#6f42c1',
        },
      },
      'Mobile Money': {
        summary: 'Mobile money method',
        value: {
          name: 'Mobile Money',
          description: 'Mobile money transfers',
          icon: '📱',
          color: '#20c997',
        },
      },
    },
  })
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(createPaymentMethodDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all payment methods',
    description: 'Retrieve all payment methods with their usage statistics',
  })
  @ApiOkResponse({
    description: 'List of payment methods retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          name: 'Cash',
          description: 'Physical cash payments',
          isActive: true,
          icon: '💵',
          color: '#28a745',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          _count: {
            payments: 25,
          },
        },
        {
          id: 2,
          name: 'Bank Transfer',
          description: 'Direct bank transfers',
          isActive: true,
          icon: '🏦',
          color: '#007bff',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          _count: {
            payments: 15,
          },
        },
      ],
    },
  })
  findAll() {
    return this.paymentMethodService.findAll();
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active payment methods',
    description:
      'Retrieve only active payment methods for use in payment forms',
  })
  @ApiOkResponse({
    description: 'Active payment methods retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          name: 'Cash',
          description: 'Physical cash payments',
          isActive: true,
          icon: '💵',
          color: '#28a745',
          _count: {
            payments: 25,
          },
        },
      ],
    },
  })
  findActive() {
    return this.paymentMethodService.findActive();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get payment method statistics',
    description:
      'Retrieve payment method statistics including total count, active count, and popular methods',
  })
  @ApiOkResponse({
    description: 'Payment method statistics retrieved successfully',
    schema: {
      example: {
        totalMethods: 6,
        activeMethods: 5,
        popularMethods: [
          {
            id: 1,
            name: 'Cash',
            description: 'Physical cash payments',
            icon: '💵',
            color: '#28a745',
            _count: {
              payments: 25,
            },
          },
        ],
      },
    },
  })
  getStats() {
    return this.paymentMethodService.getPaymentMethodStats();
  }

  @Post('seed')
  @ApiOperation({
    summary: 'Seed default payment methods',
    description:
      "Create default payment methods (Cash, Bank Transfer, Credit Card, etc.) if they don't exist",
  })
  @ApiOkResponse({
    description: 'Default payment methods seeded successfully',
    schema: {
      example: {
        message: 'Successfully seeded 6 default payment methods',
        methods: [
          {
            id: 1,
            name: 'Cash',
            description: 'Physical cash payments',
            icon: '💵',
            color: '#28a745',
            isActive: true,
          },
        ],
      },
    },
  })
  seedDefaultMethods() {
    return this.paymentMethodService.seedDefaultPaymentMethods();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a payment method by ID',
    description:
      'Retrieve a specific payment method with its recent payments and usage statistics',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment method ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Payment method found and retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'Cash',
        description: 'Physical cash payments',
        isActive: true,
        icon: '💵',
        color: '#28a745',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
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
        _count: {
          payments: 25,
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a payment method',
    description: 'Update an existing payment method. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment method ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Payment method updated successfully',
    schema: {
      example: {
        id: 1,
        name: 'Cash Payment',
        description: 'Updated description for cash payments',
        isActive: true,
        icon: '💵',
        color: '#28a745',
        updatedAt: '2024-01-15T10:30:00.000Z',
        _count: {
          payments: 25,
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
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors or duplicate name',
    schema: {
      example: {
        statusCode: 400,
        message: 'Payment method with name "Cash" already exists',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: UpdatePaymentMethodDto,
    description: 'Updated payment method data (all fields are optional)',
    examples: {
      'Update Name': {
        summary: 'Update payment method name',
        value: {
          name: 'Cash Payment',
        },
      },
      'Update Description': {
        summary: 'Update description only',
        value: {
          description: 'Updated description for cash payments',
        },
      },
      'Deactivate Method': {
        summary: 'Deactivate payment method',
        value: {
          isActive: false,
        },
      },
      'Update Icon and Color': {
        summary: 'Update visual properties',
        value: {
          icon: '💰',
          color: '#ffc107',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodService.update(id, updatePaymentMethodDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a payment method',
    description:
      'Permanently delete a payment method. Cannot delete if it has associated payments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment method ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Payment method deleted successfully',
    schema: {
      example: {
        message: 'Payment method "Cash" has been deleted successfully',
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
  @ApiBadRequestResponse({
    description: 'Bad request - payment method is in use',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Cannot delete payment method "Cash" as it is being used by 25 payment(s)',
        error: 'Bad Request',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodService.remove(id);
  }
}
