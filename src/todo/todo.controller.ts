import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiHeader,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@ApiTags('todos')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new todo item',
    description:
      'Creates a new todo item for the authenticated user. The todo will be marked as incomplete by default.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiBody({
    type: CreateTodoDto,
    description: 'Todo item data',
    examples: {
      simple: {
        summary: 'Simple todo',
        description: 'Create a todo with just a title',
        value: {
          title: 'Buy groceries',
        },
      },
      detailed: {
        summary: 'Detailed todo',
        description: 'Create a todo with title and description',
        value: {
          title: 'Complete project documentation',
          description:
            'Write comprehensive documentation for the API endpoints including authentication, error handling, and usage examples',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Todo created successfully',
    type: Todo,
    schema: {
      example: {
        id: 1,
        userId: 1,
        title: 'Complete project documentation',
        description:
          'Write comprehensive documentation for the API endpoints including authentication, error handling, and usage examples',
        completed: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['title should not be empty', 'title must be a string'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Request() req,
  ): Promise<Todo> {
    return this.todoService.create(createTodoDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all todos for the authenticated user',
    description:
      'Retrieves all todo items belonging to the authenticated user, ordered by completion status and creation date.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of todos retrieved successfully',
    type: [Todo],
    schema: {
      example: [
        {
          id: 1,
          userId: 1,
          title: 'Complete project documentation',
          description:
            'Write comprehensive documentation for the API endpoints',
          completed: false,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        {
          id: 2,
          userId: 1,
          title: 'Buy groceries',
          description: null,
          completed: true,
          createdAt: '2024-01-14T15:20:00.000Z',
          updatedAt: '2024-01-15T09:15:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async findAll(@Request() req): Promise<Todo[]> {
    return this.todoService.findAll(req.user.id);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get todo statistics for the authenticated user',
    description:
      "Retrieves statistics about the user's todos including total count, completed count, and pending count.",
  })
  @ApiResponse({
    status: 200,
    description: 'Todo statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          description: 'Total number of todos',
          example: 10,
        },
        completed: {
          type: 'number',
          description: 'Number of completed todos',
          example: 6,
        },
        pending: {
          type: 'number',
          description: 'Number of pending todos',
          example: 4,
        },
      },
      example: {
        total: 10,
        completed: 6,
        pending: 4,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async getStats(@Request() req) {
    return this.todoService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific todo by ID',
    description:
      'Retrieves a specific todo item by its ID. Users can only access their own todos.',
  })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo found and retrieved successfully',
    type: Todo,
    schema: {
      example: {
        id: 1,
        userId: 1,
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the API endpoints',
        completed: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - trying to access another user's todo",
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only access your own todos',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Todo with ID 999 not found',
      },
    },
  })
  async findOne(@Param('id') id: string, @Request() req): Promise<Todo> {
    return this.todoService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a todo item',
    description:
      'Updates an existing todo item. Users can only update their own todos.',
  })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: 1,
    type: 'number',
  })
  @ApiBody({
    type: UpdateTodoDto,
    description: 'Todo update data',
    examples: {
      updateTitle: {
        summary: 'Update title only',
        description: 'Update just the title of the todo',
        value: {
          title: 'Updated project documentation',
        },
      },
      updateDescription: {
        summary: 'Update description only',
        description: 'Update just the description of the todo',
        value: {
          description: 'Updated description with more details',
        },
      },
      markComplete: {
        summary: 'Mark as completed',
        description: 'Mark the todo as completed',
        value: {
          completed: true,
        },
      },
      fullUpdate: {
        summary: 'Full update',
        description: 'Update title, description, and completion status',
        value: {
          title: 'Updated project documentation',
          description:
            'Write comprehensive documentation for the API endpoints including authentication, error handling, and usage examples',
          completed: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Todo updated successfully',
    type: Todo,
    schema: {
      example: {
        id: 1,
        userId: 1,
        title: 'Updated project documentation',
        description:
          'Write comprehensive documentation for the API endpoints including authentication, error handling, and usage examples',
        completed: true,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T14:45:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'title should not be empty',
          'completed must be a boolean value',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - trying to update another user's todo",
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only access your own todos',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Todo with ID 999 not found',
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req,
  ): Promise<Todo> {
    return this.todoService.update(+id, updateTodoDto, req.user.id);
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle todo completion status',
    description:
      'Toggles the completion status of a todo item (from completed to incomplete or vice versa).',
  })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo completion status toggled successfully',
    type: Todo,
    schema: {
      example: {
        id: 1,
        userId: 1,
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the API endpoints',
        completed: true,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T14:45:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - trying to toggle another user's todo",
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only access your own todos',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Todo with ID 999 not found',
      },
    },
  })
  async toggleComplete(@Param('id') id: string, @Request() req): Promise<Todo> {
    return this.todoService.toggleComplete(+id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a todo item',
    description:
      'Permanently deletes a todo item. Users can only delete their own todos.',
  })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 204,
    description: 'Todo deleted successfully',
    schema: {
      example: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - trying to delete another user's todo",
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only access your own todos',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Todo with ID 999 not found',
      },
    },
  })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.todoService.remove(+id, req.user.id);
  }
}
