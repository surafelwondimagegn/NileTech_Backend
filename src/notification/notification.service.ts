import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async findAll() {
    return this.prisma.notification.findMany({
      include: {
        // Add your relations here
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        // Add your relations here
      },
    });
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  async remove(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}