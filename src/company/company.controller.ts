import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@ApiTags('companies')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new company',
    description: 'Creates a new company in the system with the provided information.',
  })
  @ApiBody({
    type: CreateCompanyDto,
    description: 'Company data',
    examples: {
      niletech: {
        summary: 'Niletech Company',
        description: 'Create Niletech company with full details',
        value: {
          name: 'Niletech',
          registrationNumber: 'NILETECH001',
          taxNumber: 'TAX123456789',
          email: 'contact@niletech.com',
          phone: '+1234567890',
          address: '123 Business Street, Tech City',
          city: 'Tech City',
          state: 'Tech State',
          country: 'USA',
          postalCode: '12345',
          website: 'https://niletech.com',
          description: 'Technology solutions and services company',
          currency: 'USD',
          timezone: 'UTC',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: Company,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - company with this registration number or tax number already exists',
  })
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all companies',
    description: 'Retrieves all companies with their basic information and counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of companies retrieved successfully',
    type: [Company],
  })
  async findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a company by ID',
    description: 'Retrieves a specific company with detailed information including employees.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Company found and retrieved successfully',
    type: Company,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async findOne(@Param('id') id: string): Promise<Company> {
    return this.companyService.findOne(+id);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get company statistics',
    description: 'Retrieves comprehensive statistics for a company including employees, payrolls, and proformas.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Company statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        company: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Niletech' },
            isActive: { type: 'boolean', example: true },
          },
        },
        employees: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 25 },
            byStatus: {
              type: 'object',
              example: { ACTIVE: 20, INACTIVE: 3, TERMINATED: 2 },
            },
          },
        },
        payrolls: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 150 },
            totalGrossPay: { type: 'number', example: 125000.50 },
            totalNetPay: { type: 'number', example: 95000.25 },
            byStatus: {
              type: 'object',
              example: { PAID: 140, DRAFT: 8, APPROVED: 2 },
            },
          },
        },
        proformas: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 45 },
            totalValue: { type: 'number', example: 250000.75 },
            byStatus: {
              type: 'object',
              example: { SENT: 20, DRAFT: 15, ACCEPTED: 8, REJECTED: 2 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async getStats(@Param('id') id: string) {
    return this.companyService.getCompanyStats(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a company',
    description: 'Updates an existing company with the provided information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 1,
    type: 'number',
  })
  @ApiBody({
    type: UpdateCompanyDto,
    description: 'Company update data',
    examples: {
      updateContact: {
        summary: 'Update contact information',
        description: 'Update company contact details',
        value: {
          email: 'newemail@niletech.com',
          phone: '+1987654321',
          address: '456 New Business Avenue, Tech City',
        },
      },
      updateStatus: {
        summary: 'Update company status',
        description: 'Activate or deactivate company',
        value: {
          isActive: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: Company,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - company with this registration number or tax number already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companyService.update(+id, updateCompanyDto);
  }

  @Patch(':id/toggle-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle company status',
    description: 'Toggles the active status of a company (active to inactive or vice versa).',
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Company status toggled successfully',
    type: Company,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async toggleStatus(@Param('id') id: string): Promise<Company> {
    return this.companyService.toggleStatus(+id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a company',
    description: 'Permanently deletes a company and all associated data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 204,
    description: 'Company deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.companyService.remove(+id);
  }
}