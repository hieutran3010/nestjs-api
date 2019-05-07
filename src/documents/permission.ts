import { DTOBase, InterfaceBase, SchemaBase } from '../core/modules/database/contract/base.document';
import { PermissionDetailDTO, PermissionDetailInterface, PermissionDetailSchema } from './permission-detail';

enum DataScope{
    branch,
    full
}

const PermissionFields = {
    ID: '_id',
    NAME: 'name',
    PERMISSION_DETAIL: 'permission_details'
};

const PermissionSchemesFields = {
    USER_GROUP: 'userGroups',
    NAME: 'name',
    PERMISSION_DETAILS: 'permission_details'
};

const PermissionSchema = new SchemaBase({
    name: { type: String, required: true },
    permission_details: { type: [PermissionDetailSchema], required: true }
});

interface PermissionInterface extends InterfaceBase {
    name: string;
    permission_details: Array<PermissionDetailInterface>;
}

class PermissionDTO extends DTOBase {
    name: string;
    permission_details: Array<PermissionDetailDTO>;
}

export { PermissionSchema, PermissionInterface, PermissionDTO, PermissionFields, PermissionSchemesFields, DataScope };