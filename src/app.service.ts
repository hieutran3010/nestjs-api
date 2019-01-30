import { ForbiddenException, Injectable } from '@nestjs/common';
import { MessageService } from './modules/message-pack/message.service';

@Injectable()
export class AppService {
  constructor(
    private readonly messageService: MessageService) {
  }

  root(): string {
    throw new ForbiddenException(
      'usercontroller_001',
      this.messageService.getMessage('usercontroller_001').message_code,
    );
  }
}
