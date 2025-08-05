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
import { ProjectMilestoneService } from './project-milestone.service';
import { CreateProjectMilestoneDto } from './dto/create-project-milestone.dto';
import { UpdateProjectMilestoneDto } from './dto/update-project-milestone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('project-milestone')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@Controller('project-milestones')
@UseGuards(JwtAuthGuard)
export class ProjectMilestoneController {
  constructor(private readonly projectMilestoneService: ProjectMilestoneService) {}

  @Post()
  create(@Body() createProjectMilestoneDto: CreateProjectMilestoneDto) {
    return this.projectMilestoneService.create(createProjectMilestoneDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.projectMilestoneService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectMilestoneService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectMilestoneDto: UpdateProjectMilestoneDto) {
    return this.projectMilestoneService.update(+id, updateProjectMilestoneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectMilestoneService.remove(+id);
  }

  @Post(':id/complete')
  completeMilestone(@Param('id') id: string) {
    return this.projectMilestoneService.completeMilestone(+id);
  }

  @Patch(':id/progress')
  updateProgress(@Param('id') id: string, @Body() body: { progress: number }) {
    return this.projectMilestoneService.updateProgress(+id, body.progress);
  }

  @Get('project/:projectId')
  getProjectMilestones(@Param('projectId') projectId: string) {
    return this.projectMilestoneService.getProjectMilestones(+projectId);
  }
}