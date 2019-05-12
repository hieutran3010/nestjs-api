import { Injectable } from '@nestjs/common';
import { isEmpty, isNil } from 'ramda';
import { PubSubMessageBase } from '../core/modules/pubsub.client/model';
import { IPubSubMessageParser } from '../core/modules/pubsub.client/parser';
import { MessageService } from '../multilingual/message.service';

@Injectable()
export class PubsubMessageParser implements IPubSubMessageParser {
    constructor(private messageService: MessageService) {
    }

    parse(message: PubSubMessageBase, ...args) {
        const lingualMessage = this.messageService.getMessage(message.code, args);
        let msg = {};
        if (!isEmpty(lingualMessage) && !isNil(lingualMessage)) {
            msg = Object.assign(message,
                {
                    message: lingualMessage
                },
            );
        } else {
            msg = Object.assign(message,
                {
                    message: message.code
                },
            );
        }
        return msg;
    }
}