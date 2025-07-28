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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@ApiTags('employees')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new employee',
    description: 'Creates a new employee in the system.',
  })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: Employee,
  })
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all employees',
    description: 'Retrieves all employees, optionally filtered by company.',
  })
  @ApiQuery({
    name: 'companyId',
    description: 'Filter by company ID',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'List of employees retrieved successfully',
    type: [Employee],
  })
  async findAll(@Query('companyId') companyId?: string): Promise<Employee[]> {
    return this.employeeService.findAll(companyId ? +companyId : undefined);
  }

  @Get('company/:companyId')
  @ApiOperation({
    summary: 'Get employees by company',
    description: 'Retrieves all employees for a specific company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Company employees retrieved successfully',
    type: [Employee],
  })
  async findByCompany(@Param('companyId') companyId: string): Promise<Employee[]> {
    return this.employeeService.findByCompany(+companyId);
  }

  @Get('employee-id/:employeeId')
  @ApiOperation({
    summary: 'Get employee by employee ID',
    description: 'Retrieves an employee by their company-specific employee ID.',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    example: 'EMP001',
    type: 'string',
  })
  @ApiQuery({
    name: 'companyId',
    description: 'Company ID for additional filtering',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee found and retrieved successfully',
    type: Employee,
  })
  async findByEmployeeId(
    @Param('employeeId') employeeId: string,
    @Query('companyId') companyId?: string,
  ): Promise<Employee> {
    return this.employeeService.findByEmployeeId(employeeId, companyId ? +companyId : undefined);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an employee by ID',
    description: 'Retrieves a specific employee with detailed information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee found and retrieved successfully',
    type: Employee,
  })
  async findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.findOne(+id);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get employee statistics',
    description: 'Retrieves comprehensive statistics for an employee including payroll data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee statistics retrieved successfully',
  })
  async getStats(@Param('id') id: string) {
    return this.employeeService.getEmployeeStats(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an employee',
    description: 'Updates an existing employee with the provided information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 1,
    type: 'number',
  })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: Employee,
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeeService.update(+id, updateEmployeeDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update employee status',
    description: 'Updates the status of an employee (ACTIVE, INACTIVE, TERMINATED).',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 1,
    type: 'number',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
          example: 'INACTIVE',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Employee status updated successfully',
    type: Employee,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Employee> {
    return this.employeeService.updateStatus(+id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an employee',
    description: 'Permanently deletes an employee and all associated data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 204,
    description: 'Employee deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeeService.remove(+id);
  }
}