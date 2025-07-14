import { Module } from '@nestjs/common';
import { MessageService } from './message.service';

import { MessageGateway } from './message.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [MessageService, MessageGateway, WsJwtGuard],
  exports: [MessageService],
})
export class MessageModule {}