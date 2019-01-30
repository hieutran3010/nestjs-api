import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { isNull } from 'util';
import { Cat } from '../interfaces/cat.interface';
import { CatsService } from '../services/cat.service';
import { CatDto } from './../dto/cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CatDto): Promise<CatDto[]>{
    return await this.catsService.create(createCatDto);
  }

  @Put()
  async update(@Body() createCatDto: CatDto) {
    this.catsService.update(createCatDto);
  }

  @Delete(':id')
  async delete(@Param() id) {
    return await this.catsService.delete(id.id);
  }

  @Get()
  async findAll(@Query() params): Promise<CatDto[]> {
    if (isNull(params)) {
      return await this.catsService.findAll();
    }
    const { name } = params;
    return await this.catsService.findByCondition(name);
  }

  @Get('findById')
  async findById(): Promise<CatDto[]> {
    return await this.catsService.findAll();
  }
}
