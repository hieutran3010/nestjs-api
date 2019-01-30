import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
    WsResponse,
} from '@nestjs/websockets';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

const pubsubChannel = {
    ORDER: 'order'
};

@WebSocketGateway()
export class PubSubGateway {
    @WebSocketServer() server;

    @SubscribeMessage('test')
    onEvent(client, data) {
        this.publishToClient('test', data);
    }

    private publishToClient(channel: string, data: any) {
        this.server.emit(channel, data)
    }
}