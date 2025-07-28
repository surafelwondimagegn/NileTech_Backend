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

@ApiTags('Projects')
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

  // ==================== INVOICE MANAGEMENT ====================

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
}
