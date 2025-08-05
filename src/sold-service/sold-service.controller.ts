import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { SoldServiceService } from './sold-service.service';
import { CreateSoldServiceDto } from './dto/create-sold-service.dto';
import { UpdateSoldServiceDto } from './dto/update-sold-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sold-service')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@Controller('sold-services')
@UseGuards(JwtAuthGuard)
export class SoldServiceController {
  constructor(private readonly soldServiceService: SoldServiceService) {}

  @Post()
  create(@Body() createSoldServiceDto: CreateSoldServiceDto) {
    return this.soldServiceService.create(createSoldServiceDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.soldServiceService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soldServiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSoldServiceDto: UpdateSoldServiceDto) {
    return this.soldServiceService.update(+id, updateSoldServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.soldServiceService.remove(+id);
  }

  @Get('summary/sales')
  getSalesSummary(@Query() query: any) {
    return this.soldServiceService.getSalesSummary(query);
  }
}