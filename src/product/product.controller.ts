import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or insufficient budget' })
  @ApiResponse({ status: 404, description: 'Budget or category not found' })
  @ApiResponse({ status: 409, description: 'Product with SKU or barcode already exists' })
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
      message: exists ? 'SKU already taken' : 'SKU is available'
    };
  }

  @Get('check-barcode/:barcode')
  @ApiOperation({ summary: 'Check if product barcode exists' })
  @ApiParam({ name: 'barcode', description: 'Product barcode to check' })
  @ApiResponse({ status: 200, description: 'Barcode availability status' })
  async checkBarcodeExists(@Param('barcode') barcode: string) {
    const exists = await this.productService.checkBarcodeExists(barcode);
    return { 
      barcode, 
      exists, 
      available: !exists,
      message: exists ? 'Barcode already taken' : 'Barcode is available'
    };
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiQuery({ name: 'threshold', description: 'Stock threshold (default: 10)', required: false })
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
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or pricing' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product with SKU or barcode already exists' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete product as it is referenced by other entities' })
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
