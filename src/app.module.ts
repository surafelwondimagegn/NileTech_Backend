import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ServiceModule } from './service/service.module';
import { ProjectModule } from './project/project.module';
import { ExpenseModule } from './expense/expense.module';
import { ProductModule } from './product/product.module';
import { InvoiceModule } from './invoice/invoice.module';
import { InvoiceItemModule } from './invoice-item/invoice-item.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { CategoryModule } from './category/category.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { PaymentModule } from './payment/payment.module';
import { TaskModule } from './task/task.module';
import { TodoModule } from './todo/todo.module';
import { BudgetModule } from './budget/budget.module';
import { RevenueModule } from './revenue/revenue.module';
import { ProfitModule } from './profit/profit.module';
import { InventoryTransactionModule } from './inventory-transaction/inventory-transaction.module';
import { TransactionModule } from './transaction/transaction.module';
import { ReceiptModule } from './receipt/receipt.module';
import { MessageModule } from './message/message.module';
import { BudgetHistoryModule } from './budget-history/budget-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UserModule, 
    ServiceModule, 
    ProjectModule, 
    ExpenseModule, 
    ProductModule, 
    InvoiceModule, 
    InvoiceItemModule, 
    RefreshTokenModule, 
    CategoryModule, 
    PaymentMethodModule, 
    PaymentModule, 
    TaskModule, 
    TodoModule, 
    BudgetModule, 
    RevenueModule, 
    ProfitModule, 
    InventoryTransactionModule, 
    TransactionModule, 
    ReceiptModule,
    MessageModule,
    BudgetHistoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
