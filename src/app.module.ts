import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BudgetHistoryModule } from './budget-history/budget-history.module';
import { BudgetModule } from './budget/budget.module';
import { CategoryModule } from './category/category.module';
import { ExpenseModule } from './expense/expense.module';
import { InventoryTransactionModule } from './inventory-transaction/inventory-transaction.module';
import { InvoiceItemModule } from './invoice-item/invoice-item.module';
import { InvoiceModule } from './invoice/invoice.module';
import { MessageModule } from './message/message.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { PaymentModule } from './payment/payment.module';
import { ProductModule } from './product/product.module';
import { ProfileModule } from './profile/profile.module';
import { ProfitModule } from './profit/profit.module';
import { ProjectModule } from './project/project.module';
import { ProjectUpdateModule } from './project-update/project-update.module';
import { ReceiptModule } from './receipt/receipt.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { RevenueModule } from './revenue/revenue.module';
import { SellModule } from './sell/sell.module';
import { ServiceModule } from './service/service.module';
import { SoldProductModule } from './sold-product/sold-product.module';
import { TaskModule } from './task/task.module';
import { TaxModule } from './tax/tax.module';
import { TodoModule } from './todo/todo.module';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    BudgetHistoryModule,
    BudgetModule,
    CategoryModule,
    ExpenseModule,
    InventoryTransactionModule,
    InvoiceItemModule,
    InvoiceModule,
    MessageModule,
    PaymentMethodModule,
    PaymentModule,
    ProductModule,
    ProfileModule,
    ProfitModule,
    ProjectModule,
    ProjectUpdateModule,
    ReceiptModule,
    RefreshTokenModule,
    RevenueModule,
    SellModule,
    ServiceModule,
    SoldProductModule,
    TaskModule,
    TaxModule,
    TodoModule,
    TransactionModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
