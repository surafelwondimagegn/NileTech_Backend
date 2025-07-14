import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

import { NotificationGateway } from './notification.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService],
})
export class NotificationModule {}