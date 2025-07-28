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

@ApiTags('Services')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

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
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter services by category ID',
    type: Number,
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter only active services',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: [Service],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
  })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('active') active?: string,
  ) {
    if (categoryId) {
      return this.serviceService.findByCategory(parseInt(categoryId));
    }
    if (active === 'true') {
      return this.serviceService.findActiveServices();
    }
    return this.serviceService.findAll();
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active services only',
    description:
      'Retrieves only active services, useful for client-facing applications',
  })
  @ApiResponse({
    status: 200,
    description: 'Active services retrieved successfully',
    type: [Service],
  })
  findActiveServices() {
    return this.serviceService.findActiveServices();
  }

  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Get services by category',
    description: 'Retrieves all services belonging to a specific category',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID to filter services',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Services by category retrieved successfully',
    type: [Service],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid category ID',
  })
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.serviceService.findByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific service',
    description:
      'Retrieves a specific service by ID with detailed information including related projects',
  })
  @ApiParam({
    name: 'id',
    description: 'Service ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Service retrieved successfully',
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
    description: 'Service ID to update',
    type: Number,
  })
  @ApiBody({
    type: UpdateServiceDto,
    description: 'Service update data',
    examples: {
      updatePrice: {
        summary: 'Update Service Price',
        value: {
          price: 1800.0,
          description: 'Updated description with new features',
        },
      },
      deactivate: {
        summary: 'Deactivate Service',
        value: {
          isActive: false,
        },
      },
    },
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
    description:
      'Deletes a service. Cannot delete if service is referenced by projects or invoice items.',
  })
  @ApiParam({
    name: 'id',
    description: 'Service ID to delete',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Service deleted successfully',
    type: Service,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Cannot delete service as it is referenced by other entities',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.remove(id);
  }

  @Get('check/name/:name')
  @ApiOperation({
    summary: 'Check if service name exists',
    description: 'Checks if a service with the given name already exists',
  })
  @ApiParam({
    name: 'name',
    description: 'Service name to check',
    type: String,
  })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    description: 'Exclude this service ID from the check (useful for updates)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Name availability check completed',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async checkNameExists(
    @Param('name') name: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const exists = await this.serviceService.checkNameExists(
      name,
      excludeId ? parseInt(excludeId) : undefined,
    );
    return {
      exists,
      message: exists
        ? 'Service name already exists'
        : 'Service name is available',
    };
  }

  @Get('check/code/:serviceCode')
  @ApiOperation({
    summary: 'Check if service code exists',
    description: 'Checks if a service with the given code already exists',
  })
  @ApiParam({
    name: 'serviceCode',
    description: 'Service code to check',
    type: String,
  })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    description: 'Exclude this service ID from the check (useful for updates)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Code availability check completed',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
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
