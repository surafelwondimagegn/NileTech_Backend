import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('employee')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  createEmployee(@Body() createData: {
    name: string;
    username: string;
    email: string;
    role: string;
    password: string;
    isActive: boolean;
    profile?: {
      jobTitle?: string;
      company?: string;
      department?: string;
      employeeId?: string;
      hireDate?: string;
      skills?: string;
      experience?: number;
      phoneNumber?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      bio?: string;
    };
  }) {
    return this.employeeService.createEmployee(createData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Get all employees with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Employees retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAllEmployees(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.employeeService.getAllEmployees(page, limit, search, department, status);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Get employee statistics' })
  @ApiResponse({
    status: 200,
    description: 'Employee statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getEmployeeStats() {
    return this.employeeService.getEmployeeStats();
  }

  @Get('departments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Get department distribution' })
  @ApiResponse({
    status: 200,
    description: 'Department distribution retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDepartmentDistribution() {
    return this.employeeService.getDepartmentDistribution();
  }

  @Get('performance-trends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Get performance trends' })
  @ApiResponse({
    status: 200,
    description: 'Performance trends retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getPerformanceTrends() {
    return this.employeeService.getPerformanceTrends();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getEmployeeById(@Param('id') id: string) {
    return this.employeeService.getEmployeeById(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  updateEmployee(
    @Param('id') id: string,
    @Body() updateData: {
      name?: string;
      username?: string;
      email?: string;
      role?: string;
      isActive?: boolean;
      profile?: {
        jobTitle?: string;
        company?: string;
        department?: string;
        employeeId?: string;
        hireDate?: string;
        skills?: string;
        experience?: number;
        phoneNumber?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        bio?: string;
      };
    },
  ) {
    return this.employeeService.updateEmployee(+id, updateData);
  }
} 