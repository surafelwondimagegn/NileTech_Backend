import { PartialType } from '@nestjs/swagger';
import { CreateSoldProductDto } from './create-sold-product.dto';

export class UpdateSoldProductDto extends PartialType(CreateSoldProductDto) {}
