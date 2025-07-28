import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { SellService } from './sell.service';
import { SellMultipleProductsDto } from './dto/create-sell-product.dto';
import { SellMultipleServicesDto } from './dto/create-sell-service.dto';
import { SellResponseDto } from './dto/sell-response.dto';
import { SellCombinedDto } from './dto/create-sell-combined.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sell')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sell')
export class SellController {
  constructor(private readonly sellService: SellService) {}

  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sell multiple products',
    description:
      'Sell one or more products in a single transaction. Each product uses its own taxId.',
  })
  @ApiBody({
    type: SellMultipleProductsDto,
    examples: {
      'Multiple Products': {
        summary: 'Sell multiple products in one request',
        value: {
          items: [
            {
              productId: 1,
              quantity: 2,
              customerName: 'John Doe',
              customerEmail: 'john@example.com',
              customerPhone: '+1234567890',
              notes: 'Urgent delivery',
            },
            {
              productId: 2,
              quantity: 1,
              customerName: 'Jane Smith',
              customerEmail: 'jane@example.com',
              customerPhone: '+1987654321',
              notes: 'Gift order',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Products sold successfully',
    type: [SellResponseDto],
  })
  async sellMultipleProducts(
    @Body() dto: SellMultipleProductsDto,
  ): Promise<SellResponseDto[]> {
    return this.sellService.sellMultipleProducts(dto);
  }

  @Post('services')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sell multiple services',
    description:
      'Sell one or more services in a single transaction. Each service uses its own taxId.',
  })
  @ApiBody({
    type: SellMultipleServicesDto,
    examples: {
      'Multiple Services': {
        summary: 'Sell multiple services in one request',
        value: {
          items: [
            {
              serviceId: 1,
              quantity: 1,
              customerName: 'Alice Brown',
              customerEmail: 'alice@example.com',
              customerPhone: '+1111111111',
              notes: 'Express service',
            },
            {
              serviceId: 2,
              quantity: 2,
              customerName: 'Bob Green',
              customerEmail: 'bob@example.com',
              customerPhone: '+2222222222',
              notes: 'VIP client',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Services sold successfully',
    type: [SellResponseDto],
  })
  async sellMultipleServices(
    @Body() dto: SellMultipleServicesDto,
  ): Promise<SellResponseDto[]> {
    return this.sellService.sellMultipleServices(dto);
  }

  @Post('combined')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sell products and services together',
    description:
      'Sell products and services in a single transaction. Each item can be either a product or service.',
  })
  @ApiBody({
    type: SellCombinedDto,
    examples: {
      'Combined Sale': {
        summary: 'Sell products and services together',
        value: {
          items: [
            {
              type: 'product',
              productId: 1,
              quantity: 2,
              customerName: 'John Doe',
              customerEmail: 'john@example.com',
              customerPhone: '+1234567890',
              notes: 'Urgent delivery',
            },
            {
              type: 'service',
              serviceId: 1,
              quantity: 1,
              customerName: 'John Doe',
              customerEmail: 'john@example.com',
              customerPhone: '+1234567890',
              notes: 'Priority service',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Products and services sold successfully',
    type: [SellResponseDto],
  })
  async sellCombined(
    @Body() dto: SellCombinedDto,
  ): Promise<SellResponseDto[]> {
    return this.sellService.sellCombined(dto);
  }
}
