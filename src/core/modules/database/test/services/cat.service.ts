import { Injectable, Inject } from '@nestjs/common';
import {map} from 'lodash';
import { RepositoryBase } from '../../factory/repository.base';
import { RepositoryFactory } from '../../factory/repository.factory';
import { ServiceBase } from '../../service/service.base';
import { CatDto } from '../dto/cat.dto';
import { Cat, catFields } from '../interfaces/cat.interface';
import { catSchema } from './../schemas/cat.schema';

@Injectable()
export class CatsService extends ServiceBase {
  private serviceBase: RepositoryBase<Cat>;

  constructor(repositoryFactory: RepositoryFactory) {
    super(repositoryFactory);
    this.serviceBase = repositoryFactory.getRepository('Cat', catSchema);
  }

  async create(catDto: CatDto): Promise<CatDto[]> {
    await this.serviceBase.create(catDto);
    return await this.serviceBase.findAll();
  }

  async update(catdto: CatDto): Promise<void> {
    return await this.serviceBase.update(catdto.id, { name: catdto.name });
  }

  async delete(id: string): Promise<void> {
    return await this.serviceBase.delete(id);
  }

  async findAll(): Promise<CatDto[]> {
    return await this.serviceBase.findAll();
  }

  async findById(id: string): Promise<CatDto> {
    return null;
  }

  async findByCondition(name: string, pageSize = 100, pageNumber = 1): Promise<CatDto[]> {

    const searchCondition = {};
    searchCondition[catFields.NAME] = {$regex: 'Sang'};

    return await this.serviceBase.find(searchCondition, [], pageNumber, pageSize);
  }
}
