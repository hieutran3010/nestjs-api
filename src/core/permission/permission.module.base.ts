import { isNil, map } from 'ramda';
import { isNullOrEmptyOrUndefined } from '../util';
import { metadataKeys } from './constant';
import { IPermissionControlller, IPermissionDatabaseExecutor } from './interface';

export abstract class PermissionModuleBase {

    constructor(protected dbExecutor: IPermissionDatabaseExecutor, protected controllers: any[]) {
        this.scanPermissionController();
    }

    protected async scanPermissionController() {
        if (isNullOrEmptyOrUndefined(this.controllers)) {
            return;
        }

        const controllerMetadatas = map(controller => {
            const permissionMetadata = Reflect.getMetadata(metadataKeys.PERMISSION, controller) as IPermissionControlller;
            return permissionMetadata;
        }, this.controllers);

        await this.dbExecutor.bulkSaveToDb(controllerMetadatas);
    }
}