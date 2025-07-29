import { Module } from '@nestjs/common';
import { SoldServiceController } from './sold-service.controller';
import { SoldServiceService } from './sold-service.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SoldServiceController],
  providers: [SoldServiceService, PrismaService],
  exports: [SoldServiceService],
})
export class SoldServiceModule {}