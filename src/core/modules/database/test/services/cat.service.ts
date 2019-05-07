import { Injectable } from '@nestjs/common';
import { RepositoryFactory } from '../../factory';
import { RepositoryBase } from '../../factory';
import { ServiceBase } from '../../service';
import { CatDto } from '../dto/cat.dto';
import { Cat, catFields } from '../interfaces/cat.interface';
import { catSchema } from './../schemas/cat.schema';

@Injectable()
export class CatsService extends ServiceBase {
  private serviceBase: RepositoryBase<Cat>;

  constructor(protected readonly repositoryFactory: RepositoryFactory) {
    super(repositoryFactory);
    this.resolveServices();
  }

  async resolveServices() {
    this.serviceBase = await this.repositoryFactory.getRepository<Cat>('Cat', catSchema);
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
