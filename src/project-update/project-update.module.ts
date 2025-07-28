import { Module } from '@nestjs/common';
import { ProjectUpdateService } from './project-update.service';
import { ProjectUpdateController } from './project-update.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectUpdateController],
  providers: [ProjectUpdateService, PrismaService],
  exports: [ProjectUpdateService],
})
export class ProjectUpdateModule {}
