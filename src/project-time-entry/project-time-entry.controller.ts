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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { ProjectTimeEntryService } from './project-time-entry.service';
import { CreateProjectTimeEntryDto } from './dto/create-project-time-entry.dto';
import { UpdateProjectTimeEntryDto } from './dto/update-project-time-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('project-time-entry')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@Controller('project-time-entries')
@UseGuards(JwtAuthGuard)
export class ProjectTimeEntryController {
  constructor(private readonly projectTimeEntryService: ProjectTimeEntryService) {}

  @Post()
  create(@Body() createProjectTimeEntryDto: CreateProjectTimeEntryDto, @Request() req) {
    // If userId is not provided, use the authenticated user's ID
    if (!createProjectTimeEntryDto.userId) {
      createProjectTimeEntryDto.userId = req.user.id;
    }
    return this.projectTimeEntryService.create(createProjectTimeEntryDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.projectTimeEntryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectTimeEntryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectTimeEntryDto: UpdateProjectTimeEntryDto) {
    return this.projectTimeEntryService.update(+id, updateProjectTimeEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectTimeEntryService.remove(+id);
  }

  @Post(':id/stop')
  stopTimeEntry(@Param('id') id: string) {
    return this.projectTimeEntryService.stopTimeEntry(+id);
  }

  @Get('project/:projectId/summary')
  getProjectTimeSummary(@Param('projectId') projectId: string) {
    return this.projectTimeEntryService.getProjectTimeSummary(+projectId);
  }
}