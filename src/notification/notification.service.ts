import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateNotificationDto,
  NotificationType,
} from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

export interface NotificationData {
  userId: number;
  content: string;
  type?: NotificationType;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      this.logger.log(`Creating notification for user ${createNotificationDto.userId}: ${createNotificationDto.content}`);
      
      const notification = await this.prisma.notification.create({
        data: {
          userId: createNotificationDto.userId,
          content: createNotificationDto.content,
          type: (createNotificationDto.type || NotificationType.INFO) as any,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Notification created successfully with ID: ${notification.id}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  async createForUser(
    userId: number,
    content: string,
    type: NotificationType = NotificationType.INFO,
  ) {
    return this.create({
      userId,
      content,
      type,
    });
  }

  async createForAllUsers(
    content: string,
    type: NotificationType = NotificationType.INFO,
  ) {
    try {
      this.logger.log(`Creating notifications for all users: ${content}`);
      
      // Get all users
      const users = await this.prisma.user.findMany({
        select: { id: true },
      });

      // Create notifications for all users
      const notifications = await Promise.all(
        users.map((user) => this.createForUser(user.id, content, type)),
      );

      this.logger.log(`Created ${notifications.length} notifications for all users`);
      return notifications;
    } catch (error) {
      this.logger.error(`Failed to create notifications for all users: ${error.message}`);
      throw error;
    }
  }

  async createForAdmins(
    content: string,
    type: NotificationType = NotificationType.INFO,
  ) {
    try {
      this.logger.log(`Creating notifications for admins: ${content}`);
      
      // Get all admin users
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      // Create notifications for admin users
      const notifications = await Promise.all(
        admins.map((admin) => this.createForUser(admin.id, content, type)),
      );

      this.logger.log(`Created ${notifications.length} notifications for admins`);
      return notifications;
    } catch (error) {
      this.logger.error(`Failed to create notifications for admins: ${error.message}`);
      throw error;
    }
  }

  // Budget-related notifications
  async notifyBudgetCreated(
    budgetName: string,
    amount: number,
    createdBy?: number,
  ) {
    const content = `New budget "${budgetName}" created with amount $${amount}`;
    await this.createForAdmins(content, NotificationType.SUCCESS);
  }

  async notifyBudgetUpdated(
    budgetName: string,
    oldAmount: number,
    newAmount: number,
  ) {
    const content = `Budget "${budgetName}" updated: $${oldAmount} → $${newAmount}`;
    await this.createForAdmins(content, NotificationType.INFO);
  }

  async notifyBudgetDeleted(budgetName: string) {
    const content = `Budget "${budgetName}" has been deleted`;
    await this.createForAdmins(content, NotificationType.WARNING);
  }

  async notifyLowBudget(
    budgetName: string,
    currentAmount: number,
    threshold: number = 100,
  ) {
    const content = `Budget "${budgetName}" is running low: $${currentAmount} (below $${threshold})`;
    await this.createForAdmins(content, NotificationType.ALERT);
  }

  // Category-related notifications
  async notifyCategoryCreated(categoryName: string, createdBy?: number) {
    const content = `New category "${categoryName}" has been created`;
    await this.createForAdmins(content, NotificationType.SUCCESS);
  }

  async notifyCategoryUpdated(categoryName: string, oldName?: string) {
    const content = oldName
      ? `Category "${oldName}" has been renamed to "${categoryName}"`
      : `Category "${categoryName}" has been updated`;
    await this.createForAdmins(content, NotificationType.INFO);
  }

  async notifyCategoryDeleted(categoryName: string) {
    const content = `Category "${categoryName}" has been deleted`;
    await this.createForAdmins(content, NotificationType.WARNING);
  }

  // Product-related notifications
  async notifyProductCreated(
    productName: string,
    price: number,
    stock: number,
    createdBy?: number,
  ) {
    const content = `New product "${productName}" added: $${price} (Stock: ${stock})`;
    await this.createForAdmins(content, NotificationType.SUCCESS);
  }

  async notifyProductUpdated(productName: string, changes: string[]) {
    const content = `Product "${productName}" updated: ${changes.join(', ')}`;
    await this.createForAdmins(content, NotificationType.INFO);
  }

  async notifyProductDeleted(productName: string) {
    const content = `Product "${productName}" has been deleted`;
    await this.createForAdmins(content, NotificationType.WARNING);
  }

  async notifyLowStock(
    productName: string,
    currentStock: number,
    threshold: number = 10,
  ) {
    const content = `Low stock alert: "${productName}" has only ${currentStock} units remaining`;
    await this.createForAdmins(content, NotificationType.ALERT);
  }

  async notifyOutOfStock(productName: string) {
    const content = `Out of stock alert: "${productName}" is completely out of stock`;
    await this.createForAdmins(content, NotificationType.ALERT);
  }

  // Service-related notifications
  async notifyServiceCreated(
    serviceName: string,
    price: number,
    createdBy?: number,
  ) {
    const content = `New service "${serviceName}" added: $${price}`;
    await this.createForAdmins(content, NotificationType.SUCCESS);
  }

  async notifyServiceUpdated(serviceName: string, changes: string[]) {
    const content = `Service "${serviceName}" updated: ${changes.join(', ')}`;
    await this.createForAdmins(content, NotificationType.INFO);
  }

  async notifyServiceDeleted(serviceName: string) {
    const content = `Service "${serviceName}" has been deleted`;
    await this.createForAdmins(content, NotificationType.WARNING);
  }

  async notifyServiceDeactivated(serviceName: string) {
    const content = `Service "${serviceName}" has been deactivated`;
    await this.createForAdmins(content, NotificationType.WARNING);
  }

  // General notifications
  async notifySystemEvent(event: string, details?: string) {
    const content = details ? `${event}: ${details}` : event;
    await this.createForAdmins(content, NotificationType.INFO);
  }

  async notifyError(error: string, context?: string) {
    const content = context
      ? `Error in ${context}: ${error}`
      : `System error: ${error}`;
    await this.createForAdmins(content, NotificationType.ALERT);
  }

  // Get notifications for a user
  async getUserNotifications(userId: number, limit: number = 50) {
    try {
      this.logger.log(`Fetching notifications for user ${userId}, limit: ${limit}`);
      
      const notifications = await this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Found ${notifications.length} notifications for user ${userId}`);
      return notifications;
    } catch (error) {
      this.logger.error(`Failed to get user notifications: ${error.message}`);
      throw error;
    }
  }

  // Delete old notifications (cleanup)
  async deleteOldNotifications(daysOld: number = 30) {
    try {
      this.logger.log(`Deleting notifications older than ${daysOld} days`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          read: true,
        },
      });

      this.logger.log(`Deleted ${result.count} old notifications`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete old notifications: ${error.message}`);
      throw error;
    }
  }

  async findAll(query?: any) {
    try {
      const { userId, type, read, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      this.logger.log(`Fetching notifications with filters: userId=${userId}, type=${type}, read=${read}, page=${page}, limit=${limit}`);

      const where: any = {};
      if (userId) where.userId = parseInt(userId);
      if (type) where.type = type;
      if (read !== undefined) where.read = read === 'true';

      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.notification.count({ where }),
      ]);

      this.logger.log(`Found ${notifications.length} notifications out of ${total} total`);

      return {
        data: notifications,
        meta: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find notifications: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number, userId?: number) {
    try {
      this.logger.log(`Finding notification ${id} for user ${userId}`);
      
      const where: any = { id };
      if (userId) where.userId = userId;

      const notification = await this.prisma.notification.findFirst({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!notification) {
        this.logger.warn(`Notification ${id} not found`);
        throw new Error(`Notification with ID ${id} not found`);
      }

      this.logger.log(`Found notification ${id}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to find notification ${id}: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto, userId?: number) {
    try {
      this.logger.log(`Updating notification ${id} for user ${userId}`);
      
      const where: any = { id };
      if (userId) where.userId = userId;

      const notification = await this.prisma.notification.findFirst({ where });
      if (!notification) {
        this.logger.warn(`Notification ${id} not found for update`);
        throw new Error(`Notification with ID ${id} not found`);
      }

      const updatedNotification = await this.prisma.notification.update({
        where: { id },
        data: {
          content: updateNotificationDto.content,
          type: updateNotificationDto.type as any,
          read: updateNotificationDto.read,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Updated notification ${id}`);
      return updatedNotification;
    } catch (error) {
      this.logger.error(`Failed to update notification ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: number, userId?: number) {
    try {
      this.logger.log(`Removing notification ${id} for user ${userId}`);
      
      const where: any = { id };
      if (userId) where.userId = userId;

      const notification = await this.prisma.notification.findFirst({ where });
      if (!notification) {
        this.logger.warn(`Notification ${id} not found for deletion`);
        throw new Error(`Notification with ID ${id} not found`);
      }

      await this.prisma.notification.delete({
        where: { id },
      });

      this.logger.log(`Deleted notification ${id}`);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to remove notification ${id}: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(id: number, userId?: number) {
    try {
      this.logger.log(`Marking notification ${id} as read for user ${userId}`);
      
      const where: any = { id };
      if (userId) where.userId = userId;

      const notification = await this.prisma.notification.findFirst({ where });
      if (!notification) {
        this.logger.warn(`Notification ${id} not found for mark as read`);
        throw new Error(`Notification with ID ${id} not found`);
      }

      const updatedNotification = await this.prisma.notification.update({
        where: { id },
        data: { read: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Marked notification ${id} as read`);
      return updatedNotification;
    } catch (error) {
      this.logger.error(`Failed to mark notification ${id} as read: ${error.message}`);
      throw error;
    }
  }

  async markAllAsRead(userId: number) {
    try {
      this.logger.log(`Marking all notifications as read for user ${userId}`);
      
      const result = await this.prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async getUnreadCount(userId: number) {
    try {
      this.logger.log(`Getting unread count for user ${userId}`);
      
      const count = await this.prisma.notification.count({
        where: { userId, read: false },
      });

      this.logger.log(`User ${userId} has ${count} unread notifications`);
      return count;
    } catch (error) {
      this.logger.error(`Failed to get unread count for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async clearAll(userId: number) {
    try {
      this.logger.log(`Clearing all notifications for user ${userId}`);
      
      const result = await this.prisma.notification.deleteMany({
        where: { userId },
      });

      this.logger.log(`Cleared ${result.count} notifications for user ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to clear all notifications for user ${userId}: ${error.message}`);
      throw error;
    }
  }
}
