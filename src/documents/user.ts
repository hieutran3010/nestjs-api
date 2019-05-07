import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
} from 'class-validator';
import { SchemaTypes } from 'mongoose';
import { Schema } from 'mongoose';
import {
  DTOBase,
  InterfaceBase,
  SchemaBase,
} from '../core/modules/database/contract/base.document';
import { USER_MESSAGE_CODE } from '../modules/user/const';
import { DOCUMENT_NAME } from './const';

/**
 * Define user data transfer object
 *
 * @class UserDto
 */
class UserDto extends DTOBase {
  @IsNotEmpty({ message: USER_MESSAGE_CODE.RequireUsername })
  @Matches(new RegExp('^[a-zA-Z0-9._-]+$'), { message: USER_MESSAGE_CODE.UserNameInvalid })
  @MaxLength(20, { message: USER_MESSAGE_CODE.UserNameExceedMaxLength })
  username: string;

  password: string;

  passwordHash: string;

  @IsNotEmpty({ message: USER_MESSAGE_CODE.RequireFullname })
  fullname: string;

  @IsNotEmpty({ message: USER_MESSAGE_CODE.RequireEmail })
  @IsEmail({}, { message: USER_MESSAGE_CODE.InvalidEmail })
  email: string;

  avatar: string;

  // the current login failed attempt
  loginAttempts: number = 0;

  // total count of success log in
  successLoginCount: number = 0;

  // the last login time to system
  lastTimeLogin: number = 0;

  // the previous login time of last login
  previousTimeLogin: number = 0;

  // the last time of login fail
  lastTimeFailedLogin: number = 0;

  // total count of fail log in
  failedLoginCount: number = 0;

  refreshToken: string;

  @IsNotEmpty({ message: USER_MESSAGE_CODE.UniqueBranchId })
  branch: Schema.Types.ObjectId;

  userGroup: Schema.Types.ObjectId;

  isActive: boolean;
}

/**
 * Define basic inforamtion for user
 *
 * @export
 * @class BasicUserInfo
 */
class BasicUserInfo {
  _id: string;

  email: string;

  fullname: string;

  username: string;

  avatar: string;

  branch: Schema.Types.ObjectId;

  constructor(userDto: UserDto) {
    this._id = userDto._id;
    this.email = userDto.email;
    this.fullname = userDto.fullname;
    this.username = userDto.username;
    this.avatar = userDto.avatar;
    this.branch = userDto.branch;
  }
}

/**
 * Define name of field in user model
 *
 */
const userFields = {
  ID: '_id',
  USER_NAME: 'username',
  PASSWORDHASH: 'passwordHash',
  FULLNAME: 'fullname',
  EMAIL: 'email',
  AVATAR: 'avatar',
  LOGIN_ATTEMPTS: 'loginAttempts',
  SUCCESS_LOGIN_COUNT: 'successLoginCount',
  LAST_TIME_LOGIN: 'lastTimeLogin',
  PREVIOUS_TIME_LOGIN: 'previousTimeLogin',
  LAST_TIME_FAILED_LOGIN: 'lastTimeFailedLogin',
  FAILED_LOGIN_COUNT: 'failedLoginCount',
  BRANCH: 'branch',
  REFRESH_TOKEN: 'refreshToken',
  IS_ACTIVE: 'isActive',
  USER_GROUP: 'userGroup',
  RESET_PASSWORD_TOKEN: 'resetPasswordToken',
  RESET_PASSWORD_EXPIRES: 'resetPasswordExpires',
};

/**
 * Define user interface
 *
 * @interface User
 * @extends {InterfaceBase}
 */
interface User extends InterfaceBase {
  username: string;
  passwordHash: string;
  fullname: string;
  email: string;
  avatar: string;
  loginAttempts: number;
  successLoginCount: number;
  lastTimeLogin: number;
  previousTimeLogin: number;
  lastTimeFailedLogin: number;
  failedLoginCount: number;
  refreshToken: string;
  isActive: boolean;
  branch: Schema.Types.ObjectId;
  userGroup: Schema.Types.ObjectId;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
}

/**
 * Define user schema
 *
 */
const UserSchema = new SchemaBase({
  username: { type: String, required: true, index: { unique: true } },
  passwordHash: { type: String, required: true },
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, required: true },
  loginAttempts: { type: Number, required: true, default: 0 },
  successLoginCount: { type: Number, default: 0 },
  lastTimeLogin: { type: Number, default: 0 },
  previousTimeLogin: { type: Number, default: 0 },
  lastTimeFailedLogin: { type: Number, default: 0 },
  failedLoginCount: { type: Number, default: 0 },
  refreshToken: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  branch: { type: SchemaTypes.ObjectId, ref: DOCUMENT_NAME.Branch },
  userGroup: { type: SchemaTypes.ObjectId, ref: DOCUMENT_NAME.UserGroup },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

export { userFields, User, UserSchema, UserDto, BasicUserInfo };
