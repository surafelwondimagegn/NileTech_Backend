import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

export interface NotificationData {
  userId: number;
  content: string;
  type?: string;
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async createForUser(
    userId: number,
    content: string,
    type: string = 'INFO',
  ) {
    return this.create({
      userId,
      content,
      type,
    });
  }

  async createForAllUsers(
    content: string,
    type: string = 'INFO',
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
    type: string = 'INFO',
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
    await this.createForAdmins(content, 'INFO');
  }

  async notifyBudgetUpdated(
    budgetName: string,
    oldAmount: number,
    newAmount: number,
  ) {
    const content = `Budget "${budgetName}" updated: $${oldAmount} → $${newAmount}`;
    await this.createForAdmins(content, "INFO");
  }

  async notifyBudgetDeleted(budgetName: string) {
    const content = `Budget "${budgetName}" has been deleted`;
    await this.createForAdmins(content, "WARNING");
  }

  async notifyLowBudget(
    budgetName: string,
    currentAmount: number,
    threshold: number = 100,
  ) {
    const content = `Budget "${budgetName}" is running low: $${currentAmount} (below $${threshold})`;
    await this.createForAdmins(content, "ALERT");
  }

  // Category-related notifications
  async notifyCategoryCreated(categoryName: string, createdBy?: number) {
    const content = `New category "${categoryName}" has been created`;
    await this.createForAdmins(content, "INFO");
  }

  async notifyCategoryUpdated(categoryName: string, oldName?: string) {
    const content = oldName
      ? `Category "${oldName}" has been renamed to "${categoryName}"`
      : `Category "${categoryName}" has been updated`;
    await this.createForAdmins(content, "INFO");
  }

  async notifyCategoryDeleted(categoryName: string) {
    const content = `Category "${categoryName}" has been deleted`;
    await this.createForAdmins(content, "WARNING");
  }

  // Product-related notifications
  async notifyProductCreated(
    productName: string,
    price: number,
    stock: number,
    createdBy?: number,
  ) {
    const content = `New product "${productName}" added: $${price} (Stock: ${stock})`;
    await this.createForAdmins(content, "INFO");
  }

  async notifyProductUpdated(productName: string, changes: string[]) {
    const content = `Product "${productName}" updated: ${changes.join(', ')}`;
    await this.createForAdmins(content, "INFO");
  }

  async notifyProductDeleted(productName: string) {
    const content = `Product "${productName}" has been deleted`;
    await this.createForAdmins(content, "WARNING");
  }

  async notifyLowStock(
    productName: string,
    currentStock: number,
    threshold: number = 10,
  ) {
    const content = `Low stock alert: "${productName}" has only ${currentStock} units remaining`;
    await this.createForAdmins(content, "ALERT");
  }

  async notifyOutOfStock(productName: string) {
    const content = `Out of stock alert: "${productName}" is completely out of stock`;
    await this.createForAdmins(content, "ALERT");
  }

  // Service-related notifications
  async notifyServiceCreated(
    serviceName: string,
    price: number,
    createdBy?: number,
  ) {
    const content = `New service "${serviceName}" added: $${price}`;
    await this.createForAdmins(content, "INFO");
  }

  async notifyServiceUpdated(serviceName: string, changes: string[]) {
    const content = `Service "${serviceName}" updated: ${changes.join(', ')}`;
    await this.createForAdmins(content, "INFO");
  }

  async notifyServiceDeleted(serviceName: string) {
    const content = `Service "${serviceName}" has been deleted`;
    await this.createForAdmins(content, "WARNING");
  }

  async notifyServiceDeactivated(serviceName: string) {
    const content = `Service "${serviceName}" has been deactivated`;
    await this.createForAdmins(content, "WARNING");
  }

  // General notifications
  async notifySystemEvent(event: string, details?: string) {
    const content = details ? `${event}: ${details}` : event;
    await this.createForAdmins(content, "INFO");
  }

  async notifyError(error: string, context?: string) {
    const content = context
      ? `Error in ${context}: ${error}`
      : `System error: ${error}`;
    await this.createForAdmins(content, "ALERT");
  }

  // Get notifications for a user
  async getUserNotifications(userId: number, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Legacy methods for backward compatibility
  async markAsReadLegacy(notificationId: number) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsReadLegacy(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCountLegacy(userId: number) {
    return this.prisma.notification.count({
      where: { userId, read: false },
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

  async findAll() {
    return this.prisma.notification.findMany({
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
  }

  async remove(id: number, userId?: number) {
    const notification = await this.findOne(id, userId);
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async findAllForUser(userId: number, filters?: { read?: boolean; type?: string }) {
    const where: any = { userId };
    
    if (filters?.read !== undefined) {
      where.read = filters.read;
    }
    
    if (filters?.type) {
      where.type = filters.type;
    }

    return this.prisma.notification.findMany({
      where,
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
    });
  }

  async findOne(id: number, userId?: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
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
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (userId && notification.userId !== userId) {
      throw new ForbiddenException('You can only access your own notifications');
    }

    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto, userId?: number) {
    await this.findOne(id, userId);
    
    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  async markAsRead(id: number, userId: number) {
    await this.findOne(id, userId);
    
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return {
      count: result.count,
      message: 'All notifications marked as read',
    };
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { count };
  }

  async clearAll(userId: number) {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
