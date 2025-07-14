const fs = require('fs');
const path = require('path');

// Schema-based configuration
const schemaConfig = {
  // REST API entities
  rest: [
    {
      name: 'user',
      plural: 'users',
      service: true,
      controller: true,
      dto: ['create', 'update', 'login', 'register'],
      relations: ['projects', 'refreshTokens', 'sentMessages', 'receivedMessages', 'notifications', 'todos', 'tasksAssigned', 'Transaction']
    },
    {
      name: 'service',
      plural: 'services',
      service: true,
      controller: true,
      dto: ['create', 'update'],
      relations: ['projects', 'invoiceItems', 'category']
    },
    {
      name: 'project',
      plural: 'projects',
      service: true,
      controller: true,
      dto: ['create', 'update', 'assign'],
      relations: ['service', 'assignedTo', 'expenses', 'invoices', 'Task', 'Budget', 'Revenue', 'Profit']
    },
    {
      name: 'expense',
      plural: 'expenses',
      service: true,
      controller: true,
      dto: ['create', 'update'],
      relations: ['project']
    },
    {
      name: 'product',
      plural: 'products',
      service: true,
      controller: true,
      dto: ['create', 'update', 'stock'],
      relations: ['category', 'invoiceItems', 'transactions', 'budget']
    },
    {
      name: 'invoice',
      plural: 'invoices',
      service: true,
      controller: true,
      dto: ['create', 'update', 'send'],
      relations: ['project', 'items', 'Payment', 'Revenue']
    },
    {
      name: 'invoice-item',
      plural: 'invoice-items',
      service: true,
      controller: true,
      dto: ['create', 'update'],
      relations: ['invoice', 'product', 'service']
    },
    {
      name: 'refresh-token',
      plural: 'refresh-tokens',
      service: true,
      controller: false, // Handled by auth
      dto: ['create', 'validate'],
      relations: ['user']
    },
    {
      name: 'category',
      plural: 'categories',
      service: true,
      controller: true,
      dto: ['create', 'update'],
      relations: ['products', 'services']
    },
    {
      name: 'payment-method',
      plural: 'payment-methods',
      service: true,
      controller: true,
      dto: ['create', 'update'],
      relations: ['payments']
    },
    {
      name: 'payment',
      plural: 'payments',
      service: true,
      controller: true,
      dto: ['create', 'update', 'process'],
      relations: ['invoice', 'method', 'Transaction', 'Receipt']
    },
    {
      name: 'task',
      plural: 'tasks',
      service: true,
      controller: true,
      dto: ['create', 'update', 'assign'],
      relations: ['project', 'assignedTo']
    },
    {
      name: 'todo',
      plural: 'todos',
      service: true,
      controller: true,
      dto: ['create', 'update', 'complete'],
      relations: ['user']
    },
    {
      name: 'budget',
      plural: 'budgets',
      service: true,
      controller: true,
      dto: ['create', 'update'],
      relations: ['project', 'products']
    },
    {
      name: 'revenue',
      plural: 'revenues',
      service: true,
      controller: true,
      dto: ['create', 'update'],
      relations: ['project', 'invoice']
    },
    {
      name: 'profit',
      plural: 'profits',
      service: true,
      controller: true,
      dto: ['create', 'calculate'],
      relations: ['project']
    },
    {
      name: 'inventory-transaction',
      plural: 'inventory-transactions',
      service: true,
      controller: true,
      dto: ['create', 'adjust'],
      relations: ['product']
    },
    {
      name: 'transaction',
      plural: 'transactions',
      service: true,
      controller: true,
      dto: ['create', 'update'],
      relations: ['user', 'payment']
    },
    {
      name: 'receipt',
      plural: 'receipts',
      service: true,
      controller: true,
      dto: ['create', 'generate'],
      relations: ['payment']
    }
  ],
  
  // WebSocket entities
  websocket: [
    {
      name: 'message',
      plural: 'messages',
      service: true,
      gateway: true,
      dto: ['send', 'read'],
      relations: ['sender', 'receiver']
    },
    {
      name: 'notification',
      plural: 'notifications',
      service: true,
      gateway: true,
      dto: ['create', 'mark-read'],
      relations: ['user']
    }
  ]
};

