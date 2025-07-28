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
import { ProfitService } from './profit.service';
import { CreateProfitDto } from './dto/create-profit.dto';
import { UpdateProfitDto } from './dto/update-profit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('profit')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('profit')
export class ProfitController {
  constructor(private readonly profitService: ProfitService) {}

  @Post()
  create(@Body() createProfitDto: CreateProfitDto) {
    return this.profitService.create(createProfitDto);
  }

  @Get()
  findAll() {
    return this.profitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profitService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfitDto: UpdateProfitDto) {
    return this.profitService.update(+id, updateProfitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profitService.remove(+id);
  }
}
