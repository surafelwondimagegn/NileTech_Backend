import { Module } from '@nestjs/common';
import { SoldProductService } from './sold-product.service';
import { SoldProductController } from './sold-product.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SoldProductController],
  providers: [SoldProductService],
  exports: [SoldProductService],
})
export class SoldProductModule {}
