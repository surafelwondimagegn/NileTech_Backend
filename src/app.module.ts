import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { ServiceModule } from './service/service.module';
import { ProjectModule } from './project/project.module';
import { InvoiceModule } from './invoice/invoice.module';
import { InvoiceItemModule } from './invoice-item/invoice-item.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { RevenueModule } from './revenue/revenue.module';
import { TransactionModule } from './transaction/transaction.module';
import { SoldProductModule } from './sold-product/sold-product.module';
import { SoldServiceModule } from './sold-service/sold-service.module';
import { InventoryTransactionModule } from './inventory-transaction/inventory-transaction.module';
import { BudgetModule } from './budget/budget.module';
import { BudgetHistoryModule } from './budget-history/budget-history.module';
import { ExpenseModule } from './expense/expense.module';
import { TaskModule } from './task/task.module';
import { TodoModule } from './todo/todo.module';
import { ProfitModule } from './profit/profit.module';
import { TaxModule } from './tax/tax.module';
import { ReceiptModule } from './receipt/receipt.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { ProjectHistoryModule } from './project-history/project-history.module';
import { ProjectMilestoneModule } from './project-milestone/project-milestone.module';
import { ProjectTimeEntryModule } from './project-time-entry/project-time-entry.module';
import { ProjectUpdateModule } from './project-update/project-update.module';
import { ProformaModule } from './proforma/proforma.module';
import { PayrollModule } from './payroll/payroll.module';
import { ProfileModule } from './profile/profile.module';
import { EmployeeModule } from './employee/employee.module';
import { SupplierModule } from './supplier/supplier.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    ServiceModule,
    ProjectModule,
    InvoiceModule,
    InvoiceItemModule,
    PaymentModule,
    PaymentMethodModule,
    RevenueModule,
    TransactionModule,
    SoldProductModule,
    SoldServiceModule,
    InventoryTransactionModule,
    BudgetModule,
    BudgetHistoryModule,
    ExpenseModule,
    TaskModule,
    TodoModule,
    ProfitModule,
    TaxModule,
    ReceiptModule,
    MessageModule,
    NotificationModule,
    ProjectHistoryModule,
    ProjectMilestoneModule,
    ProjectTimeEntryModule,
    ProjectUpdateModule,
    ProformaModule,
    PayrollModule,
    ProfileModule,
    EmployeeModule,
    SupplierModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
