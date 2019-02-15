import { ForbiddenException, Injectable } from '@nestjs/common';
import { contains, isNil } from 'ramda';
import { RepositoryBase } from './core/modules/database/factory/repository.base';
import { RepositoryFactory } from './core/modules/database/factory/repository.factory';
import { ServiceBase } from './core/modules/database/service';
import { IPermissionControlller, IPermissionDatabaseExecutor } from './core/permission/interface';
import { DOCUMENT_NAME } from './documents/const';
import { Controller, ControllerDto, controllerFields, ControllerSchema } from './documents/permission-controller';
import { MessageService } from './modules/message-pack/message.service';

@Injectable()
export class AppService {
  constructor(
    private readonly messageService: MessageService) {
  }

  root(): string {
    throw new ForbiddenException(
      'usercontroller_001',
      this.messageService.getMessage('usercontroller_001').message_code,
    );
  }
}

@Injectable()
export class PermissionControllerCollectService extends ServiceBase implements IPermissionDatabaseExecutor {

    controllerRepo: RepositoryBase<Controller>;

    constructor(repositoryFactory: RepositoryFactory) {
        super(repositoryFactory);
        this.controllerRepo = repositoryFactory.getRepository(DOCUMENT_NAME.Controller, ControllerSchema);
    }

    async saveToDb(info: IPermissionControlller): Promise<any> {
        // find controller by key, if exist => just update name, otherwise, create a new one and insert to db
        const query = {};
        query[controllerFields.KEY] = info.key;

        const existed = await this.controllerRepo.findOne(query);
        if (!isNil(existed) && existed.key === info.key) {
            await this.controllerRepo.update(existed._id, {[controllerFields.NAME]: info.name});
        } else {
            const dto = new ControllerDto();
            dto.key = info.key;
            dto.name = info.name;
            await this.controllerRepo.create(dto);
        }
    }

    async bulkSaveToDb(infos: IPermissionControlller[]): Promise<any> {
        // if there aren't any controller => do nothing. otherwise update to db
        if (isNil(infos))
        {
            return;
        }

        infos.forEach(info => {
            this.saveToDb(info);
        });
    }

    isNeedToUpdate(info: IPermissionControlller, listCode: any[]): boolean{

        return contains(info.key, listCode);
    }

}