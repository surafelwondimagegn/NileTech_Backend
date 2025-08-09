import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notification')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    try {
      // If no userId is provided, use the authenticated user's ID
      if (!createNotificationDto.userId) {
        createNotificationDto.userId = req.user.id;
      }
      
      const notification = await this.notificationService.create(createNotificationDto);
      return notification;
    } catch (error) {
      throw new HttpException(
        `Failed to create notification: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the authenticated user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['INFO', 'WARNING', 'ALERT', 'SUCCESS'] })
  @ApiQuery({ name: 'read', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async findAll(@Query() query: any, @Request() req) {
    try {
      // Add user filter to only show notifications for the authenticated user
      query.userId = req.user.id;
      const result = await this.notificationService.findAll(query);
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch notifications: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notification by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    try {
      const notification = await this.notificationService.findOne(+id, req.user.id);
      return notification;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch notification: ${error.message}`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Request() req) {
    try {
      const notification = await this.notificationService.update(+id, updateNotificationDto, req.user.id);
      return notification;
    } catch (error) {
      throw new HttpException(
        `Failed to update notification: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async remove(@Param('id') id: string, @Request() req) {
    try {
      await this.notificationService.remove(+id, req.user.id);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to delete notification: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    try {
      const notification = await this.notificationService.markAsRead(+id, req.user.id);
      return notification;
    } catch (error) {
      throw new HttpException(
        `Failed to mark notification as read: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req) {
    try {
      const result = await this.notificationService.markAllAsRead(req.user.id);
      return { 
        message: 'All notifications marked as read',
        updatedCount: result.count 
      };
    } catch (error) {
      throw new HttpException(
        `Failed to mark all notifications as read: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req) {
    try {
      const count = await this.notificationService.getUnreadCount(req.user.id);
      return { count };
    } catch (error) {
      throw new HttpException(
        `Failed to get unread count: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Clear all notifications for the user' })
  @ApiResponse({ status: 200, description: 'All notifications cleared' })
  async clearAll(@Request() req) {
    try {
      const result = await this.notificationService.clearAll(req.user.id);
      return { 
        message: 'All notifications cleared',
        deletedCount: result.count 
      };
    } catch (error) {
      throw new HttpException(
        `Failed to clear all notifications: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin endpoints for testing and management
  @Post('test/sample-data')
  @ApiOperation({ summary: 'Create sample notifications for testing (Admin only)' })
  @ApiResponse({ status: 201, description: 'Sample notifications created' })
  async createSampleData(@Request() req) {
    try {
      // Check if user is admin
      if (req.user.role !== 'ADMIN') {
        throw new HttpException('Admin access required', HttpStatus.FORBIDDEN);
      }

      const sampleNotifications = [
        {
          userId: req.user.id,
          content: 'Welcome to NileTech! Your account has been successfully created.',
          type: 'SUCCESS'
        },
        {
          userId: req.user.id,
          content: 'New product "Premium Nail Polish" has been added to inventory.',
          type: 'INFO'
        },
        {
          userId: req.user.id,
          content: 'Low stock alert: "Nail Files" has only 5 units remaining.',
          type: 'WARNING'
        },
        {
          userId: req.user.id,
          content: 'System maintenance scheduled for tomorrow at 2:00 AM.',
          type: 'ALERT'
        },
        {
          userId: req.user.id,
          content: 'Invoice #INV-001 has been paid successfully.',
          type: 'SUCCESS'
        },
        {
          userId: req.user.id,
          content: 'New project "Kitchen Renovation" has been assigned to you.',
          type: 'INFO'
        },
        {
          userId: req.user.id,
          content: 'Payment received: $1,250 for Project #PRJ-2024-001',
          type: 'SUCCESS'
        },
        {
          userId: req.user.id,
          content: 'Budget "Marketing Expenses" is running low: $150 remaining.',
          type: 'WARNING'
        }
      ];

      const createdNotifications = await Promise.all(
        sampleNotifications.map(notification => 
          this.notificationService.create(notification)
        )
      );

      return {
        message: 'Sample notifications created successfully',
        count: createdNotifications.length,
        notifications: createdNotifications
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create sample data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Simple test endpoint for any user
  @Post('test/create-sample')
  @ApiOperation({ summary: 'Create sample notifications for current user' })
  @ApiResponse({ status: 201, description: 'Sample notifications created' })
  async createSampleForCurrentUser(@Request() req) {
    try {
      const sampleNotifications = [
        {
          userId: req.user.id,
          content: 'Welcome to NileTech! Your account has been successfully created.',
          type: 'SUCCESS'
        },
        {
          userId: req.user.id,
          content: 'New product "Premium Nail Polish" has been added to inventory.',
          type: 'INFO'
        },
        {
          userId: req.user.id,
          content: 'Low stock alert: "Nail Files" has only 5 units remaining.',
          type: 'WARNING'
        },
        {
          userId: req.user.id,
          content: 'System maintenance scheduled for tomorrow at 2:00 AM.',
          type: 'ALERT'
        },
        {
          userId: req.user.id,
          content: 'Invoice #INV-001 has been paid successfully.',
          type: 'SUCCESS'
        },
        {
          userId: req.user.id,
          content: 'New project "Kitchen Renovation" has been assigned to you.',
          type: 'INFO'
        },
        {
          userId: req.user.id,
          content: 'Payment received: $1,250 for Project #PRJ-2024-001',
          type: 'SUCCESS'
        },
        {
          userId: req.user.id,
          content: 'Budget "Marketing Expenses" is running low: $150 remaining.',
          type: 'WARNING'
        }
      ];

      const createdNotifications = await Promise.all(
        sampleNotifications.map(notification => 
          this.notificationService.create(notification)
        )
      );

      return {
        message: 'Sample notifications created successfully for current user',
        count: createdNotifications.length,
        notifications: createdNotifications
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create sample data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get notification statistics for the user' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getNotificationStats(@Request() req) {
    try {
      const [notifications, unreadCount] = await Promise.all([
        this.notificationService.findAll({ userId: req.user.id, limit: 1000 }),
        this.notificationService.getUnreadCount(req.user.id)
      ]);

      const byType = {
        INFO: 0,
        SUCCESS: 0,
        WARNING: 0,
        ALERT: 0,
      };

      notifications.data.forEach(notification => {
        byType[notification.type]++;
      });

      return {
        total: notifications.meta.total,
        unread: unreadCount,
        read: notifications.meta.total - unreadCount,
        byType
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get notification stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}