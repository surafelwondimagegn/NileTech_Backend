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

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('NileTech API')
    .setDescription('API documentation for all routes in the NileTech system')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showResponseHeaders: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
    },
    customSiteTitle: 'NileTech API Documentation',
    customCss: `
      .swagger-ui .auth-wrapper {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: white;
        padding: 10px 0;
        border-bottom: 1px solid #ccc;
      }
      .swagger-ui .authorization__btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
      .swagger-ui .authorization__btn:hover {
        background: #45a049;
      }
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
