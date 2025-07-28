import { Module } from '@nestjs/common';
import { ProformaController } from './proforma.controller';
import { ProformaService } from './proforma.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProformaController],
  providers: [ProformaService, PrismaService],
  exports: [ProformaService],
})
export class ProformaModule {}