import { Injectable } from '@nestjs/common';
import { find, propEq } from 'ramda';
import { LoggingService } from '../../logging/logging.service';
import { INotificationChannel, INotificationChannelFactory, notificationToken } from '../common';
import { PubSubParsingService } from '../parser';
import { PubSubConfigService } from './../config';
import { PubSubMessageBase } from './../model';
import { DefaultNotificationChannel } from './notification';

interface IChannel {
    channel: string;
    notification: INotificationChannel<any>;
}

@Injectable()
export class NotificationChannelFactory implements INotificationChannelFactory {
    channels: IChannel[] = [];
    logger: any;

    constructor(private configService: PubSubConfigService,
                private parsingService: PubSubParsingService,
                loggingService: LoggingService) {
                    this.logger = loggingService.createLogger('NotificationChannelFactory');
    }

    get<T extends PubSubMessageBase>(channel: string): INotificationChannel<T> {
        const channelNotification = find(propEq('channel', channel))(this.channels);
        if (channelNotification) {
            return channelNotification.notification;
        } else {
            const newNotification = new DefaultNotificationChannel<T>(channel, this.configService.config.host,
                this.parsingService.parser, this.logger);
            const newChannel: IChannel = { channel, notification: newNotification };
            this.channels.push(newChannel);
            return newNotification;
        }
    }
}

export const factoryProvider =
    {
        provide: notificationToken.CHANNEL_FACTORY,
        useClass: NotificationChannelFactory,
    };