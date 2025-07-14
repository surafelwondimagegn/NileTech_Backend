import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('budgets')
// @ApiBearerAuth('JWT-auth')
// @UseGuards(JwtAuthGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createBudgetDto: CreateBudgetDto, @Request() req) {
    // Temporarily use a default user ID since auth is commented out
    const userId = req.user?.userId || 1;
    return this.budgetService.create(createBudgetDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  @ApiResponse({ status: 200, description: 'List of all budgets' })
  findAll() {
    return this.budgetService.findAll();
  }

  @Get('check-name/:name')
  @ApiOperation({ summary: 'Check if budget name exists' })
  @ApiParam({ name: 'name', description: 'Budget name to check' })
  @ApiResponse({ status: 200, description: 'Name availability status' })
  async checkNameExists(@Param('name') name: string) {
    const exists = await this.budgetService.checkNameExists(name);
    return { 
      name, 
      exists, 
      available: !exists,
      message: exists ? 'Name already taken' : 'Name is available'
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific budget by ID' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget found' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  findOne(@Param('id') id: string) {
    return this.budgetService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget updated successfully' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto, @Request() req) {
    // Temporarily use a default user ID since auth is commented out
    const userId = req.user?.userId || 1;
    return this.budgetService.update(+id, updateBudgetDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget deleted successfully' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  remove(@Param('id') id: string, @Request() req) {
    // Temporarily use a default user ID since auth is commented out
    const userId = req.user?.userId || 1;
    return this.budgetService.remove(+id, userId);
  }
}
