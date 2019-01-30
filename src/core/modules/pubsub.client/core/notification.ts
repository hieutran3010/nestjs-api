import { WsResponse } from '@nestjs/websockets';
import * as io from 'socket.io-client';
import { INotificationChannel, INotificationPublisher, INotificationSubscriber } from '../common';
import { PubSubMessageBase } from '../model';
import { IPubSubMessageParser } from './../parser';

export class DefaultNotificationChannel<T extends PubSubMessageBase>
implements INotificationChannel<T>, INotificationPublisher<T>, INotificationSubscriber<T> {

    publisher: INotificationPublisher<T> = this;
    subscriber: INotificationSubscriber<T> = this;
    socket: any;
    constructor(protected channel: string,
                protected host: string,
                protected parser: IPubSubMessageParser,
                protected logger: any) {
        this.listen();
    }

    listen() {
       this.socket = io(this.host);
    }

    publish(data: T, ...args): Promise<void> {
        return new Promise<void>(() => {
            let message = this.parser.parse(data, args);
            message = Object.assign(message, {
                timestamp: Date.now(),
                channel: this.channel
            });
            this.socket.emit(this.channel, message);
        }).catch(this.handleException);
    }

    subscribe(callback: (data: T) => any) {
        this.socket.on(this.channel, callback);
    }

    handleException(error: any): any {
        this.logger.error(`[DefaultNotificationChannel] Publish message occured error. Error = [${JSON.stringify(error)}]`);
    }
}