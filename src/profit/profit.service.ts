import { Injectable } from '@nestjs/common';
import { CreateProfitDto } from './dto/create-profit.dto';
import { UpdateProfitDto } from './dto/update-profit.dto';

@Injectable()
export class ProfitService {
  create(createProfitDto: CreateProfitDto) {
    return 'This action adds a new profit';
  }

  findAll() {
    return `This action returns all profit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profit`;
  }

  update(id: number, updateProfitDto: UpdateProfitDto) {
    return `This action updates a #${id} profit`;
  }

  remove(id: number) {
    return `This action removes a #${id} profit`;
  }
}
