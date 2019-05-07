import { metadataKeys } from './constant';
import { IPermissionControlller } from './interface';

function Permission(key: string, name: string): ClassDecorator {
    const info: IPermissionControlller = {key, name};
    return (target: object) => {
        Reflect.defineMetadata(metadataKeys.PERMISSION, info, target);
    };
}

export {
    IPermissionControlller,
    Permission
};