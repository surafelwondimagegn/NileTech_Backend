import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Expenses')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new expense',
    description: 'Create an expense with funding from budget or profit',
  })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient funds or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Related entity not found',
  })
  create(
    @Body() createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all expenses',
    description: 'Retrieve all expenses with related data',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all expenses',
    type: [ExpenseResponseDto],
  })
  findAll(): Promise<ExpenseResponseDto[]> {
    return this.expenseService.findAll();
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get expense summary',
    description: 'Get overall expense statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense summary statistics',
    schema: {
      type: 'object',
      properties: {
        totalExpenses: { type: 'number', example: 25 },
        totalAmount: { type: 'number', example: 5000.0 },
        budgetExpenses: { type: 'number', example: 3000.0 },
        profitExpenses: { type: 'number', example: 2000.0 },
      },
    },
  })
  getExpenseSummary() {
    return this.expenseService.getExpenseSummary();
  }

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'Get expenses for a specific project',
    description: 'Retrieve all expenses related to a particular project',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID of the project',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of expenses for the specified project',
    type: [ExpenseResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  getExpensesByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ExpenseResponseDto[]> {
    return this.expenseService.getExpensesByProject(projectId);
  }

  @Get('budget/:budgetId')
  @ApiOperation({
    summary: 'Get expenses for a specific budget',
    description: 'Retrieve all expenses funded from a particular budget',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of expenses for the specified budget',
    type: [ExpenseResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  getExpensesByBudget(
    @Param('budgetId', ParseIntPipe) budgetId: number,
  ): Promise<ExpenseResponseDto[]> {
    return this.expenseService.getExpensesByBudget(budgetId);
  }

  @Get('sold-product/:soldProductId')
  @ApiOperation({
    summary: 'Get expenses for a specific sold product',
    description: 'Retrieve all expenses related to a particular sold product',
  })
  @ApiParam({
    name: 'soldProductId',
    description: 'ID of the sold product',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of expenses for the specified sold product',
    type: [ExpenseResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Sold product not found',
  })
  getExpensesBySoldProduct(
    @Param('soldProductId', ParseIntPipe) soldProductId: number,
  ): Promise<ExpenseResponseDto[]> {
    return this.expenseService.getExpensesBySoldProduct(soldProductId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific expense',
    description: 'Retrieve a single expense record by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the expense',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Expense record found',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense record not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ExpenseResponseDto> {
    return this.expenseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an expense',
    description: 'Update an existing expense record',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the expense',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense record not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an expense',
    description: 'Delete an expense record',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the expense',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Expense deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense record not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.expenseService.remove(id);
  }
}
