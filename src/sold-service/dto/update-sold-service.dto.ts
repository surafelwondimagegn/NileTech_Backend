import { PartialType } from '@nestjs/mapped-types';
import { CreateSoldServiceDto } from './create-sold-service.dto';

export class UpdateSoldServiceDto extends PartialType(CreateSoldServiceDto) {}