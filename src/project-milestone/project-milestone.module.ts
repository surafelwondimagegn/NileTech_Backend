import { Module } from '@nestjs/common';
import { ProjectMilestoneController } from './project-milestone.controller';
import { ProjectMilestoneService } from './project-milestone.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectMilestoneController],
  providers: [ProjectMilestoneService, PrismaService],
  exports: [ProjectMilestoneService],
})
export class ProjectMilestoneModule {}