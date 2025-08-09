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
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { ProjectService } from './project.service';
import {
  CreateProjectDto,
  CreateProjectWithInvoiceDto,
  CreateProjectWithoutInvoiceDto,
  ProjectServiceDto,
  ProjectProductDto,
  ProjectMilestoneDto,
} from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  StartProjectDto,
  CompleteProjectDto,
  CancelProjectDto,
  ProjectStatusResponseDto,
} from './dto/project-status.dto';
import {
  UpdateProgressDto,
  StartTimeEntryDto,
  StopTimeEntryDto,
  CreateTimeEntryDto,
  UpdateMilestoneDto,
  ProjectTimeEntryResponseDto,
  ProjectMilestoneResponseDto,
  ProjectTrackingResponseDto,
} from './dto/project-tracking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectStatus } from './dto/create-project.dto';
import { CreateProjectExpenseDto } from './dto/create-project-expense.dto';
import { CreateProjectProformaDto } from './dto/create-project-proforma.dto';
import { CreateRevenueFromInvoiceDto } from './dto/create-revenue-from-invoice.dto';
import { CreateRevenueFromSoldServiceDto } from './dto/create-revenue-from-sold-service.dto';
import { CreateRevenueFromSoldProductDto } from './dto/create-revenue-from-sold-product.dto';

