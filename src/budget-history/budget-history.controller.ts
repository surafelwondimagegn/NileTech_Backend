import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BudgetHistoryService } from './budget-history.service';
import { CreateBudgetHistoryDto } from './dto/create-budget-history.dto';
import { UpdateBudgetHistoryDto } from './dto/update-budget-history.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('budget-history')
// @ApiBearerAuth('JWT-auth')
// @UseGuards(JwtAuthGuard)
@Controller('budget-history')
export class BudgetHistoryController {
  constructor(private readonly budgetHistoryService: BudgetHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget history entry' })
  @ApiResponse({ status: 201, description: 'Budget history entry created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createBudgetHistoryDto: CreateBudgetHistoryDto) {
    return this.budgetHistoryService.create(createBudgetHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budget history entries' })
  @ApiResponse({ status: 200, description: 'List of all budget history entries' })
  findAll() {
    return this.budgetHistoryService.findAll();
  }

  @Get('budget/:budgetId')
  @ApiOperation({ summary: 'Get budget history by budget ID' })
  @ApiParam({ name: 'budgetId', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget history entries for the specified budget' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  findByBudgetId(@Param('budgetId') budgetId: string) {
    return this.budgetHistoryService.findByBudgetId(+budgetId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific budget history entry by ID' })
  @ApiParam({ name: 'id', description: 'Budget history entry ID' })
  @ApiResponse({ status: 200, description: 'Budget history entry found' })
  @ApiResponse({ status: 404, description: 'Budget history entry not found' })
  findOne(@Param('id') id: string) {
    return this.budgetHistoryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget history entry' })
  @ApiParam({ name: 'id', description: 'Budget history entry ID' })
  @ApiResponse({ status: 200, description: 'Budget history entry updated successfully' })
  @ApiResponse({ status: 404, description: 'Budget history entry not found' })
  update(@Param('id') id: string, @Body() updateBudgetHistoryDto: UpdateBudgetHistoryDto) {
    return this.budgetHistoryService.update(+id, updateBudgetHistoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget history entry' })
  @ApiParam({ name: 'id', description: 'Budget history entry ID' })
  @ApiResponse({ status: 200, description: 'Budget history entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Budget history entry not found' })
  remove(@Param('id') id: string) {
    return this.budgetHistoryService.remove(+id);
  }
}
