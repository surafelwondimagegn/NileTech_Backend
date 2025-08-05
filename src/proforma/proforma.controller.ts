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
import { ProformaService } from './proforma.service';
import { CreateProformaDto } from './dto/create-proforma.dto';
import { UpdateProformaDto } from './dto/update-proforma.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('proforma')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@Controller('proforma')
@UseGuards(JwtAuthGuard)
export class ProformaController {
  constructor(private readonly proformaService: ProformaService) {}

  @Post()
  create(@Body() createProformaDto: CreateProformaDto) {
    return this.proformaService.create(createProformaDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.proformaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proformaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProformaDto: UpdateProformaDto) {
    return this.proformaService.update(+id, updateProformaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proformaService.remove(+id);
  }

  @Post(':id/convert')
  convertToInvoice(@Param('id') id: string) {
    return this.proformaService.convertToInvoice(+id);
  }

  @Patch(':id/approve')
  approveProforma(@Param('id') id: string) {
    return this.proformaService.approveProforma(+id);
  }

  @Get('stats/summary')
  getProformaStats(@Query() query: any) {
    return this.proformaService.getProformaStats(query);
  }
}