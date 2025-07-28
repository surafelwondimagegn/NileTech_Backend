import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { SoldProductService } from './sold-product.service';
import { CreateSoldProductDto } from './dto/create-sold-product.dto';
import { UpdateSoldProductDto } from './dto/update-sold-product.dto';
import { SoldProductResponseDto } from './dto/sold-product-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sold Products')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sold-products')
export class SoldProductController {
  constructor(private readonly soldProductService: SoldProductService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new sold product record',
    description:
      'Sell a product, update stock, and create revenue/profit records',
  })
  @ApiResponse({
    status: 201,
    description: 'Product sold successfully',
    type: SoldProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient stock or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  create(
    @Body() createSoldProductDto: CreateSoldProductDto,
  ): Promise<SoldProductResponseDto> {
    return this.soldProductService.create(createSoldProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all sold products',
    description: 'Retrieve all sold product records with product details',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all sold products',
    type: [SoldProductResponseDto],
  })
  findAll(): Promise<SoldProductResponseDto[]> {
    return this.soldProductService.findAll();
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get sales summary',
    description:
      'Get overall sales statistics including total revenue, profit, and quantity sold',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales summary statistics',
    schema: {
      type: 'object',
      properties: {
        totalSales: { type: 'number', example: 150 },
        totalRevenue: { type: 'number', example: 25000.0 },
        totalProfit: { type: 'number', example: 8500.0 },
        totalQuantitySold: { type: 'number', example: 500 },
      },
    },
  })
  getSalesSummary() {
    return this.soldProductService.getSalesSummary();
  }

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Get sales for a specific product',
    description: 'Retrieve all sales records for a particular product',
  })
  @ApiParam({
    name: 'productId',
    description: 'ID of the product',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of sales for the specified product',
    type: [SoldProductResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  getSalesByProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<SoldProductResponseDto[]> {
    return this.soldProductService.getSalesByProduct(productId);
  }

  @Get('date-range')
  @ApiOperation({
    summary: 'Get sales within a date range',
    description: 'Retrieve all sales records within a specified date range',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date (ISO string)',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiResponse({
    status: 200,
    description: 'List of sales within the date range',
    type: [SoldProductResponseDto],
  })
  getSalesByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<SoldProductResponseDto[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.soldProductService.getSalesByDateRange(start, end);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific sold product record',
    description: 'Retrieve a single sold product record by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the sold product record',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sold product record found',
    type: SoldProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sold product record not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SoldProductResponseDto> {
    return this.soldProductService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a sold product record',
    description:
      'Update customer information and notes for a sold product record',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the sold product record',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sold product record updated successfully',
    type: SoldProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sold product record not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSoldProductDto: UpdateSoldProductDto,
  ): Promise<SoldProductResponseDto> {
    return this.soldProductService.update(id, updateSoldProductDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a sold product record',
    description: 'Delete a sold product record and restore product stock',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the sold product record',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Sold product record deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Sold product record not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.soldProductService.remove(id);
  }
}
