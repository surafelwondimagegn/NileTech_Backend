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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new notification',
    description: 'Creates a new notification for a user.',
  })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: Notification,
  })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get notifications for authenticated user',
    description: 'Retrieves all notifications for the authenticated user.',
  })
  @ApiQuery({
    name: 'read',
    description: 'Filter by read status',
    required: false,
    type: 'boolean',
  })
  @ApiQuery({
    name: 'type',
    description: 'Filter by notification type',
    required: false,
    enum: ['INFO', 'WARNING', 'ALERT'],
  })
  @ApiResponse({
    status: 200,
    description: 'List of notifications retrieved successfully',
    type: [Notification],
  })
  async findAll(
    @Request() req,
    @Query('read') read?: string,
    @Query('type') type?: string,
  ): Promise<Notification[]> {
    const filters = {
      read: read !== undefined ? read === 'true' : undefined,
      type: type || undefined,
    };
    return this.notificationService.findAllForUser(req.user.id, filters);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description: 'Retrieves the count of unread notifications for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread notification count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  async getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a notification by ID',
    description: 'Retrieves a specific notification by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification found and retrieved successfully',
    type: Notification,
  })
  async findOne(@Param('id') id: string, @Request() req): Promise<Notification> {
    return this.notificationService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a notification',
    description: 'Updates an existing notification.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 1,
    type: 'number',
  })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
    type: Notification,
  })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Request() req,
  ): Promise<Notification> {
    return this.notificationService.update(+id, updateNotificationDto, req.user.id);
  }

  @Patch(':id/mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks a specific notification as read.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: Notification,
  })
  async markAsRead(@Param('id') id: string, @Request() req): Promise<Notification> {
    return this.notificationService.markAsRead(+id, req.user.id);
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all notifications for the authenticated user as read.',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 10 },
        message: { type: 'string', example: 'All notifications marked as read' },
      },
    },
  })
  async markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a notification',
    description: 'Permanently deletes a notification.',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully',
  })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.notificationService.remove(+id, req.user.id);
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Clear all notifications',
    description: 'Permanently deletes all notifications for the authenticated user.',
  })
  @ApiResponse({
    status: 204,
    description: 'All notifications cleared successfully',
  })
  async clearAll(@Request() req): Promise<void> {
    return this.notificationService.clearAll(req.user.id);
  }
}