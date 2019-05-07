import { PubSubMessageBase } from './model';

interface INotificationChannelFactory {
    get<T extends PubSubMessageBase>(channel: string): INotificationChannel<T>;
}

interface INotificationChannel<T extends PubSubMessageBase> {
    publisher: INotificationPublisher<T>;
    subscriber: INotificationSubscriber<T>;
}

interface INotificationPublisher<T extends PubSubMessageBase> {
    publish(data: T, ...args): Promise<void>;
}

interface INotificationSubscriber<T extends PubSubMessageBase> {
    subscribe(callback: (data: T) => any);
}

const notificationToken = {
    CHANNEL_FACTORY: '__channelFactory__'
};

export { INotificationChannelFactory, INotificationChannel, INotificationPublisher, INotificationSubscriber, notificationToken };
