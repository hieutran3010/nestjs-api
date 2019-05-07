import { Schema } from 'mongoose';
import { DTOBase, InterfaceBase, SchemaBase } from '../core/modules/database/contract/base.document';
import { DOCUMENT_NAME } from './const';
import { DataScope } from './permission';

const PermissionDetailSchema = new SchemaBase({
    controller: { type: Schema.Types.ObjectId, ref: DOCUMENT_NAME.Controller, required: true },
    is_insert: { type: Boolean, required: true },
    is_update: { type: Boolean, required: true },
    is_delete: { type: Boolean, required: true },
    data_scope: { type: Number, required: true }
});

interface PermissionDetailInterface extends InterfaceBase {
    controller: any;
    is_insert: boolean;
    is_update: boolean;
    is_delete: boolean;
    data_scope: DataScope;
}

class PermissionDetailDTO extends DTOBase {
    controller: any;
    is_insert: boolean;
    is_update: boolean;
    is_delete: boolean;
    data_scope: DataScope;
}

const PermissionDetailFields = {
    CONTROLLER: 'controller',
    IS_INSERT: 'is_insert',
    IS_UPDATE: 'is_update',
    IS_DELETE: 'is_delete'
};

export { PermissionDetailDTO, PermissionDetailSchema, PermissionDetailInterface, PermissionDetailFields };