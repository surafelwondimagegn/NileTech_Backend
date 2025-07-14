import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    return this.prisma.message.create({
      data: createMessageDto,
    });
  }

  async findAll() {
    return this.prisma.message.findMany({
      include: {
        // Add your relations here
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.message.findUnique({
      where: { id },
      include: {
        // Add your relations here
      },
    });
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    return this.prisma.message.update({
      where: { id },
      data: updateMessageDto,
    });
  }

  async remove(id: number) {
    return this.prisma.message.delete({
      where: { id },
    });
  }
}