import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectTimeEntryService } from './project-time-entry.service';
import { CreateProjectTimeEntryDto } from './dto/create-project-time-entry.dto';
import { UpdateProjectTimeEntryDto } from './dto/update-project-time-entry.dto';
import { ProjectTimeEntry } from './entities/project-time-entry.entity';

@ApiTags('project-time-entries')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('project-time-entries')
export class ProjectTimeEntryController {
  constructor(private readonly projectTimeEntryService: ProjectTimeEntryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new time entry',
    description: 'Creates a new time entry for a project.',
  })
  @ApiBody({ type: CreateProjectTimeEntryDto })
  @ApiResponse({
    status: 201,
    description: 'Time entry created successfully',
    type: ProjectTimeEntry,
  })
  async create(@Body() createProjectTimeEntryDto: CreateProjectTimeEntryDto) {
    return this.projectTimeEntryService.create(createProjectTimeEntryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all time entries',
    description: 'Retrieves all time entries, optionally filtered by project or user.',
  })
  @ApiQuery({
    name: 'projectId',
    description: 'Filter by project ID',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'userId',
    description: 'Filter by user ID',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'List of time entries retrieved successfully',
    type: [ProjectTimeEntry],
  })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.projectTimeEntryService.findAll(
      projectId ? +projectId : undefined,
      userId ? +userId : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a time entry by ID',
    description: 'Retrieves a specific time entry by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Time entry ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Time entry found and retrieved successfully',
    type: ProjectTimeEntry,
  })
  async findOne(@Param('id') id: string) {
    return this.projectTimeEntryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a time entry',
    description: 'Updates an existing time entry.',
  })
  @ApiParam({
    name: 'id',
    description: 'Time entry ID',
    example: 1,
    type: 'number',
  })
  @ApiBody({ type: UpdateProjectTimeEntryDto })
  @ApiResponse({
    status: 200,
    description: 'Time entry updated successfully',
    type: ProjectTimeEntry,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectTimeEntryDto: UpdateProjectTimeEntryDto,
  ) {
    return this.projectTimeEntryService.update(+id, updateProjectTimeEntryDto);
  }

  @Patch(':id/stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stop a running timer',
    description: 'Stops a currently active time entry and calculates the duration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Time entry ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Timer stopped successfully',
    type: ProjectTimeEntry,
  })
  async stopTimer(@Param('id') id: string) {
    return this.projectTimeEntryService.stopTimer(+id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a time entry',
    description: 'Permanently deletes a time entry.',
  })
  @ApiParam({
    name: 'id',
    description: 'Time entry ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 204,
    description: 'Time entry deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.projectTimeEntryService.remove(+id);
  }
}