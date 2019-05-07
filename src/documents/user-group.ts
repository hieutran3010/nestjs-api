import { IsNotEmpty } from 'class-validator';
import { Schema } from 'mongoose';
import { DTOBase, InterfaceBase, SchemaBase } from '../core/modules/database/contract/base.document';
import { USER_GROUP_MESSAGE_CODE } from '../modules/user-group/const';
import { DOCUMENT_NAME } from './const';

const UserGroupSchema = new SchemaBase({
  name: { type: String, required: true, index: { unique: true } },
  description: String,
  permissionScheme: { type: Schema.Types.ObjectId, ref: DOCUMENT_NAME.Permission },
});

class UserGroupDto extends DTOBase {
  @IsNotEmpty({ message: USER_GROUP_MESSAGE_CODE.RequiredGroupName })
  name: string;
  description: string;
  permissionScheme: any;
}

const UserGroupFields = {
  ID: '_id',
  NAME: 'name',
  DESC: 'description',
  PERMISSION_SCHEME: 'permissionScheme',
};

interface UserGroup extends InterfaceBase {
  name: string;
  description: string;
  permissionScheme: string;
}

export { UserGroupFields, UserGroupDto, UserGroup, UserGroupSchema };