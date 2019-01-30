import { UserService } from './user.service';
import { UserSeeder } from '../migrations/user.seeder';
import { MessageService } from '../../message-pack/message.service';

export const dataServices = [
    UserService,
    UserSeeder,
    MessageService
];