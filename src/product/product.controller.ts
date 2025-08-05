import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('product')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Create a new product with enhanced fields including brand, quality, warranty, supplier info, and stock management',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Laptop Dell XPS 13',
        description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        buyingPrice: 800,
        sellingPrice: 1200,
        stock: 10,
        brand: 'Dell',
        model: 'XPS 13 9310',
        quality: 'BRAND_NEW',
        condition: 'Excellent condition, barely used',
        warranty: 365,
        supplier: 'Dell Technologies',
        supplierContact: 'support@dell.com, +1-800-999-3355',
        minStockLevel: 5,
        maxStockLevel: 100,
        location: 'Warehouse A, Shelf B3',
        tags: 'laptop, premium, business, portable',
        sku: 'Nile-Prod-1', // Auto-generated
        weight: 1.5,
        isActive: true,
        category: {
          id: 1,
          name: 'Electronics',
        },
        budget: {
          id: 1,
          name: 'Electronics Budget',
          amount: 5000,
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data, pricing, or insufficient budget',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Selling price must be greater than buying price',
          'Insufficient budget. Required: 8000, Available: 5000',
          'Category with ID 999 not found',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Budget or category not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Category with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Product with name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Product with name "Laptop Dell XPS 13" already exists',
        error: 'Conflict',
      },
    },
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of all products' })
  findAll() {
    return this.productService.findAll();
  }

  @Get('check-sku/:sku')
  @ApiOperation({ summary: 'Check if product SKU exists' })
  @ApiParam({ name: 'sku', description: 'Product SKU to check' })
  @ApiResponse({ status: 200, description: 'SKU availability status' })
  async checkSkuExists(@Param('sku') sku: string) {
    const exists = await this.productService.checkSkuExists(sku);
    return {
      sku,
      exists,
      available: !exists,
      message: exists ? 'SKU already taken' : 'SKU is available',
    };
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiQuery({
    name: 'threshold',
    description: 'Stock threshold (default: 10)',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'List of products with low stock' })
  getLowStockProducts(@Query('threshold') threshold?: string) {
    const thresholdNumber = threshold ? parseInt(threshold, 10) : 10;
    return this.productService.getLowStockProducts(thresholdNumber);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'List of products in the category' })
  getProductsByCategory(@Param('categoryId') categoryId: string) {
    return this.productService.getProductsByCategory(+categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new BadRequestException('Invalid product ID');
    }
    return this.productService.findOne(productId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or pricing',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product with SKU already exists' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new BadRequestException('Invalid product ID');
    }
    return this.productService.update(productId, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete product as it is referenced by other entities',
  })
  remove(@Param('id') id: string) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new BadRequestException('Invalid product ID');
    }
    return this.productService.remove(productId);
  }
}
