import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { assocPath, compose, curry, find, propEq } from 'ramda';
import { LoggingService } from '../core/modules/logging';

export class Message {
  message_code: string;
  type: number;
  content: { en: string; vi: string };
}

String.prototype.format = function(...args) {
  let str = this;
  for (const key in args) {
    if (args.hasOwnProperty(key)) {
      str = str.replace(new RegExp('\\{' + key + '\\}', 'g'), args[key]);
    }
  }
  return str;
};

const replace = curry((props: string[], a: {}) => {
  return assocPath(props, a);
});

@Injectable()
export class MessageService {
  logger: any;
  messages: Message[] = [];

  constructor(loggingService: LoggingService) {
    this.logger = loggingService.createLogger('LingualMessageService');
  }

  public initialize() {
    const fp = './src/multilingual/messages.yml';
    fs.exists(fp, exist => {
      if (exist) {
        try {
          this.messages = yaml.safeLoad(
            fs.readFileSync(fp, 'utf8'),
          ) as Message[];
        } catch (e) {
          this.logger.error(e);
        }
      } else {
        this.logger.warn('Cannot find the messages.yml file');
      }
    });
  }

  public getMessage(code: string, ...args) {
    const origin = find(propEq('message_code', code))(this.messages);
    if (origin) {
      if (args && origin.content) {
        const contentEN = origin.content.en
          ? origin.content.en.format(...args)
          : '';
        const contentVI = origin.content.en
          ? origin.content.vi.format(...args)
          : '';
        const msg = compose(
          replace(['content', 'en'], contentEN),
          replace(['content', 'vi'], contentVI),
        )(origin);
        return Object.assign(new Message(), msg);
      }
      return Object.assign(new Message(), origin);
    }

    return code;
  }
}
