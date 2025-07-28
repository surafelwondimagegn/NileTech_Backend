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
import { RevenueService } from './revenue.service';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';
import { Revenue } from './entities/revenue.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('revenue')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new revenue entry' })
  @ApiResponse({ status: 201, description: 'Revenue created successfully', type: Revenue })
  create(@Body() createRevenueDto: CreateRevenueDto) {
    return this.revenueService.create(createRevenueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all revenue entries' })
  @ApiResponse({ status: 200, description: 'Revenue entries retrieved successfully', type: [Revenue] })
  findAll() {
    return this.revenueService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get revenue statistics' })
  @ApiResponse({ status: 200, description: 'Revenue statistics retrieved successfully' })
  getStats() {
    return this.revenueService.getRevenueStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a revenue entry by ID' })
  @ApiResponse({ status: 200, description: 'Revenue entry retrieved successfully', type: Revenue })
  findOne(@Param('id') id: string) {
    return this.revenueService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a revenue entry' })
  @ApiResponse({ status: 200, description: 'Revenue entry updated successfully', type: Revenue })
  update(@Param('id') id: string, @Body() updateRevenueDto: UpdateRevenueDto) {
    return this.revenueService.update(+id, updateRevenueDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a revenue entry' })
  @ApiResponse({ status: 200, description: 'Revenue entry deleted successfully' })
  remove(@Param('id') id: string) {
    return this.revenueService.remove(+id);
  }
}
