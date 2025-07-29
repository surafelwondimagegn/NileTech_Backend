import { Module } from '@nestjs/common';
import { ProjectHistoryController } from './project-history.controller';
import { ProjectHistoryService } from './project-history.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectHistoryController],
  providers: [ProjectHistoryService, PrismaService],
  exports: [ProjectHistoryService],
})
export class ProjectHistoryModule {}