// Template generators
const templates = {
  service: (entity) => `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Create${entity.capitalName}Dto } from './dto/create-${entity.name}.dto';
import { Update${entity.capitalName}Dto } from './dto/update-${entity.name}.dto';

@Injectable()
export class ${entity.capitalName}Service {
  constructor(private prisma: PrismaService) {}

  async create(create${entity.capitalName}Dto: Create${entity.capitalName}Dto) {
    return this.prisma.${entity.name}.create({
      data: create${entity.capitalName}Dto,
    });
  }

  async findAll() {
    return this.prisma.${entity.name}.findMany({
      include: {
        // Add your relations here
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.${entity.name}.findUnique({
      where: { id },
      include: {
        // Add your relations here
      },
    });
  }

  async update(id: number, update${entity.capitalName}Dto: Update${entity.capitalName}Dto) {
    return this.prisma.${entity.name}.update({
      where: { id },
      data: update${entity.capitalName}Dto,
    });
  }

  async remove(id: number) {
    return this.prisma.${entity.name}.delete({
      where: { id },
    });
  }
}`,

  controller: (entity) => `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ${entity.capitalName}Service } from './${entity.name}.service';
import { Create${entity.capitalName}Dto } from './dto/create-${entity.name}.dto';
import { Update${entity.capitalName}Dto } from './dto/update-${entity.name}.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('${entity.plural}')
@UseGuards(JwtAuthGuard)
export class ${entity.capitalName}Controller {
  constructor(private readonly ${entity.name}Service: ${entity.capitalName}Service) {}

  @Post()
  create(@Body() create${entity.capitalName}Dto: Create${entity.capitalName}Dto) {
    return this.${entity.name}Service.create(create${entity.capitalName}Dto);
  }

  @Get()
  findAll() {
    return this.${entity.name}Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.${entity.name}Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update${entity.capitalName}Dto: Update${entity.capitalName}Dto) {
    return this.${entity.name}Service.update(+id, update${entity.capitalName}Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.${entity.name}Service.remove(+id);
  }
}`,

  gateway: (entity) => `import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ${entity.capitalName}Service } from './${entity.name}.service';
import { Send${entity.capitalName}Dto } from './dto/send-${entity.name}.dto';

@WebSocketGateway({ namespace: '/${entity.name}', cors: true })
@UseGuards(WsJwtGuard)
export class ${entity.capitalName}Gateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly ${entity.name}Service: ${entity.capitalName}Service) {}

  @SubscribeMessage('${entity.name}:send')
  async handleSend(@MessageBody() dto: Send${entity.capitalName}Dto, @ConnectedSocket() client: Socket) {
    const ${entity.name} = await this.${entity.name}Service.create(dto);
    
    // Emit to specific user or room
    this.server.to(\`user:\${dto.receiverId}\`).emit('${entity.name}:new', ${entity.name});
    
    return { status: 'ok', ${entity.name} };
  }

  @SubscribeMessage('${entity.name}:read')
  async handleRead(@MessageBody() data: { id: number }, @ConnectedSocket() client: Socket) {
    await this.${entity.name}Service.markAsRead(data.id);
    return { status: 'ok' };
  }
}`,

  module: (entity) => `import { Module } from '@nestjs/common';
import { ${entity.capitalName}Service } from './${entity.name}.service';
${entity.controller ? `import { ${entity.capitalName}Controller } from './${entity.name}.controller';` : ''}
${entity.gateway ? `import { ${entity.capitalName}Gateway } from './${entity.name}.gateway';` : ''}
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [${entity.controller ? entity.capitalName + 'Controller' : ''}],
  providers: [${entity.capitalName}Service${entity.gateway ? ', ' + entity.capitalName + 'Gateway' : ''}],
  exports: [${entity.capitalName}Service],
})
export class ${entity.capitalName}Module {}`,

  createDto: (entity) => `import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class Create${entity.capitalName}Dto {
  // Add your validation properties here
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}`,

  updateDto: (entity) => `import { PartialType } from '@nestjs/mapped-types';
import { Create${entity.capitalName}Dto } from './create-${entity.name}.dto';

export class Update${entity.capitalName}Dto extends PartialType(Create${entity.capitalName}Dto) {}`,

  sendDto: (entity) => `import { IsString, IsNumber, IsOptional } from 'class-validator';

export class Send${entity.capitalName}Dto {
  @IsString()
  content: string;

  @IsNumber()
  receiverId: number;

  @IsOptional()
  @IsString()
  additionalData?: string;
}`,

  index: (entities) => `// Auto-generated index file
${entities.map(entity => `export * from './${entity.name}.module';`).join('\n')}`
};

// Utility functions
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`Created file: ${filePath}`);
}

