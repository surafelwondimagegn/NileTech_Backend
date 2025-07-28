import { Module } from '@nestjs/common';
import { ProjectTimeEntryController } from './project-time-entry.controller';
import { ProjectTimeEntryService } from './project-time-entry.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectTimeEntryController],
  providers: [ProjectTimeEntryService, PrismaService],
  exports: [ProjectTimeEntryService],
})
export class ProjectTimeEntryModule {}