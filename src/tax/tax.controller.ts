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
  Query,
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
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { CreateTaxDto, TaxType } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tax')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new tax',
    description:
      'Create a new tax with percentage or fixed amount rate. Only one tax can be set as default.',
  })
  @ApiCreatedResponse({
    description: 'Tax created successfully',
    schema: {
      example: {
        id: 1,
        name: 'VAT',
        description: 'Value Added Tax at 15%',
        rate: 15.0,
        type: 'PERCENTAGE',
        isActive: true,
        isDefault: false,
        country: 'US',
        state: 'CA',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors or invalid data',
    schema: {
      example: {
        statusCode: 400,
        message: 'Percentage tax rate cannot exceed 100%',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: CreateTaxDto,
    description: 'Tax data',
    examples: {
      'Percentage Tax': {
        summary: 'Create percentage-based tax',
        value: {
          name: 'VAT',
          description: 'Value Added Tax at 15%',
          rate: 15.0,
          type: 'PERCENTAGE',
          isActive: true,
          isDefault: false,
          country: 'US',
          state: 'CA',
        },
      },
      'Fixed Amount Tax': {
        summary: 'Create fixed amount tax',
        value: {
          name: 'Shipping Tax',
          description: 'Fixed shipping tax',
          rate: 5.0,
          type: 'FIXED_AMOUNT',
          isActive: true,
          isDefault: false,
        },
      },
      'Default Tax': {
        summary: 'Create default tax',
        value: {
          name: 'Standard Tax',
          description: 'Default tax for all transactions',
          rate: 10.0,
          type: 'PERCENTAGE',
          isActive: true,
          isDefault: true,
        },
      },
    },
  })
  create(@Body() createTaxDto: CreateTaxDto) {
    return this.taxService.create(createTaxDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all taxes',
    description: 'Retrieve all taxes, ordered by default status and name',
  })
  @ApiOkResponse({
    description: 'List of taxes retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          name: 'Standard Tax',
          description: 'Default tax for all transactions',
          rate: 10.0,
          type: 'PERCENTAGE',
          isActive: true,
          isDefault: true,
          country: null,
          state: null,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        {
          id: 2,
          name: 'VAT',
          description: 'Value Added Tax at 15%',
          rate: 15.0,
          type: 'PERCENTAGE',
          isActive: true,
          isDefault: false,
          country: 'US',
          state: 'CA',
          createdAt: '2024-01-15T10:35:00.000Z',
          updatedAt: '2024-01-15T10:35:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.taxService.findAll();
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active taxes',
    description:
      'Retrieve only active taxes, ordered by default status and name',
  })
  @ApiOkResponse({
    description: 'List of active taxes retrieved successfully',
  })
  findActive() {
    return this.taxService.findActive();
  }

  @Get('default')
  @ApiOperation({
    summary: 'Get default tax',
    description: 'Retrieve the current default tax for the system',
  })
  @ApiOkResponse({
    description: 'Default tax retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'Standard Tax',
        description: 'Default tax for all transactions',
        rate: 10.0,
        type: 'PERCENTAGE',
        isActive: true,
        isDefault: true,
        country: null,
        state: null,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'No default tax found',
    schema: {
      example: {
        statusCode: 404,
        message: 'No default tax found',
        error: 'Not Found',
      },
    },
  })
  findDefault() {
    return this.taxService.findDefault();
  }

  @Get('calculate')
  @ApiOperation({
    summary: 'Calculate tax amount',
    description: 'Calculate tax amount for a given amount and optional tax ID',
  })
  @ApiQuery({
    name: 'amount',
    description: 'Amount to calculate tax for',
    example: 100.0,
    type: Number,
  })
  @ApiQuery({
    name: 'taxId',
    description: 'Tax ID (optional - uses default if not provided)',
    example: 1,
    type: Number,
    required: false,
  })
  @ApiOkResponse({
    description: 'Tax calculation completed',
    schema: {
      example: {
        taxAmount: 15.0,
        taxRate: 15.0,
        taxName: 'VAT',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid tax or amount',
    schema: {
      example: {
        statusCode: 400,
        message: 'Tax "VAT" is not active',
        error: 'Bad Request',
      },
    },
  })
  calculateTax(
    @Query('amount') amount: number,
    @Query('taxId') taxId?: number,
  ) {
    return this.taxService.calculateTax(amount, taxId);
  }

  @Get('accumulation')
  @ApiOperation({
    summary: 'Get tax accumulation reports',
    description: 'Retrieve tax accumulation data with optional filters',
  })
  @ApiQuery({
    name: 'taxId',
    description: 'Filter by specific tax ID',
    example: 1,
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'year',
    description: 'Filter by year',
    example: 2024,
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'month',
    description: 'Filter by month (1-12)',
    example: 1,
    type: Number,
    required: false,
  })
  @ApiOkResponse({
    description: 'Tax accumulation data retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          taxId: 1,
          month: 1,
          year: 2024,
          totalTax: 1500.0,
          totalSales: 10000.0,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          tax: {
            id: 1,
            name: 'VAT',
            rate: 15.0,
            type: 'PERCENTAGE',
          },
        },
      ],
    },
  })
  getTaxAccumulation(
    @Query('taxId') taxId?: number,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.taxService.getTaxAccumulation(taxId, year, month);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get tax statistics',
    description:
      'Retrieve comprehensive tax statistics including current month accumulation',
  })
  @ApiOkResponse({
    description: 'Tax statistics retrieved successfully',
    schema: {
      example: {
        totalTaxes: 3,
        activeTaxes: 2,
        defaultTax: {
          id: 1,
          name: 'Standard Tax',
          rate: 10.0,
          type: 'PERCENTAGE',
        },
        currentMonth: {
          month: 1,
          year: 2024,
          totalTax: 1500.0,
          totalSales: 10000.0,
          breakdown: [
            {
              id: 1,
              taxId: 1,
              month: 1,
              year: 2024,
              totalTax: 1500.0,
              totalSales: 10000.0,
              tax: {
                name: 'VAT',
                rate: 15.0,
                type: 'PERCENTAGE',
              },
            },
          ],
        },
      },
    },
  })
  getTaxStats() {
    return this.taxService.getTaxStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a tax by ID',
    description: 'Retrieve a specific tax by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Tax ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Tax found and retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'VAT',
        description: 'Value Added Tax at 15%',
        rate: 15.0,
        type: 'PERCENTAGE',
        isActive: true,
        isDefault: false,
        country: 'US',
        state: 'CA',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Tax not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Tax with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taxService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a tax',
    description:
      'Update an existing tax. If setting as default, other defaults will be unset.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tax ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Tax updated successfully',
    schema: {
      example: {
        id: 1,
        name: 'VAT Updated',
        description: 'Updated Value Added Tax at 15%',
        rate: 15.0,
        type: 'PERCENTAGE',
        isActive: true,
        isDefault: true,
        country: 'US',
        state: 'CA',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:35:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Tax not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Tax with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: 'Percentage tax rate cannot exceed 100%',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: UpdateTaxDto,
    description: 'Updated tax data (all fields are optional)',
    examples: {
      'Update Rate': {
        summary: 'Update tax rate',
        value: {
          rate: 20.0,
        },
      },
      'Set as Default': {
        summary: 'Set tax as default',
        value: {
          isDefault: true,
        },
      },
      'Update Name and Description': {
        summary: 'Update tax name and description',
        value: {
          name: 'Updated VAT',
          description: 'Updated Value Added Tax',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaxDto: UpdateTaxDto,
  ) {
    return this.taxService.update(id, updateTaxDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a tax',
    description:
      'Permanently delete a tax. Cannot delete if it is being used by products, services, or transactions.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tax ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Tax deleted successfully',
    schema: {
      example: {
        message: 'Tax with ID 1 has been deleted successfully',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Tax not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Tax with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Cannot delete tax - in use',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Cannot delete tax. It is being used by 5 products, 2 services, 10 sold products, and 15 invoice items.',
        error: 'Bad Request',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.taxService.remove(id);
  }
}
