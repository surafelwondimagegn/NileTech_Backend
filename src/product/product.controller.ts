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
  UseInterceptors,
  UploadedFile,
  Req,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
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
import { Request } from 'express';
import { ValidationPipe } from '@nestjs/common';

@ApiTags('product')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // Allow extra properties for FormData
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    skipMissingProperties: true,
    skipNullProperties: true,
    skipUndefinedProperties: true,
    validateCustomDecorators: false, // Disable custom decorator validation for FormData
    stopAtFirstError: false, // Continue validation to show all errors
    exceptionFactory: (errors) => {
      // Ensure validation errors are returned as proper JSON
      const messages = errors.map(error => {
        const constraints = error.constraints;
        if (constraints) {
          return Object.values(constraints).join(', ');
        }
        return `${error.property} is invalid`;
      });
      return new BadRequestException({
        statusCode: 400,
        message: messages.join('; '),
        error: 'Validation failed',
        details: errors
      });
    }
  }))
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Check file type
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(new BadRequestException('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        cb(new BadRequestException('File size must be less than 10MB!'), false);
        return;
      }
      
      cb(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit (increased from 5MB)
      files: 1, // Only allow 1 file
    },
  }))
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Create a new product with comprehensive budget management. If budgetId is provided, the system will validate budget availability, deduct costs, and track budget history. If no budget is assigned, the product will be created without budget validation.',
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
        minStockLevel: 5,
        maxStockLevel: 100,
        location: 'Warehouse A, Shelf B3',
        tags: 'laptop, premium, business, portable',
        sku: 'NP-001', // Auto-generated
        weight: 1.5,
        image: '/uploads/products/laptop_dell_xps_13.jpg',
        isActive: true,
        category: {
          id: 1,
          name: 'Electronics',
        },
        supplier: {
          id: 1,
          name: 'Dell Technologies',
          email: 'support@dell.com',
          phone: '+1-800-999-3355',
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
          'Insufficient budget for stock increase. Required: 2000, Available: 1000',
          'Insufficient budget for price increase. Required: 1500, Available: 800',
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
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
    @Req() request?: Request,
  ) {
    try {
      console.log('Product creation request received:', {
        hasImage: !!image,
        imageSize: image?.size,
        imageType: image?.mimetype,
        imageName: image?.originalname,
        productData: createProductDto,
        bodyType: typeof createProductDto,
        bodyKeys: Object.keys(createProductDto || {}),
        contentType: request?.headers['content-type'],
        rawBody: request?.body,
        bodyKeys: request?.body ? Object.keys(request.body) : [],
        bodyValues: request?.body ? Object.values(request.body) : [],
        validationErrors: null, // Will be populated if validation fails
      });

      // Handle case where DTO is empty or undefined (common with multipart)
      if (!createProductDto || Object.keys(createProductDto).length === 0) {
        // Try to extract data from request body for FormData
        const body = request?.body;
        console.log('Raw request body:', body);
        console.log('Request body type:', typeof body);
        console.log('Request body keys:', body ? Object.keys(body) : []);
        console.log('Request body values:', body ? Object.values(body) : []);
        
        if (body && typeof body === 'object') {
          // Create DTO from request body for FormData
          createProductDto = {
            name: body.name || '',
            description: body.description || '',
            buyingPrice: body.buyingPrice ? parseFloat(body.buyingPrice) : 0,
            sellingPrice: body.sellingPrice ? parseFloat(body.sellingPrice) : 0,
            stock: body.stock ? parseInt(body.stock) : 0,
            minStockLevel: body.minStockLevel ? parseInt(body.minStockLevel) : undefined,
            maxStockLevel: body.maxStockLevel ? parseInt(body.maxStockLevel) : undefined,
            categoryId: body.categoryId ? parseInt(body.categoryId) : undefined,
            supplierId: body.supplierId ? parseInt(body.supplierId) : undefined,
            budgetId: body.budgetId ? parseInt(body.budgetId) : undefined,
            taxId: body.taxId ? parseInt(body.taxId) : undefined,
            weight: body.weight ? parseFloat(body.weight) : undefined,
            brand: body.brand || undefined,
            model: body.model || undefined,
            quality: body.quality || 'BRAND_NEW',
            condition: body.condition || undefined,
            warranty: body.warranty ? parseInt(body.warranty) : undefined,
            location: body.location || undefined,
            tags: body.tags || undefined,
            isActive: body.isActive === 'true' || body.isActive === true
          };
          console.log('Created DTO from FormData:', createProductDto);
        } else {
          console.log('No valid body found, throwing error');
          throw new BadRequestException('Product data is required');
        }
      }

      // Validate required fields
      if (!createProductDto.name) {
        throw new BadRequestException('Product name is required');
      }
      if (!createProductDto.buyingPrice || createProductDto.buyingPrice <= 0) {
        throw new BadRequestException('Buying price must be greater than 0');
      }
      if (!createProductDto.sellingPrice || createProductDto.sellingPrice <= 0) {
        throw new BadRequestException('Selling price must be greater than 0');
      }
      if (createProductDto.sellingPrice <= createProductDto.buyingPrice) {
        throw new BadRequestException('Selling price must be greater than buying price');
      }
      if (createProductDto.stock < 0) {
        throw new BadRequestException('Stock cannot be negative');
      }

      // If image is uploaded, update the DTO with the file path
      if (image) {
        const filePath = `/uploads/products/${image.filename}`;
        createProductDto.image = filePath;
        console.log('Image uploaded successfully:', filePath);
      }
      
      const result = this.productService.create(createProductDto);
      console.log('Product created successfully');
      return result;
    } catch (error) {
      console.error('Error in product creation:', error);
      
      // Ensure we return a proper BadRequestException with JSON response
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // For any other error, wrap it in a BadRequestException with proper JSON structure
      const errorMessage = error.message || 'Failed to create product. Please check your input and try again.';
      throw new BadRequestException({
        statusCode: 400,
        message: errorMessage,
        error: 'Product creation failed',
        timestamp: new Date().toISOString(),
        path: '/api/v1/product'
      });
    }
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

  @Get('stats')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiResponse({ status: 200, description: 'Product statistics' })
  getProductStats() {
    return this.productService.getProductStats();
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'List of products in the category' })
  getProductsByCategory(@Param('categoryId') categoryId: string) {
    return this.productService.getProductsByCategory(+categoryId);
  }

  @Get('budget/:budgetId')
  @ApiOperation({ summary: 'Get products by budget' })
  @ApiParam({ name: 'budgetId', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'List of products in the budget' })
  getProductsByBudget(@Param('budgetId') budgetId: string) {
    return this.productService.getProductsByBudget(+budgetId);
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
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Check file type
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(new BadRequestException('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        cb(new BadRequestException('File size must be less than 10MB!'), false);
        return;
      }
      
      cb(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit (increased from 5MB)
      files: 1, // Only allow 1 file
    },
  }))
  @ApiOperation({ 
    summary: 'Update a product',
    description: 'Update a product with comprehensive budget management. The system handles budget assignment, stock changes, price changes, and budget transfers with full history tracking. Budget validation only occurs when a budget is assigned to the product.'
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or pricing',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product with SKU already exists' })
  update(
    @Param('id') id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new BadRequestException('Invalid product ID');
    }
    
    try {
      // If image is uploaded, update the DTO with the file path
      if (image) {
        const filePath = `/uploads/products/${image.filename}`;
        updateProductDto.image = filePath;
      }
      
      return this.productService.update(productId, updateProductDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error updating product:', error);
      throw new BadRequestException('Failed to update product. Please check your input and try again.');
    }
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a product',
    description: 'Delete a product. If the product has a budget assigned, the system will refund the budget and track the refund in budget history.'
  })
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
