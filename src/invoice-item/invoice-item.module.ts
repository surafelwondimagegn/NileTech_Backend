import { Module } from '@nestjs/common';
import { InvoiceItemService } from './invoice-item.service';
import { InvoiceItemController } from './invoice-item.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InvoiceItemController],
  providers: [InvoiceItemService],
  exports: [InvoiceItemService],
})
export class InvoiceItemModule {}
