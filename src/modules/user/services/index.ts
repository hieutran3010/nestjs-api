import { MessageService } from 'multilingual/message.service';
import { UserSeeder } from '../migrations/user.seeder';
import { UserService } from './user.service';

export const dataServices = [UserService, UserSeeder, MessageService];
