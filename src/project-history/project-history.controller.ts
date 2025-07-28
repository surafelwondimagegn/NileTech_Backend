import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectHistoryService } from './project-history.service';
import { CreateProjectHistoryDto } from './dto/create-project-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('project-history')
@UseGuards(JwtAuthGuard)
export class ProjectHistoryController {
  constructor(private readonly projectHistoryService: ProjectHistoryService) {}

  @Post()
  create(@Body() createProjectHistoryDto: CreateProjectHistoryDto) {
    return this.projectHistoryService.create(createProjectHistoryDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.projectHistoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectHistoryService.findOne(+id);
  }

  @Get('project/:projectId')
  getProjectHistory(@Param('projectId') projectId: string) {
    return this.projectHistoryService.getProjectHistory(+projectId);
  }

  @Get('project/:projectId/timeline')
  getProjectTimeline(@Param('projectId') projectId: string) {
    return this.projectHistoryService.getProjectTimeline(+projectId);
  }
}