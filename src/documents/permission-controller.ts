import { DTOBase, InterfaceBase, SchemaBase } from '../core/modules/database/contract/base.document';

class ControllerDto extends DTOBase {
    key: string;
    name: string;
    isObsolete: boolean;
}

const controllerFields = {
    ID: '_id',
    KEY: 'key',
    NAME: 'name',
    IS_OBSOLETE: 'isObsolete'
};

interface Controller extends InterfaceBase {
    key: string;
    name: string;
    isObsolete: boolean;
}

const schemeName = {
    DefaultAdmin: 'default-admin-permission-scheme',
    DefaultUser: 'default-user-permission-scheme'
};

const ControllerSchema = new SchemaBase ({
    key: { type: String, required: true, index: { unique: true } },
    name: { type: String, required: true, index: { unique: true } },
    isObsolete: { type: Boolean }
});

export {controllerFields, Controller, ControllerDto, ControllerSchema, schemeName };