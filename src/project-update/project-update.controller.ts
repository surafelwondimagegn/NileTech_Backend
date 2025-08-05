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
import { ProjectUpdateService } from './project-update.service';
import { CreateProjectUpdateDto } from './dto/create-project-update.dto';
import { UpdateProjectUpdateDto } from './dto/update-project-update.dto';
import { ProjectUpdate } from './entities/project-update.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('project-update')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('project-updates')
export class ProjectUpdateController {
  constructor(private readonly projectUpdateService: ProjectUpdateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project update' })
  @ApiResponse({
    status: 201,
    description: 'Project update created successfully',
    type: ProjectUpdate,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBody({ type: CreateProjectUpdateDto })
  create(@Body() createProjectUpdateDto: CreateProjectUpdateDto) {
    return this.projectUpdateService.create(createProjectUpdateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all project updates' })
  @ApiResponse({
    status: 200,
    description: 'List of project updates',
    type: [ProjectUpdate],
  })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'Filter by project ID',
    type: Number,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by update type',
    enum: ['status', 'message', 'file', 'milestone', 'invoice', 'general'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  findAll(
    @Query('projectId') projectId?: number,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.projectUpdateService.findAll(projectId, type, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project update by ID' })
  @ApiParam({ name: 'id', description: 'Project update ID' })
  @ApiResponse({
    status: 200,
    description: 'Project update found',
    type: ProjectUpdate,
  })
  @ApiResponse({ status: 404, description: 'Project update not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectUpdateService.findOne(id);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all updates for a specific project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'List of project updates',
    type: [ProjectUpdate],
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectUpdateService.findByProject(projectId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project update' })
  @ApiParam({ name: 'id', description: 'Project update ID' })
  @ApiResponse({
    status: 200,
    description: 'Project update updated successfully',
    type: ProjectUpdate,
  })
  @ApiResponse({ status: 404, description: 'Project update not found' })
  @ApiBody({ type: UpdateProjectUpdateDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectUpdateDto: UpdateProjectUpdateDto,
  ) {
    return this.projectUpdateService.update(id, updateProjectUpdateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project update' })
  @ApiParam({ name: 'id', description: 'Project update ID' })
  @ApiResponse({
    status: 200,
    description: 'Project update deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Project update not found' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectUpdateService.remove(id);
  }
}
