# Niletech Backend System

A comprehensive backend system for Niletech company built with NestJS, Prisma, and TypeScript. This system handles all aspects of a technology services company including projects, employees, payroll, invoicing, time tracking, and more.

## Features

### Core Business Modules
- **Company Management** - Multi-company support with comprehensive company profiles
- **Employee Management** - Full employee lifecycle with detailed profiles and HR data
- **Project Management** - Project tracking with status, progress, and client management
- **Time Tracking** - Project time entries with start/stop functionality
- **Invoicing** - Complete invoicing system with items, taxes, and payment tracking
- **Payroll** - Employee payroll management with deductions and bonuses
- **Notifications** - Real-time notification system with WebSocket support

### Service & Product Management
- **Services** - Service catalog with pricing and categorization
- **Products** - Product inventory with stock management
- **Categories** - Categorization system for products and services
- **Tax Management** - Flexible tax system with multiple tax types

### Financial Management
- **Revenue Tracking** - Revenue from projects, products, and services
- **Expense Management** - Project and budget-based expense tracking
- **Budget Management** - Budget creation and monitoring
- **Profit Analysis** - Profit calculation and reporting
- **Payment Processing** - Multiple payment methods and tracking

### Advanced Features
- **Proforma Invoices** - Proforma invoice generation and management
- **Receipts** - Receipt generation for payments
- **Inventory Transactions** - Stock movement tracking
- **Sold Products/Services** - Sales tracking with profit calculation
- **User Management** - Role-based access control
- **Authentication** - JWT-based authentication with refresh tokens

## Technology Stack

- **Framework**: NestJS
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Real-time**: WebSockets for notifications
- **Validation**: class-validator and class-transformer

## API Endpoints

### Core Modules
- `/companies` - Company management
- `/employees` - Employee management
- `/projects` - Project management
- `/project-time-entries` - Time tracking
- `/notifications` - Notification system
- `/invoices` - Invoice management
- `/payments` - Payment processing
- `/payrolls` - Payroll management

### Product & Service Management
- `/products` - Product catalog
- `/services` - Service catalog
- `/categories` - Category management
- `/inventory-transactions` - Stock movements

### Financial Management
- `/revenue` - Revenue tracking
- `/expenses` - Expense management
- `/budgets` - Budget management
- `/profits` - Profit analysis
- `/taxes` - Tax management

### Additional Features
- `/proformas` - Proforma invoices
- `/receipts` - Receipt management
- `/users` - User management
- `/auth` - Authentication endpoints

## Database Schema

The system uses a comprehensive database schema with the following main entities:

### Core Entities
- **Company** - Company information and settings
- **Employee** - Employee profiles with HR data
- **User** - System users with authentication
- **Project** - Project management with status tracking
- **ProjectTimeEntry** - Time tracking for projects

### Financial Entities
- **Invoice** - Invoice management with items
- **Payment** - Payment tracking and processing
- **Payroll** - Employee payroll records
- **Revenue** - Revenue tracking from multiple sources
- **Expense** - Expense management and tracking

### Product & Service Entities
- **Product** - Product catalog with inventory
- **Service** - Service catalog with pricing
- **SoldProduct** - Sales tracking for products
- **SoldService** - Sales tracking for services

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

3. **Environment Configuration**
   Create a `.env` file with:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/niletech"
   JWT_SECRET="your-jwt-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

5. **Access API Documentation**
   Visit `http://localhost:3000/api` for Swagger documentation

## Key Features Implemented

### Authentication & Authorization
- JWT-based authentication
- Refresh token mechanism
- Role-based access control (OWNER, MANAGER, DEVELOPER, USER, ADMIN, etc.)

### Real-time Features
- WebSocket notifications
- Real-time project updates
- Live notification system

### Business Logic
- Automatic profit calculation for sales
- Tax calculation and accumulation
- Budget tracking and alerts
- Stock management with low stock alerts
- Project progress tracking

### Data Validation
- Comprehensive DTO validation
- Type-safe database operations
- Error handling and logging

### API Documentation
- Complete Swagger/OpenAPI documentation
- Request/response examples
- Authentication requirements

## Architecture

The system follows NestJS best practices with:

- **Modular Architecture** - Each business domain in separate modules
- **Service Layer** - Business logic separated from controllers
- **DTO Pattern** - Data transfer objects for validation
- **Repository Pattern** - Database access through Prisma
- **Dependency Injection** - NestJS built-in DI container

## Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- SQL injection prevention through Prisma

## Performance Considerations

- Database indexing on foreign keys
- Efficient queries with Prisma includes
- Pagination support for large datasets
- Background job processing capability

## Future Enhancements

- File upload and storage
- Email notification system
- Advanced reporting and analytics
- Multi-currency support
- API rate limiting
- Audit logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Submit a pull request

## License

This project is proprietary to Niletech.
