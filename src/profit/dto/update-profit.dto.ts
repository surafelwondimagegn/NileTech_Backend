import { PartialType } from '@nestjs/swagger';
import { CreateProfitDto } from './create-profit.dto';

export class UpdateProfitDto extends PartialType(CreateProfitDto) {}
