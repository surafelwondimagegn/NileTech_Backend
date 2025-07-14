const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// REST entities to generate with nest g resource
// const restEntities = [
//   'user',
//   'service', 
//   'project',
//   'expense',
//   'product',
//   'invoice',
//   'invoice-item',
//   'refresh-token',
//   'category',
//   'payment-method',
//   'payment',
//   'task',
//   'todo',
//   'budget',
//   'revenue',
//   'profit',
//   'inventory-transaction',
//   'transaction',
//   'receipt'
// ];

// WebSocket entities
const websocketEntities = [
  'message',
  'notification'
];

// Generate REST resources using NestJS CLI
// function generateRestResources() {
//   console.log('🚀 Generating REST resources with NestJS CLI...\n');
  
//   restEntities.forEach(entity => {
//     try {
//       console.log(`📦 Generating resource: ${entity}`);
//       execSync(`npx nest g resource ${entity} --no-spec`, { 
//         stdio: 'inherit',
//         cwd: process.cwd()
//       });
//       console.log(`✅ Generated ${entity} resource\n`);
//     } catch (error) {
//       console.error(`❌ Failed to generate ${entity}:`, error.message);
//     }
//   });
// }

// Generate WebSocket gateways
function generateWebSocketGateways() {
  console.log('🔌 Generating WebSocket gateways...\n');
  
  websocketEntities.forEach(entity => {
    const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);
    const gatewayContent = `import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ${entityName}Service } from './${entity}.service';

@WebSocketGateway({ namespace: '/${entity}', cors: true })
@UseGuards(WsJwtGuard)
export class ${entityName}Gateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly ${entity}Service: ${entityName}Service) {}

  @SubscribeMessage('${entity}:send')
  async handleSend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const ${entity} = await this.${entity}Service.create(data);
    
    // Emit to specific user or room
    this.server.to(\`user:\${data.receiverId}\`).emit('${entity}:new', ${entity});
    
    return { status: 'ok', ${entity} };
  }

  @SubscribeMessage('${entity}:read')
  async handleRead(@MessageBody() data: { id: number }, @ConnectedSocket() client: Socket) {
    await this.${entity}Service.markAsRead(data.id);
    return { status: 'ok' };
  }
}`;

    const gatewayPath = `src/${entity}/${entity}.gateway.ts`;
    fs.writeFileSync(gatewayPath, gatewayContent);
    console.log(`✅ Generated ${entity} gateway`);
  });
}

// Update modules to include WebSocket gateways
function updateWebSocketModules() {
  console.log('📝 Updating WebSocket modules...\n');
  
  websocketEntities.forEach(entity => {
    const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);
    const modulePath = `src/${entity}/${entity}.module.ts`;
    
    if (fs.existsSync(modulePath)) {
      let moduleContent = fs.readFileSync(modulePath, 'utf8');
      
      // Add gateway import
      moduleContent = moduleContent.replace(
        `import { ${entityName}Service } from './${entity}.service';`,
        `import { ${entityName}Service } from './${entity}.service';
import { ${entityName}Gateway } from './${entity}.gateway';`
      );
      
      // Add gateway to providers
      moduleContent = moduleContent.replace(
        `providers: [${entityName}Service]`,
        `providers: [${entityName}Service, ${entityName}Gateway]`
      );
      
      fs.writeFileSync(modulePath, moduleContent);
      console.log(`✅ Updated ${entity} module`);
    }
  });
}

// Create WebSocket DTOs
function createWebSocketDTOs() {
  console.log('📋 Creating WebSocket DTOs...\n');
  
  websocketEntities.forEach(entity => {
    const dtoDir = `src/${entity}/dto`;
    if (!fs.existsSync(dtoDir)) {
      fs.mkdirSync(dtoDir, { recursive: true });
    }
    
    const sendDtoContent = `import { IsString, IsNumber, IsOptional } from 'class-validator';

export class Send${entity.charAt(0).toUpperCase() + entity.slice(1)}Dto {
  @IsString()
  content: string;

  @IsNumber()
  receiverId: number;

  @IsOptional()
  @IsString()
  additionalData?: string;
}`;

    const sendDtoPath = `${dtoDir}/send-${entity}.dto.ts`;
    fs.writeFileSync(sendDtoPath, sendDtoContent);
    console.log(`✅ Created send-${entity}.dto.ts`);
  });
}

// Main execution
function main() {
  console.log('🎯 Starting NestJS resource generation...\n');
  
  // Check if we're in a NestJS project
  if (!fs.existsSync('nest-cli.json')) {
    console.error('❌ Error: nest-cli.json not found. Make sure you\'re in a NestJS project root.');
    process.exit(1);
  }
  
  try {
    // Generate REST resources
    generateRestResources();
    
    // Generate WebSocket gateways
    generateWebSocketGateways();
    
    // Update modules
    updateWebSocketModules();
    
    // Create WebSocket DTOs
    createWebSocketDTOs();
    
    console.log('\n🎉 Generation completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`✅ Generated ${restEntities.length} REST resources`);
    console.log(`✅ Generated ${websocketEntities.length} WebSocket gateways`);
    console.log('\n🚀 Next steps:');
    console.log('1. Install WebSocket dependencies: npm install @nestjs/websockets @nestjs/platform-socket.io');
    console.log('2. Update your app.module.ts to import all generated modules');
    console.log('3. Implement PrismaService and authentication guards');
    console.log('4. Customize DTOs with proper validation rules');
    console.log('5. Add business logic to services');
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main(); 