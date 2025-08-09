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
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('service')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get service statistics' })
  @ApiResponse({ status: 200, description: 'Service statistics' })
  getStats() {
    return this.serviceService.getServiceStats();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new service',
    description:
      'Creates a new service with the provided details. Service code will be auto-generated if not provided.',
  })
  @ApiBody({
    type: CreateServiceDto,
    description: 'Service creation data',
    examples: {
      webDevelopment: {
        summary: 'Web Development Service',
        value: {
          name: 'Web Development',
          categoryId: 1,
          description:
            'Professional web development services including frontend and backend development',
          price: 1500.0,
          isActive: true,
          duration: 40,
          requirements: 'Client must provide design mockups and content',
          warrantyDays: 30,
          expense: 800.0,
          taxId: 1,
        },
      },
      consulting: {
        summary: 'IT Consulting Service',
        value: {
          name: 'IT Consulting',
          categoryId: 2,
          description: 'Strategic IT consulting and planning services',
          price: 200.0,
          isActive: true,
          duration: 2,
          requirements: 'Client must provide current system overview',
          warrantyDays: 0,
          expense: 150.0,
          taxId: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: Service,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Service with same name or code already exists',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all services',
    description:
      'Retrieves all services with their category information and usage statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all services',
    type: [Service],
  })
  findAll() {
    return this.serviceService.findAll();
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active services',
    description: 'Retrieves all active services',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active services',
    type: [Service],
  })
  findActiveServices() {
    return this.serviceService.findActiveServices();
  }

  @Get(':categoryId')
  @ApiOperation({
    summary: 'Get services by category',
    description: 'Retrieves all services for a specific category',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'List of services in the category',
    type: [Service],
  })
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.serviceService.findByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific service',
    description: 'Retrieves a specific service by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Service ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Service found',
    type: Service,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a service',
    description: 'Updates an existing service with the provided data',
  })
  @ApiParam({
    name: 'id',
    description: 'Service ID',
    type: 'number',
  })
  @ApiBody({
    type: UpdateServiceDto,
    description: 'Service update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: Service,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Service with same name or code already exists',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a service',
    description: 'Deletes a service by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Service ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Service deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.remove(id);
  }

  @Get('check-name/:name')
  @ApiOperation({
    summary: 'Check if service name exists',
    description: 'Checks if a service name is already taken',
  })
  @ApiParam({
    name: 'name',
    description: 'Service name to check',
  })
  @ApiQuery({
    name: 'excludeId',
    description: 'Service ID to exclude from check',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Name availability status',
  })
  async checkNameExists(
    @Param('name') name: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const exists = await this.serviceService.checkNameExists(
      name,
      excludeId ? +excludeId : undefined,
    );
    return {
      name,
      exists,
      available: !exists,
      message: exists ? 'Name already taken' : 'Name is available',
    };
  }

  @Get('check-code/:serviceCode')
  @ApiOperation({
    summary: 'Check if service code exists',
    description: 'Checks if a service code is already taken',
  })
  @ApiParam({
    name: 'serviceCode',
    description: 'Service code to check',
  })
  @ApiQuery({
    name: 'excludeId',
    description: 'Service ID to exclude from check',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Service code availability status',
  })
  async checkServiceCodeExists(
    @Param('serviceCode') serviceCode: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const exists = await this.serviceService.checkServiceCodeExists(
      serviceCode,
      excludeId ? parseInt(excludeId) : undefined,
    );
    return {
      exists,
      message: exists
        ? 'Service code already exists'
        : 'Service code is available',
    };
  }
}
