import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());

  // Global request logging middleware
  

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
      process.env.CORS_ORIGIN,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Enhanced Swagger setup with alphabetical organization
  const config = new DocumentBuilder()
    .setTitle('🚀 NileTech API')
    .setDescription(`
# Welcome to NileTech API Documentation! 🎯

## 📋 Overview
This is the comprehensive API documentation for the NileTech business management system. Our API provides powerful endpoints for managing products, services, projects, finances, and more.

## 🔐 Authentication
Most endpoints require JWT authentication. Use the **Authorize** button above to set your Bearer token.

## 📚 API Categories
Our API is organized into the following categories:

### 🔐 **Authentication & Users**
- **auth** - User authentication, registration, and profile management
- **user** - User management and operations
- **profile** - User profile management

### 🏢 **Business Management**
- **company** - Company information and settings
- **employee** - Employee management
- **supplier** - Supplier management

### 📦 **Inventory & Products**
- **product** - Product catalog and inventory management
- **category** - Product categories
- **inventory-transaction** - Stock movements and transactions
- **sold-product** - Sold products tracking

### 🛠️ **Services & Projects**
- **service** - Service offerings
- **sold-service** - Sold services tracking
- **project** - Project management
- **project-milestone** - Project milestones
- **project-time-entry** - Time tracking
- **project-update** - Project updates
- **project-history** - Project history

### 💰 **Financial Management**
- **budget** - Budget planning and management
- **budget-history** - Budget history tracking
- **expense** - Expense tracking
- **revenue** - Revenue tracking
- **profit** - Profit analysis
- **tax** - Tax management

### 📄 **Billing & Payments**
- **invoice** - Invoice management
- **invoice-item** - Invoice line items
- **payment** - Payment processing
- **payment-method** - Payment methods
- **proforma** - Proforma invoices
- **receipt** - Receipt management

### 📊 **Communication & Notifications**
- **message** - Messaging system
- **notification** - Notification system

### ✅ **Task Management**
- **task** - Task management
- **todo** - Todo lists

## 🚀 Getting Started
1. **Register** a new account using the /auth/register endpoint
2. **Login** to get your JWT token using /auth/login
3. **Authorize** your requests using the Authorize button
4. **Explore** the API endpoints organized by category

## 🔧 Development Features
- **Try it out** - Test endpoints directly from the documentation
- **Request/Response examples** - See real examples for each endpoint
- **Schema validation** - All requests are validated automatically
- **Error handling** - Comprehensive error responses
- **Real-time updates** - WebSocket support for real-time features

## 📈 API Status
- **Version**: 1.0
- **Environment**: Development
- **Base URL**: /api/v1
- **Documentation**: /api/docs

---
*Built with ❤️ by the NileTech Team*
    `)
    .setVersion('1.0.0')
    .setContact(
      'NileTech Team',
      'https://niletech.com',
      'support@niletech.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.niletech.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token here. Get it from /auth/login endpoint.',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('app', '🏠 Application')
    .addTag('auth', '🔐 Authentication & Authorization')
    .addTag('budget', '💰 Budget Management')
    .addTag('budget-history', '📊 Budget History')
    .addTag('category', '📂 Category Management')
    .addTag('company', '🏢 Company Management')
    .addTag('employee', '👥 Employee Management')
    .addTag('expense', '💸 Expense Tracking')
    .addTag('invoice', '📄 Invoice Management')
    .addTag('invoice-item', '📋 Invoice Items')
    .addTag('inventory-transaction', '📊 Inventory Transactions')
    .addTag('message', '💬 Messaging')
    .addTag('notification', '🔔 Notifications')
    .addTag('payment', '💳 Payment Processing')
    .addTag('payment-method', '💳 Payment Methods')
    .addTag('payroll', '👥 Payroll Management')
    .addTag('product', '📦 Product Management')
    .addTag('profit', '📈 Profit Analysis')
    .addTag('project', '📋 Project Management')
    .addTag('project-history', '📚 Project History')
    .addTag('project-milestone', '🎯 Project Milestones')
    .addTag('project-time-entry', '⏱️ Time Tracking')
    .addTag('project-update', '📝 Project Updates')
    .addTag('profile', '👤 User Profiles')
    .addTag('proforma', '📋 Proforma Invoices')
    .addTag('receipt', '🧾 Receipt Management')
    .addTag('refresh-token', '🔄 Token Management')
    .addTag('revenue', '💵 Revenue Tracking')
    .addTag('sell', '💰 Sales Management')
    .addTag('service', '🛠️ Service Management')
    .addTag('sold-product', '💰 Sold Products')
    .addTag('sold-service', '💼 Sold Services')
    .addTag('supplier', '🏭 Supplier Management')
    .addTag('task', '✅ Task Management')
    .addTag('tax', '🏛️ Tax Management')
    .addTag('todo', '📝 Todo Lists')
    .addTag('transaction', '💱 Transactions')
    .addTag('user', '👤 User Management')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Enhanced Swagger UI setup with better developer experience
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showResponseHeaders: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      syntaxHighlight: {
        activated: true,
        theme: 'monokai'
      },
      requestInterceptor: (req) => {
        // Add custom headers if needed
        return req;
      },
      responseInterceptor: (res) => {
        // Process response if needed
        return res;
      },
      onComplete: () => {
        console.log('🎉 Swagger documentation loaded successfully!');
      },
    },
    customSiteTitle: '🚀 NileTech API Documentation',
    customCss: `
      /* Modern and beautiful Swagger UI styling */
      .swagger-ui {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      /* Header styling */
      .swagger-ui .topbar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px 0;
      }
      
      .swagger-ui .topbar .download-url-wrapper {
        display: none;
      }
      
      /* Authorization section */
      .swagger-ui .auth-wrapper {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 15px 0;
        border-bottom: 2px solid #e0e0e0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      .swagger-ui .authorization__btn {
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
      }
      
      .swagger-ui .authorization__btn:hover {
        background: linear-gradient(135deg, #45a049 0%, #4CAF50 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      }
      
      /* Operation blocks */
      .swagger-ui .opblock {
        border-radius: 12px;
        margin: 10px 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
      }
      
      .swagger-ui .opblock:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }
      
      .swagger-ui .opblock.opblock-get {
        border-color: #61affe;
        background: rgba(97, 175, 254, 0.1);
      }
      
      .swagger-ui .opblock.opblock-post {
        border-color: #49cc90;
        background: rgba(73, 204, 144, 0.1);
      }
      
      .swagger-ui .opblock.opblock-put {
        border-color: #fca130;
        background: rgba(252, 161, 48, 0.1);
      }
      
      .swagger-ui .opblock.opblock-delete {
        border-color: #f93e3e;
        background: rgba(249, 62, 62, 0.1);
      }
      
      .swagger-ui .opblock.opblock-patch {
        border-color: #50e3c2;
        background: rgba(80, 227, 194, 0.1);
      }
      
      /* Operation summary */
      .swagger-ui .opblock-summary-method {
        border-radius: 6px;
        font-weight: 600;
        min-width: 80px;
      }
      
      .swagger-ui .opblock-summary-description {
        font-weight: 500;
        color: #333;
      }
      
      /* Try it out button */
      .swagger-ui .try-out__btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      .swagger-ui .try-out__btn:hover {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        transform: translateY(-1px);
      }
      
      /* Execute button */
      .swagger-ui .execute-wrapper .btn.execute {
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        border: none;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      .swagger-ui .execute-wrapper .btn.execute:hover {
        background: linear-gradient(135deg, #45a049 0%, #4CAF50 100%);
        transform: translateY(-1px);
      }
      
      /* Response section */
      .swagger-ui .responses-wrapper {
        border-radius: 8px;
        overflow: hidden;
      }
      
      .swagger-ui .responses-table {
        border-radius: 8px;
      }
      
      /* Code blocks */
      .swagger-ui .microlight {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 12px;
        font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
      }
      
      /* Models section */
      .swagger-ui .model {
        border-radius: 8px;
        overflow: hidden;
      }
      
      .swagger-ui .model-box {
        border-radius: 8px;
      }
      
      /* Sidebar */
      .swagger-ui .sidebar {
        background: #f8f9fa;
        border-right: 1px solid #e0e0e0;
      }
      
      .swagger-ui .sidebar .sidebar-item {
        border-radius: 6px;
        margin: 2px 0;
      }
      
      /* Search */
      .swagger-ui .filter input {
        border-radius: 6px;
        border: 2px solid #e0e0e0;
        transition: all 0.3s ease;
      }
      
      .swagger-ui .filter input:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      
      /* Loading animation */
      .swagger-ui .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
      }
      
      .swagger-ui .loading-container::after {
        content: '';
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Success/Error messages */
      .swagger-ui .response-col_status {
        font-weight: 600;
      }
      
      .swagger-ui .response-col_status.response-200 {
        color: #4CAF50;
      }
      
      .swagger-ui .response-col_status.response-400,
      .swagger-ui .response-col_status.response-401,
      .swagger-ui .response-col_status.response-404,
      .swagger-ui .response-col_status.response-500 {
        color: #f44336;
      }
      
      /* Custom scrollbar */
      .swagger-ui ::-webkit-scrollbar {
        width: 8px;
      }
      
      .swagger-ui ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      
      .swagger-ui ::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
      }
      
      .swagger-ui ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .swagger-ui .opblock {
          margin: 5px 0;
        }
        
        .swagger-ui .opblock-summary {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .swagger-ui .opblock-summary-method {
          margin-bottom: 8px;
        }
      }
    `,
    customJs: `
      // Custom JavaScript for enhanced functionality
      window.addEventListener('load', function() {
        // Add loading animation
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-container';
        loadingContainer.innerHTML = '<div>Loading API Documentation...</div>';
        document.body.appendChild(loadingContainer);
        
        // Remove loading after content loads
        setTimeout(() => {
          const loadingContainer = document.querySelector('.loading-container');
          if (loadingContainer) {
            loadingContainer.remove();
          }
        }, 1000);
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
          // Ctrl/Cmd + K to focus search
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.filter input');
            if (searchInput) {
              searchInput.focus();
            }
          }
          
          // Escape to close modals
          if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
              if (modal.style.display === 'block') {
                modal.style.display = 'none';
              }
            });
          }
        });
        
        // Add tooltips for better UX
        const operationBlocks = document.querySelectorAll('.opblock');
        operationBlocks.forEach(block => {
          const method = block.querySelector('.opblock-summary-method');
          if (method) {
            method.title = 'Click to expand operation details';
          }
        });
        
        // Auto-expand first operation in each tag
        setTimeout(() => {
          const tagSections = document.querySelectorAll('.opblock-tag-section');
          tagSections.forEach(section => {
            const firstOperation = section.querySelector('.opblock');
            if (firstOperation) {
              const expandBtn = firstOperation.querySelector('.opblock-summary');
              if (expandBtn) {
                expandBtn.click();
              }
            }
          });
        }, 500);
      });
      
      // Console welcome message
      console.log('%c🚀 Welcome to NileTech API Documentation!', 'color: #667eea; font-size: 20px; font-weight: bold;');
      console.log('%c💡 Tip: Use Ctrl/Cmd + K to quickly search endpoints', 'color: #4CAF50; font-size: 14px;');
      console.log('%c🔐 Don\'t forget to authorize your requests!', 'color: #fca130; font-size: 14px;');
    `,
  });

  // Get port from environment or default to 3000
  const port = process.env.PORT || 3000;
  const wsPort = process.env.WS_PORT || 3001;

  // Start the application
  await app.listen(port);

  // Console output with server information
  console.log('\n🚀 NileTech Backend Server Started Successfully!');
  console.log('='.repeat(60));
  console.log(`📡 Server URL: http://localhost:${port}`);
  console.log(`🔌 WebSocket Port: ${wsPort}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Helmet enabled`);
  console.log(
    `🌍 CORS: Enabled for http://localhost:3000, http://localhost:5173, http://localhost:3001`,
  );
  console.log('='.repeat(60));
  console.log('\n🎯 Server is ready to handle requests!\n');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
