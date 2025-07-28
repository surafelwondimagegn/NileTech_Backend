import { Module } from '@nestjs/common';
import { ProjectTimeEntryService } from './project-time-entry.service';
import { ProjectTimeEntryController } from './project-time-entry.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectTimeEntryController],
  providers: [ProjectTimeEntryService],
  exports: [ProjectTimeEntryService],
})
export class ProjectTimeEntryModule {}