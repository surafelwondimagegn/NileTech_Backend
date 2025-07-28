import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHeader(client);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(token);

      // Fetch full user data from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new WsException('User not found');
      }

      // Attach full user data to socket for later use
      client.data.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      };

      return true;
    } catch (error) {
      console.error('❌ WebSocket authentication error:', error);
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth =
      client.handshake.auth.token || client.handshake.headers.authorization;
    const token = auth?.replace('Bearer ', '');
    return token;
  }
}