// Main generation function
function generateStructure() {
  const baseDir = 'src';
  const modulesDir = path.join(baseDir, 'modules');
  
  // Create base directories
  createDirectory(baseDir);
  createDirectory(modulesDir);
  
  // Generate REST modules
  schemaConfig.rest.forEach(entity => {
    const entityConfig = {
      ...entity,
      capitalName: capitalize(entity.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase()))
    };
    
    const moduleDir = path.join(modulesDir, entity.name);
    const dtoDir = path.join(moduleDir, 'dto');
    
    createDirectory(moduleDir);
    createDirectory(dtoDir);
    
    // Generate service
    if (entity.service) {
      writeFile(
        path.join(moduleDir, `${entity.name}.service.ts`),
        templates.service(entityConfig)
      );
    }
    
    // Generate controller
    if (entity.controller) {
      writeFile(
        path.join(moduleDir, `${entity.name}.controller.ts`),
        templates.controller(entityConfig)
      );
    }
    
    // Generate module
    writeFile(
      path.join(moduleDir, `${entity.name}.module.ts`),
      templates.module(entityConfig)
    );
    
    // Generate DTOs
    entity.dto.forEach(dtoType => {
      switch (dtoType) {
        case 'create':
          writeFile(
            path.join(dtoDir, `create-${entity.name}.dto.ts`),
            templates.createDto(entityConfig)
          );
          break;
        case 'update':
          writeFile(
            path.join(dtoDir, `update-${entity.name}.dto.ts`),
            templates.updateDto(entityConfig)
          );
          break;
      }
    });
  });
  
  // Generate WebSocket modules
  schemaConfig.websocket.forEach(entity => {
    const entityConfig = {
      ...entity,
      capitalName: capitalize(entity.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase()))
    };
    
    const moduleDir = path.join(modulesDir, entity.name);
    const dtoDir = path.join(moduleDir, 'dto');
    
    createDirectory(moduleDir);
    createDirectory(dtoDir);
    
    // Generate service
    if (entity.service) {
      writeFile(
        path.join(moduleDir, `${entity.name}.service.ts`),
        templates.service(entityConfig)
      );
    }
    
    // Generate gateway
    if (entity.gateway) {
      writeFile(
        path.join(moduleDir, `${entity.name}.gateway.ts`),
        templates.gateway(entityConfig)
      );
    }
    
    // Generate module
    writeFile(
      path.join(moduleDir, `${entity.name}.module.ts`),
      templates.module(entityConfig)
    );
    
    // Generate DTOs
    entity.dto.forEach(dtoType => {
      switch (dtoType) {
        case 'send':
          writeFile(
            path.join(dtoDir, `send-${entity.name}.dto.ts`),
            templates.sendDto(entityConfig)
          );
          break;
        case 'create':
          writeFile(
            path.join(dtoDir, `create-${entity.name}.dto.ts`),
            templates.createDto(entityConfig)
          );
          break;
        case 'update':
          writeFile(
            path.join(dtoDir, `update-${entity.name}.dto.ts`),
            templates.updateDto(entityConfig)
          );
          break;
      }
    });
  });
  
  // Generate additional directories and files
  const additionalDirs = [
    'src/auth',
    'src/auth/guards',
    'src/auth/strategies',
    'src/common',
    'src/common/decorators',
    'src/common/filters',
    'src/common/interceptors',
    'src/common/pipes',
    'src/config',
    'src/prisma',
    'src/websocket',
    'src/websocket/guards',
    'src/websocket/adapters'
  ];
  
  additionalDirs.forEach(dir => createDirectory(dir));
  
  // Generate index file for modules
  const allEntities = [...schemaConfig.rest, ...schemaConfig.websocket];
  writeFile(
    path.join(modulesDir, 'index.ts'),
    templates.index(allEntities)
  );
  
  console.log('\n✅ Structure generation completed!');
  console.log('\n📁 Generated structure:');
  console.log('src/');
  console.log('├── modules/');
  schemaConfig.rest.forEach(entity => {
    console.log(`│   ├── ${entity.name}/`);
    console.log(`│   │   ├── ${entity.name}.service.ts`);
    if (entity.controller) console.log(`│   │   ├── ${entity.name}.controller.ts`);
    console.log(`│   │   ├── ${entity.name}.module.ts`);
    console.log(`│   │   └── dto/`);
    entity.dto.forEach(dto => {
      console.log(`│   │       └── ${dto}-${entity.name}.dto.ts`);
    });
  });
  schemaConfig.websocket.forEach(entity => {
    console.log(`│   ├── ${entity.name}/`);
    console.log(`│   │   ├── ${entity.name}.service.ts`);
    console.log(`│   │   ├── ${entity.name}.gateway.ts`);
    console.log(`│   │   ├── ${entity.name}.module.ts`);
    console.log(`│   │   └── dto/`);
    entity.dto.forEach(dto => {
      console.log(`│   │       └── ${dto}-${entity.name}.dto.ts`);
    });
  });
  console.log('├── auth/');
  console.log('├── common/');
  console.log('├── config/');
  console.log('├── prisma/');
  console.log('└── websocket/');
  
  console.log('\n🚀 Next steps:');
  console.log('1. Run: npm install @nestjs/websockets @nestjs/platform-socket.io');
  console.log('2. Update your app.module.ts to import all generated modules');
  console.log('3. Implement the PrismaService and JwtAuthGuard');
  console.log('4. Customize DTOs with proper validation rules');
  console.log('5. Add proper error handling and logging');
}

// Run the generator
generateStructure(); 