import { Injectable } from '@nestjs/common';
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
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        content: createNotificationDto.content,
        type: (createNotificationDto.type || NotificationType.INFO) as any,
      },
    });
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
    // Get all users
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    // Create notifications for all users
    const notifications = await Promise.all(
      users.map((user) => this.createForUser(user.id, content, type)),
    );

    return notifications;
  }

  async createForAdmins(
    content: string,
    type: NotificationType = NotificationType.INFO,
  ) {
    // Get all admin users
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    // Create notifications for admin users
    const notifications = await Promise.all(
      admins.map((admin) => this.createForUser(admin.id, content, type)),
    );

    return notifications;
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
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }



  // Delete old notifications (cleanup)
  async deleteOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        read: true,
      },
    });
  }

  async findAll(query?: any) {
    const { userId, type, read, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

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

    return {
      data: notifications,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: number, userId?: number) {
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
      throw new Error(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto, userId?: number) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const notification = await this.prisma.notification.findFirst({ where });
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        content: updateNotificationDto.content,
        type: updateNotificationDto.type as any,
        read: updateNotificationDto.read,
      },
    });
  }

  async remove(id: number, userId?: number) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const notification = await this.prisma.notification.findFirst({ where });
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async markAsRead(id: number, userId?: number) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const notification = await this.prisma.notification.findFirst({ where });
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async clearAll(userId: number) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
