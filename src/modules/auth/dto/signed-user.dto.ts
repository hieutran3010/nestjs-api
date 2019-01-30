import { IsNotEmpty } from 'class-validator';
import { AUTH_MESSAGE_CODE } from '../message.auth';

export class SignedUser {
  @IsNotEmpty()
  usertoken: string;

  @IsNotEmpty({ message: AUTH_MESSAGE_CODE.RequireUserName })
  username: string;

  @IsNotEmpty({ message: AUTH_MESSAGE_CODE.RequirePassword })
  password: string;
}