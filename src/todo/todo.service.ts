import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = await this.prisma.todo.create({
      data: {
        userId,
        title: createTodoDto.title,
        description: createTodoDto.description,
      },
    });

    return todo;
  }

  async findAll(userId: number): Promise<Todo[]> {
    const todos = await this.prisma.todo.findMany({
      where: { userId },
      orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
    });

    return todos;
  }

  async findOne(id: number, userId: number): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException('You can only access your own todos');
    }

    return todo;
  }

  async update(
    id: number,
    updateTodoDto: UpdateTodoDto,
    userId: number,
  ): Promise<Todo> {
    // First check if todo exists and user has access
    await this.findOne(id, userId);

    const todo = await this.prisma.todo.update({
      where: { id },
      data: {
        title: updateTodoDto.title,
        description: updateTodoDto.description,
        completed: updateTodoDto.completed,
      },
    });

    return todo;
  }

  async toggleComplete(id: number, userId: number): Promise<Todo> {
    // First check if todo exists and user has access
    const existingTodo = await this.findOne(id, userId);

    const todo = await this.prisma.todo.update({
      where: { id },
      data: {
        completed: !existingTodo.completed,
      },
    });

    return todo;
  }

  async remove(id: number, userId: number): Promise<void> {
    // First check if todo exists and user has access
    await this.findOne(id, userId);

    await this.prisma.todo.delete({
      where: { id },
    });
  }

  async getStats(
    userId: number,
  ): Promise<{ total: number; completed: number; pending: number }> {
    const [total, completed] = await Promise.all([
      this.prisma.todo.count({
        where: { userId },
      }),
      this.prisma.todo.count({
        where: {
          userId,
          completed: true,
        },
      }),
    ]);

    return {
      total,
      completed,
      pending: total - completed,
    };
  }
}
