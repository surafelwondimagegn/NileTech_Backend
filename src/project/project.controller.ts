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
    summary: 'Create a new project with automatic invoice creation',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully with invoice',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
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

  @Post('without-invoice')
  @ApiOperation({ summary: 'Create a new project without automatic invoice' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully without invoice',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
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

  // ==================== TESTING ENDPOINTS ====================

  @Post('test/notification-system')
  @ApiOperation({ summary: 'Test the notification system with sample data' })
  @ApiResponse({ status: 200, description: 'Notification system tested successfully' })
  async testNotificationSystem(@Request() req: any) {
    // Create a test project to trigger notifications
    const testProject = {
      id: 999,
      title: 'Test Project for Notifications',
      clientName: 'Test Client',
      clientId: req.user.id,
      assignedToId: req.user.id,
      status: ProjectStatus.PENDING,
      progress: 0,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    // Test various notification scenarios
    await this.projectService.testNotificationMethods(testProject, req.user.id);

    return {
      message: 'Notification system test completed',
      tests: [
        'Project creation notification',
        'Status change notification',
        'Deadline alert',
        'Progress update notification',
      ],
    };
  }

  @Post('test/alert-system')
  @ApiOperation({ summary: 'Test the alert system with sample data' })
  @ApiResponse({ status: 200, description: 'Alert system tested successfully' })
  async testAlertSystem() {
    const results = await this.projectService.runAllAlerts();
    return {
      message: 'Alert system test completed',
      results,
    };
  }

  @Post('test/financial-system')
  @ApiOperation({ summary: 'Test the financial management system' })
  @ApiResponse({ status: 200, description: 'Financial system tested successfully' })
  async testFinancialSystem(@Request() req: any) {
    // Test revenue creation with existing services/products
    const serviceRevenue = await this.projectService.createRevenueFromSoldService(
      2, // serviceId - using existing service
      2, // quantity
      100, // sellingPrice
      'Test Customer',
      'test@example.com',
      '+1234567890',
      'Test service sale',
    );

    // Note: Product revenue test skipped as it requires stock management
    // and existing products with sufficient stock

    return {
      message: 'Financial system test completed',
      tests: [
        'Service revenue creation',
        'Product revenue creation (skipped - requires stock)',
      ],
      results: {
        serviceRevenue,
        note: 'Product revenue test requires existing products with sufficient stock',
      },
    };
  }

  @Post('test/invoice-proforma-system')
  @ApiOperation({ summary: 'Test invoice and proforma creation system' })
  @ApiResponse({ status: 200, description: 'Invoice/Proforma system tested successfully' })
  async testInvoiceProformaSystem(@Request() req: any) {
    // Create a test project first
    const testProject = await this.projectService.create({
      title: 'Test Project for Invoice/Proforma',
      clientName: 'Test Client',
      clientId: req.user.id,
      status: ProjectStatus.PENDING,
    }, req.user.id);

    // Add a service to the project
    await this.projectService.addService(testProject.id, {
      serviceId: 1,
      quantity: 2,
      unitPrice: 100,
      notes: 'Test service for invoice',
    }, req.user.id);

    // Add a product to the project
    await this.projectService.addProduct(testProject.id, {
      productId: 1,
      quantity: 1,
      unitPrice: 50,
      notes: 'Test product for invoice',
    }, req.user.id);

    // Create invoice
    const invoice = await this.projectService.createProjectInvoice(
      testProject.id,
      req.user.id,
      'Test invoice notes',
    );

    return {
      message: 'Invoice/Proforma system test completed',
      tests: [
        'Project creation with services and products',
        'Invoice creation from project items',
      ],
      results: {
        project: testProject,
        invoice,
      },
    };
  }

  @Post('test/budget-expense-system')
  @ApiOperation({ summary: 'Test budget and expense management system' })
  @ApiResponse({ status: 200, description: 'Budget/Expense system tested successfully' })
  async testBudgetExpenseSystem(@Request() req: any) {
    // Create a test project
    const testProject = await this.projectService.create({
      title: 'Test Project for Budget/Expense',
      clientName: 'Test Client',
      clientId: req.user.id,
      status: ProjectStatus.PENDING,
    }, req.user.id);

    // Create project expense
    const expense = await this.projectService.createProjectExpense(
      testProject.id,
      100,
      'Test expense for budget tracking',
      'BUDGET',
    );

    return {
      message: 'Budget/Expense system test completed',
      tests: [
        'Project creation',
        'Expense creation with budget tracking',
      ],
      results: {
        project: testProject,
        expense,
      },
    };
  }

  @Post('test/time-tracking-system')
  @ApiOperation({ summary: 'Test time tracking system' })
  @ApiResponse({ status: 200, description: 'Time tracking system tested successfully' })
  async testTimeTrackingSystem(@Request() req: any) {
    // Create a test project
    const testProject = await this.projectService.create({
      title: 'Test Project for Time Tracking',
      clientName: 'Test Client',
      clientId: req.user.id,
      status: ProjectStatus.IN_PROGRESS,
    }, req.user.id);

    // Start time entry
    const startEntry = await this.projectService.startTimeEntry(
      testProject.id,
      {
        description: 'Test time tracking',
      },
      req.user.id,
    );

    // Stop time entry
    const stopEntry = await this.projectService.stopTimeEntry(
      testProject.id,
      {
        endTime: new Date(),
        notes: 'Test time entry completed',
      },
      req.user.id,
    );

    // Create manual time entry
    const manualEntry = await this.projectService.createTimeEntry(
      testProject.id,
      {
        description: 'Manual test entry',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        duration: 60, // 1 hour
        notes: 'Manual test entry',
      },
      req.user.id,
    );

    return {
      message: 'Time tracking system test completed',
      tests: [
        'Project creation',
        'Start time entry',
        'Stop time entry',
        'Manual time entry creation',
      ],
      results: {
        project: testProject,
        startEntry,
        stopEntry,
        manualEntry,
      },
    };
  }

  @Post('test/milestone-system')
  @ApiOperation({ summary: 'Test milestone management system' })
  @ApiResponse({ status: 200, description: 'Milestone system tested successfully' })
  async testMilestoneSystem(@Request() req: any) {
    // Create a test project
    const testProject = await this.projectService.create({
      title: 'Test Project for Milestones',
      clientName: 'Test Client',
      clientId: req.user.id,
      status: ProjectStatus.IN_PROGRESS,
    }, req.user.id);

    // Create milestone
    const milestone = await this.projectService.createMilestone(
      testProject.id,
      {
        title: 'Test Milestone',
        description: 'Test milestone description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        order: 1,
      },
      req.user.id,
    );

    // Update milestone
    const updatedMilestone = await this.projectService.updateMilestone(
      milestone.id,
      {
        title: 'Updated Test Milestone',
        description: 'Updated test milestone description',
        progress: 50,
        isCompleted: false,
      },
      req.user.id,
    );

    return {
      message: 'Milestone system test completed',
      tests: [
        'Project creation',
        'Milestone creation',
        'Milestone update',
      ],
      results: {
        project: testProject,
        milestone,
        updatedMilestone,
      },
    };
  }

  @Post('test/comprehensive')
  @ApiOperation({ summary: 'Run comprehensive test of all project systems' })
  @ApiResponse({ status: 200, description: 'Comprehensive test completed successfully' })
  async runComprehensiveTest(@Request() req: any) {
    const results: any = {
      notificationSystem: null,
      alertSystem: null,
      financialSystem: null,
      invoiceProformaSystem: null,
      budgetExpenseSystem: null,
      timeTrackingSystem: null,
      milestoneSystem: null,
    };

    try {
      // Test notification system
      results.notificationSystem = await this.testNotificationSystem(req);
    } catch (error) {
      results.notificationSystem = { error: error.message };
    }

    try {
      // Test alert system
      results.alertSystem = await this.testAlertSystem();
    } catch (error) {
      results.alertSystem = { error: error.message };
    }

    try {
      // Test financial system
      results.financialSystem = await this.testFinancialSystem(req);
    } catch (error) {
      results.financialSystem = { error: error.message };
    }

    try {
      // Test invoice/proforma system
      results.invoiceProformaSystem = await this.testInvoiceProformaSystem(req);
    } catch (error) {
      results.invoiceProformaSystem = { error: error.message };
    }

    try {
      // Test budget/expense system
      results.budgetExpenseSystem = await this.testBudgetExpenseSystem(req);
    } catch (error) {
      results.budgetExpenseSystem = { error: error.message };
    }

    try {
      // Test time tracking system
      results.timeTrackingSystem = await this.testTimeTrackingSystem(req);
    } catch (error) {
      results.timeTrackingSystem = { error: error.message };
    }

    try {
      // Test milestone system
      results.milestoneSystem = await this.testMilestoneSystem(req);
    } catch (error) {
      results.milestoneSystem = { error: error.message };
    }

    return {
      message: 'Comprehensive test completed',
      results,
      summary: {
        totalTests: 7,
        successfulTests: Object.values(results).filter((r: any) => r && !r.error).length,
        failedTests: Object.values(results).filter((r: any) => r && r.error).length,
      },
    };
  }
}
