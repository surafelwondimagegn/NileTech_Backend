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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('supplier')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new supplier',
    description: 'Create a new supplier with contact information and notes',
  })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Dell Technologies',
        email: 'contact@dell.com',
        phone: '+1-800-999-3355',
        address: 'One Dell Way, Round Rock, TX 78682',
        website: 'https://www.dell.com',
        contactPerson: 'John Smith',
        notes: 'Preferred supplier for laptops and accessories',
        isActive: true,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data',
  })
  @ApiResponse({
    status: 409,
    description: 'Supplier with name already exists',
  })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'List of all suppliers' })
  findAll() {
    return this.supplierService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active suppliers' })
  @ApiResponse({ status: 200, description: 'List of active suppliers' })
  getActiveSuppliers() {
    return this.supplierService.getActiveSuppliers();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get supplier statistics' })
  @ApiResponse({ status: 200, description: 'Supplier statistics' })
  getStats() {
    return this.supplierService.getStats();
  }

  @Get('check-name')
  @ApiOperation({ summary: 'Check if supplier name exists' })
  @ApiResponse({ status: 200, description: 'Name availability status' })
  checkNameExists(@Query('name') name: string, @Query('excludeId') excludeId?: string) {
    const excludeIdNumber = excludeId ? +excludeId : undefined;
    return this.supplierService.checkNameExists(name, excludeIdNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific supplier by ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier found' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data',
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 409, description: 'Supplier with name already exists' })
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete supplier as it is referenced by products',
  })
  remove(@Param('id') id: string) {
    return this.supplierService.remove(+id);
  }
} 