import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { InventoryTransactionService } from './inventory-transaction.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { UpdateInventoryTransactionDto } from './dto/update-inventory-transaction.dto';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inventory-transaction')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory-transaction')
export class InventoryTransactionController {
  constructor(private readonly inventoryTransactionService: InventoryTransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory transaction' })
  @ApiResponse({ status: 201, description: 'Inventory transaction created successfully', type: InventoryTransaction })
  create(@Body() createInventoryTransactionDto: CreateInventoryTransactionDto) {
    return this.inventoryTransactionService.create(createInventoryTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory transactions' })
  @ApiResponse({ status: 200, description: 'Inventory transactions retrieved successfully', type: [InventoryTransaction] })
  findAll() {
    return this.inventoryTransactionService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get inventory transaction statistics' })
  @ApiResponse({ status: 200, description: 'Inventory transaction statistics retrieved successfully' })
  getStats() {
    return this.inventoryTransactionService.getInventoryTransactionStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory transaction by ID' })
  @ApiResponse({ status: 200, description: 'Inventory transaction retrieved successfully', type: InventoryTransaction })
  findOne(@Param('id') id: string) {
    return this.inventoryTransactionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inventory transaction' })
  @ApiResponse({ status: 200, description: 'Inventory transaction updated successfully', type: InventoryTransaction })
  update(
    @Param('id') id: string,
    @Body() updateInventoryTransactionDto: UpdateInventoryTransactionDto,
  ) {
    return this.inventoryTransactionService.update(+id, updateInventoryTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an inventory transaction' })
  @ApiResponse({ status: 200, description: 'Inventory transaction deleted successfully' })
  remove(@Param('id') id: string) {
    return this.inventoryTransactionService.remove(+id);
  }
}
