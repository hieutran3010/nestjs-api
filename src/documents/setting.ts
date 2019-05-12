import { InterfaceBase, SchemaBase } from '../core/modules/database/contract/base.document';

interface ISettingDocument extends InterfaceBase {
    key: string;
    value: string;
}

const SettingSchema = new SchemaBase({
    key: { type: String, required: true, index: { unique: true } },
    value: { type: String }
});

export { ISettingDocument, SettingSchema };