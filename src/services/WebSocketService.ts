import { Client } from '@stomp/stompjs';
import pkg from 'websocket';
const { w3cwebsocket: WebSocket } = pkg;
import type { Message } from "../types/Message";

interface WebSocketServiceOptions {
    onMessage: (message: Message) => void;
    onMessageUpdate: (message: Message) => void;
}

class WebSocketService {
    static client: Client | undefined;

    static init(
        brokerURL: string,
        key: string,
        { onMessage, onMessageUpdate }: WebSocketServiceOptions
    ) {
        this.client = new Client({
            brokerURL,
        });

        const clientWebSocket = new WebSocket(brokerURL); // Create a WebSocket instance using 'websocket' library

        this.client.webSocketFactory = () => clientWebSocket; // Set the WebSocket factory function

        this.client.onConnect = function () {
            if (onMessage) {
                this.subscribe(`/app/${key}/new-message`, (message) => {
                    let msg: Message = JSON.parse(message.body);
                    onMessage(msg);
                });
            }

            if (onMessageUpdate) {
                this.subscribe(`/app/${key}/update-message`, (message) => {
                    let updatedMsg: Message = JSON.parse(message.body);
                    onMessageUpdate(updatedMsg);
                });
            }
        };
    }

    static assertClient() {
        if (!this.client) {
            throw new Error("Client is not initialized");
        }
    }

    static activate() {
        this.assertClient();
        this.client!.activate();
    }

    static deactivate() {
        if (!this.client) return;
        this.client.deactivate();
    }
}

export default WebSocketService;