@ApiTags('project')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // ==================== PROJECT CREATION ====================

  @Post()
  @ApiOperation({ summary: 'Create a new project with automatic invoice' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 404,
    description: 'Client or assigned user not found',
  })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
    return this.projectService.create(createProjectDto, req.user.id);
  }

  @Post('with-invoice')
  @ApiOperation({ 
    summary: 'Create a new project with automatic invoice',
    description: 'Creates a new project and automatically generates an invoice with all services and products included.'
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully with invoice',
    schema: {
      example: {
        id: 1,
        title: 'Website Redesign for Acme Corp',
        description: 'Complete website redesign with modern UI/UX and responsive design',
        clientName: 'Acme Corporation',
        clientEmail: 'client@acme.com',
        clientPhone: '+1234567890',
        status: 'PENDING',
        priority: 'MEDIUM',
        progress: 25,
        createdAt: '2025-07-14T15:59:53.600Z',
        updatedAt: '2025-07-14T15:59:53.600Z',
        invoice: {
          id: 1,
          invoiceNumber: 'INV-2025-001',
          totalAmount: 850.00,
          status: 'PENDING'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data provided' })
  @ApiResponse({
    status: 404,
    description: 'Client or assigned user not found',
  })
  createWithInvoice(
    @Body() createProjectDto: CreateProjectWithInvoiceDto,
    @Request() req: any,
  ) {
    return this.projectService.createWithInvoice(createProjectDto, req.user.id);
  }

  @Post('with-both')
  @ApiOperation({ 
    summary: 'Create a new project with both invoice and proforma',
    description: 'Creates a new project and automatically generates both an invoice and a proforma invoice with all services and products included.'
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully with both invoice and proforma',
    schema: {
      example: {
        project: {
          id: 1,
          title: 'Website Redesign for Acme Corp',
          description: 'Complete website redesign with modern UI/UX and responsive design',
          clientName: 'Acme Corporation',
          clientEmail: 'client@acme.com',
          clientPhone: '+1234567890',
          status: 'PENDING',
          priority: 'MEDIUM',
          progress: 25,
          createdAt: '2025-07-14T15:59:53.600Z',
          updatedAt: '2025-07-14T15:59:53.600Z'
        },
        invoice: {
          id: 1,
          invoiceNumber: 'INV-2025-001',
          totalAmount: 850.00,
          status: 'PENDING'
        },
        proforma: {
          id: 1,
          proformaNumber: 'PROF-2025-001',
          totalAmount: 850.00,
          status: 'PENDING'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data provided' })
  @ApiResponse({
    status: 404,
    description: 'Client or assigned user not found',
  })
  createWithBoth(
    @Body() createProjectDto: CreateProjectWithInvoiceDto,
    @Request() req: any,
  ) {
    return this.projectService.createWithBoth(createProjectDto, req.user.id);
  }

  @Post('with-proforma')
  @ApiOperation({ 
    summary: 'Create a new project with automatic proforma',
    description: 'Creates a new project and automatically generates a proforma invoice with all services and products included.'
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully with proforma',
    schema: {
      example: {
        project: {
          id: 1,
          title: 'Website Redesign for Acme Corp',
          description: 'Complete website redesign with modern UI/UX and responsive design',
          clientName: 'Acme Corporation',
          clientEmail: 'client@acme.com',
          clientPhone: '+1234567890',
          status: 'PENDING',
          priority: 'MEDIUM',
          progress: 25,
          createdAt: '2025-07-14T15:59:53.600Z',
          updatedAt: '2025-07-14T15:59:53.600Z'
        },
        proforma: {
          id: 1,
          proformaNumber: 'PROF-2025-001',
          totalAmount: 850.00,
          status: 'PENDING'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data provided' })
  @ApiResponse({
    status: 404,
    description: 'Client or assigned user not found',
  })
  createWithProforma(
    @Body() createProjectDto: CreateProjectWithInvoiceDto,
    @Request() req: any,
  ) {
    return this.projectService.createWithProforma(createProjectDto, req.user.id);
  }

  @Post('without-invoice')
  @ApiOperation({ 
    summary: 'Create a new project without automatic invoice',
    description: 'Creates a new project without automatically generating an invoice. Services and products can be added later.'
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully without invoice',
    schema: {
      example: {
        id: 1,
        title: 'Website Redesign for Acme Corp',
        description: 'Complete website redesign with modern UI/UX and responsive design',
        clientName: 'Acme Corporation',
        clientEmail: 'client@acme.com',
        clientPhone: '+1234567890',
        status: 'PENDING',
        priority: 'MEDIUM',
        progress: 25,
        createdAt: '2025-07-14T15:59:53.600Z',
        updatedAt: '2025-07-14T15:59:53.600Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data provided' })
  @ApiResponse({
    status: 404,
    description: 'Client or assigned user not found',
  })
  createWithoutInvoice(
    @Body() createProjectDto: CreateProjectWithoutInvoiceDto,
    @Request() req: any,
  ) {
    return this.projectService.createWithoutInvoice(
      createProjectDto,
      req.user.id,
    );
  }

  // ==================== PROJECT TRACKING ====================

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update project progress (0-100%)' })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
    type: ProjectTrackingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  updateProgress(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() updateProgressDto: UpdateProgressDto,
    @Request() req: any,
  ) {
    return this.projectService.updateProgress(
      projectId,
      updateProgressDto,
      req.user.id,
    );
  }

  @Post(':id/time/start')
  @ApiOperation({ summary: 'Start a time entry for a project' })
  @ApiResponse({
    status: 201,
    description: 'Time entry started successfully',
    type: ProjectTimeEntryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Already has active time entry' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  startTimeEntry(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() startTimeEntryDto: StartTimeEntryDto,
    @Request() req: any,
  ) {
    return this.projectService.startTimeEntry(
      projectId,
      startTimeEntryDto,
      req.user.id,
    );
  }

  @Post(':id/time/stop')
  @ApiOperation({ summary: 'Stop the active time entry for a project' })
  @ApiResponse({
    status: 200,
    description: 'Time entry stopped successfully',
    type: ProjectTimeEntryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'No active time entry found' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  stopTimeEntry(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() stopTimeEntryDto: StopTimeEntryDto,
    @Request() req: any,
  ) {
    return this.projectService.stopTimeEntry(
      projectId,
      stopTimeEntryDto,
      req.user.id,
    );
  }

  @Post(':id/time')
  @ApiOperation({ summary: 'Create a manual time entry for a project' })
  @ApiResponse({
    status: 201,
    description: 'Time entry created successfully',
    type: ProjectTimeEntryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  createTimeEntry(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() createTimeEntryDto: CreateTimeEntryDto,
    @Request() req: any,
  ) {
    return this.projectService.createTimeEntry(
      projectId,
      createTimeEntryDto,
      req.user.id,
    );
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get comprehensive project tracking information' })
  @ApiResponse({
    status: 200,
    description: 'Project tracking data retrieved',
    type: ProjectTrackingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getProjectTracking(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectTracking(projectId);
  }

  // ==================== MILESTONE MANAGEMENT ====================

  @Post(':id/milestones')
  @ApiOperation({ summary: 'Create a new milestone for a project' })
  @ApiResponse({
    status: 201,
    description: 'Milestone created successfully',
    type: ProjectMilestoneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  createMilestone(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() milestoneDto: ProjectMilestoneDto,
    @Request() req: any,
  ) {
    return this.projectService.createMilestone(
      projectId,
      milestoneDto,
      req.user.id,
    );
  }

  @Patch('milestones/:milestoneId')
  @ApiOperation({ summary: 'Update a project milestone' })
  @ApiResponse({
    status: 200,
    description: 'Milestone updated successfully',
    type: ProjectMilestoneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Milestone not found' })
  updateMilestone(
    @Param('milestoneId', ParseIntPipe) milestoneId: number,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
    @Request() req: any,
  ) {
    return this.projectService.updateMilestone(
      milestoneId,
      updateMilestoneDto,
      req.user.id,
    );
  }

  // ==================== PROJECT STATUS MANAGEMENT ====================

  @Patch(':id/start')
  @ApiOperation({ summary: 'Start a project' })
  @ApiResponse({
    status: 200,
    description: 'Project started successfully',
    type: ProjectStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Project is already started' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  startProject(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() startProjectDto: StartProjectDto,
    @Request() req: any,
  ) {
    return this.projectService.startProject(
      projectId,
      startProjectDto,
      req.user.id,
    );
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a project' })
  @ApiResponse({
    status: 200,
    description: 'Project completed successfully',
    type: ProjectStatusResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Project is already completed or cancelled',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  completeProject(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() completeProjectDto: CompleteProjectDto,
    @Request() req: any,
  ) {
    return this.projectService.completeProject(
      projectId,
      completeProjectDto,
      req.user.id,
    );
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a project' })
  @ApiResponse({
    status: 200,
    description: 'Project cancelled successfully',
    type: ProjectStatusResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Project is already completed or cancelled',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  cancelProject(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() cancelProjectDto: CancelProjectDto,
    @Request() req: any,
  ) {
    return this.projectService.cancelProject(
      projectId,
      cancelProjectDto,
      req.user.id,
    );
  }

  // ==================== PROJECT MANAGEMENT ====================

  @Get()
  @ApiOperation({ summary: 'Get all projects with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findAll(
    @Query('clientId') clientId?: number,
    @Query('status') status?: string,
    @Query('assignedToId') assignedToId?: number,
    @Query('priority') priority?: string,
    @Query('isPublic') isPublic?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.projectService.findAll(
      clientId,
      status,
      assignedToId,
      priority,
      isPublic,
      page,
      limit,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get project statistics' })
  @ApiResponse({
    status: 200,
    description: 'Project statistics retrieved successfully',
  })
  getStats() {
    return this.projectService.getProjectStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.findOne(id);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all projects for a specific client' })
  @ApiResponse({
    status: 200,
    description: 'Client projects retrieved successfully',
  })
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.projectService.findByClient(clientId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    return this.projectService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.remove(id);
  }

  // ==================== SERVICE & PRODUCT MANAGEMENT ====================

  @Post(':id/services')
  @ApiOperation({ summary: 'Add a service to a project' })
  @ApiResponse({
    status: 201,
    description: 'Service added to project successfully',
  })
  @ApiResponse({ status: 404, description: 'Project or service not found' })
  addService(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() serviceDto: ProjectServiceDto,
    @Request() req: any,
  ) {
    return this.projectService.addService(projectId, serviceDto, req.user.id);
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Add a product to a project' })
  @ApiResponse({
    status: 201,
    description: 'Product added to project successfully',
  })
  @ApiResponse({ status: 404, description: 'Project or product not found' })
  addProduct(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() productDto: ProjectProductDto,
    @Request() req: any,
  ) {
    return this.projectService.addProduct(projectId, productDto, req.user.id);
  }

  // ==================== INVOICE & PROFORMA MANAGEMENT ====================

  @Post(':id/invoice')
  @ApiOperation({ summary: 'Create an invoice for a project' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  createProjectInvoice(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() body: { notes?: string },
    @Request() req: any,
  ) {
    return this.projectService.createProjectInvoice(
      projectId,
      req.user.id,
      body.notes,
    );
  }

  @Post(':id/proforma')
  @ApiOperation({ summary: 'Create a proforma invoice for a project' })
  @ApiResponse({ status: 201, description: 'Proforma created successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  createProjectProforma(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() createProjectProformaDto: CreateProjectProformaDto,
    @Request() req: any,
  ) {
    return this.projectService.createProjectProforma(
      projectId,
      req.user.id,
      createProjectProformaDto.notes,
    );
  }

  @Get(':id/invoices')
  @ApiOperation({ summary: 'Get all invoices for a project' })
  @ApiResponse({
    status: 200,
    description: 'Project invoices retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getProjectInvoices(@Param('id', ParseIntPipe) projectId: number) {
    // This would need to be implemented in the service
    return { message: 'Project invoices', projectId, invoices: [] };
  }

  @Get(':id/proformas')
  @ApiOperation({ summary: 'Get all proforma invoices for a project' })
  @ApiResponse({
    status: 200,
    description: 'Project proforma invoices retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getProjectProformas(@Param('id', ParseIntPipe) projectId: number) {
    // This would need to be implemented in the service
    return { message: 'Project proforma invoices', projectId, proformas: [] };
  }

  // ==================== REVENUE MANAGEMENT ====================

  @Post(':id/revenue/invoice')
  @ApiOperation({ summary: 'Create revenue from project invoice payment' })
  @ApiResponse({ status: 201, description: 'Revenue created successfully' })
  @ApiResponse({ status: 404, description: 'Project or invoice not found' })
  createRevenueFromInvoice(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() createRevenueFromInvoiceDto: CreateRevenueFromInvoiceDto,
    @Request() req: any,
  ) {
    return this.projectService.createRevenueFromInvoice(
      createRevenueFromInvoiceDto.invoiceId,
      createRevenueFromInvoiceDto.amount,
      createRevenueFromInvoiceDto.receivedAt,
    );
  }

  @Post('revenue/service')
  @ApiOperation({ summary: 'Create revenue from sold service' })
  @ApiResponse({ status: 201, description: 'Service revenue created successfully' })
  createRevenueFromSoldService(
    @Body() createRevenueFromSoldServiceDto: CreateRevenueFromSoldServiceDto,
    @Request() req: any,
  ) {
    return this.projectService.createRevenueFromSoldService(
      createRevenueFromSoldServiceDto.serviceId,
      createRevenueFromSoldServiceDto.quantity,
      createRevenueFromSoldServiceDto.sellingPrice,
      createRevenueFromSoldServiceDto.customerName,
      createRevenueFromSoldServiceDto.customerEmail,
      createRevenueFromSoldServiceDto.customerPhone,
      createRevenueFromSoldServiceDto.notes,
    );
  }

  @Post('revenue/product')
  @ApiOperation({ summary: 'Create revenue from sold product' })
  @ApiResponse({ status: 201, description: 'Product revenue created successfully' })
  createRevenueFromSoldProduct(
    @Body() createRevenueFromSoldProductDto: CreateRevenueFromSoldProductDto,
    @Request() req: any,
  ) {
    return this.projectService.createRevenueFromSoldProduct(
      createRevenueFromSoldProductDto.productId,
      createRevenueFromSoldProductDto.quantity,
      createRevenueFromSoldProductDto.sellingPrice,
      createRevenueFromSoldProductDto.customerName,
      createRevenueFromSoldProductDto.customerEmail,
      createRevenueFromSoldProductDto.customerPhone,
      createRevenueFromSoldProductDto.notes,
    );
  }

  // ==================== EXPENSE MANAGEMENT ====================

  @Post(':id/expenses')
  @ApiOperation({ summary: 'Create a project expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 400, description: 'Insufficient budget or invalid funding source' })
  createProjectExpense(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() createProjectExpenseDto: CreateProjectExpenseDto,
    @Request() req: any,
  ) {
    return this.projectService.createProjectExpense(
      projectId,
      createProjectExpenseDto.amount,
      createProjectExpenseDto.note,
      createProjectExpenseDto.fundingSource || 'BUDGET',
      createProjectExpenseDto.budgetId,
    );
  }

  // ==================== FINANCIAL MANAGEMENT ====================

  @Get(':id/financial-summary')
  @ApiOperation({ summary: 'Get comprehensive financial summary for a project' })
  @ApiResponse({ status: 200, description: 'Financial summary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getProjectFinancialSummary(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectFinancialSummary(projectId);
  }

  @Post(':id/calculate-profit')
  @ApiOperation({ summary: 'Calculate and update project profit' })
  @ApiResponse({ status: 200, description: 'Profit calculated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  calculateProjectProfit(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.calculateProjectProfit(projectId);
  }

  // ==================== ALERT & NOTIFICATION SYSTEM ====================

  @Get(':id/alerts')
  @ApiOperation({ summary: 'Get all alerts for a specific project' })
  @ApiResponse({ status: 200, description: 'Project alerts retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getProjectAlerts(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectAlerts(projectId);
  }

  @Post('alerts/run-all')
  @ApiOperation({ summary: 'Run all alert systems (deadlines, budgets, overdue)' })
  @ApiResponse({ status: 200, description: 'All alerts processed successfully' })
  runAllAlerts() {
    return this.projectService.runAllAlerts();
  }

  @Post('alerts/deadlines')
  @ApiOperation({ summary: 'Run deadline alerts for all projects' })
  @ApiResponse({ status: 200, description: 'Deadline alerts processed successfully' })
  scheduleDeadlineAlerts() {
    return this.projectService.scheduleDeadlineAlerts();
  }

  @Post('alerts/budgets')
  @ApiOperation({ summary: 'Run budget alerts for all projects' })
  @ApiResponse({ status: 200, description: 'Budget alerts processed successfully' })
  scheduleBudgetAlerts() {
    return this.projectService.scheduleBudgetAlerts();
  }

  @Post('alerts/overdue')
  @ApiOperation({ summary: 'Run overdue project alerts' })
  @ApiResponse({ status: 200, description: 'Overdue alerts processed successfully' })
  scheduleOverdueProjectAlerts() {
    return this.projectService.scheduleOverdueProjectAlerts();
  }


}
