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

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
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

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'NileTech Backend API')
    .setDescription(
      process.env.SWAGGER_DESCRIPTION || 
      'A comprehensive backend API for NileTech business management system with REST APIs and WebSocket support'
    )
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    ) 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Custom Swagger UI options for better organization
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha', // Sort tags alphabetically
      operationsSorter: 'alpha', // Sort operations alphabetically within each tag
      docExpansion: 'list', // Show all endpoints expanded
      filter: true, // Enable search/filter functionality
      showRequestHeaders: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'NileTech API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2.5em; margin: 20px 0; }
      .swagger-ui .info .description { font-size: 1.2em; margin: 10px 0; }
      .swagger-ui .opblock-tag { font-weight: bold; }
      .swagger-ui .opblock-summary { font-weight: 500; }
    `,
  });

  // Get port from environment or default to 3000
  const port = process.env.PORT || 3000;
  const wsPort = process.env.WS_PORT || 3001;

  // Start the application
  await app.listen(port);

  // Console output with server information
  console.log('\n🚀 NileTech Backend Server Started Successfully!');
  console.log('=' .repeat(60));
  console.log(`📡 Server URL: http://localhost:${port}`);
  console.log(`🔌 WebSocket Port: ${wsPort}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Helmet enabled`);
  console.log(`🌍 CORS: Enabled for ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log('=' .repeat(60));
  
  // API Endpoints summary (alphabetically ordered)
  console.log('\n📋 Available API Endpoints (Alphabetically Ordered):');
  console.log('├── Authentication: /api/v1/auth/*');
  console.log('├── Budget History: /api/v1/budget-history/*');
  console.log('├── Budgets: /api/v1/budgets/*');
  console.log('├── Categories: /api/v1/categories/*');
  console.log('├── Expenses: /api/v1/expenses/*');
  console.log('├── Inventory Transactions: /api/v1/inventory-transactions/*');
  console.log('├── Invoice Items: /api/v1/invoice-items/*');
  console.log('├── Invoices: /api/v1/invoices/*');
  console.log('├── Payments: /api/v1/payments/*');
  console.log('├── Payment Methods: /api/v1/payment-methods/*');
  console.log('├── Products: /api/v1/products/*');
  console.log('├── Profits: /api/v1/profits/*');
  console.log('├── Projects: /api/v1/projects/*');
  console.log('├── Receipts: /api/v1/receipts/*');
  console.log('├── Refresh Tokens: /api/v1/refresh-tokens/*');
  console.log('├── Revenues: /api/v1/revenues/*');
  console.log('├── Services: /api/v1/services/*');
  console.log('├── Tasks: /api/v1/tasks/*');
  console.log('├── Todos: /api/v1/todos/*');
  console.log('├── Transactions: /api/v1/transactions/*');
  console.log('└── Users: /api/v1/users/*');
  
  // WebSocket information
  console.log('\n🔌 WebSocket Namespaces:');
  console.log('├── Messages: /message');
  console.log('└── Notifications: /notification');
  
  console.log('\n💡 Tips:');
  console.log('• Use the Swagger docs to explore and test APIs');
  console.log('• WebSocket connections require JWT authentication');
  console.log('• All API endpoints are prefixed with /api/v1');
  console.log('• Check .env file for configuration options');
  console.log('• Endpoints are organized alphabetically in Swagger');
  console.log('\n🎯 Server is ready to handle requests!\n');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
