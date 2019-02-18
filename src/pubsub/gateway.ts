import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway()
export class PubSubGateway {
    @WebSocketServer() server;

    @SubscribeMessage('test')
    onEvent(client, data) {
        this.publishToClient('test', data);
    }

    private publishToClient(channel: string, data: any) {
        this.server.emit(channel, data);
    }
}