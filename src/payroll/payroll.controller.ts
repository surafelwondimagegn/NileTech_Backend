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
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payroll')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  create(@Body() createPayrollDto: CreatePayrollDto) {
    return this.payrollService.create(createPayrollDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.payrollService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayrollDto: UpdatePayrollDto) {
    return this.payrollService.update(+id, updatePayrollDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollService.remove(+id);
  }

  @Post('process/:period')
  processPayroll(@Param('period') period: string, @Query('companyId') companyId?: string) {
    return this.payrollService.processPayroll(period, companyId ? +companyId : undefined);
  }

  @Get('summary')
  getPayrollSummary(@Query() query: any) {
    return this.payrollService.getPayrollSummary(query);
  }

  @Patch(':id/approve')
  approvePayroll(@Param('id') id: string) {
    return this.payrollService.approvePayroll(+id);
  }

  @Get('report/:period')
  generatePayrollReport(@Param('period') period: string, @Query('companyId') companyId?: string) {
    return this.payrollService.generatePayrollReport(period, companyId ? +companyId : undefined);
  }
}