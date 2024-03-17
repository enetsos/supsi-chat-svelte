// stompIntegration.ts

import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';

const apiKey = 'YourAPIKey'; // Replace 'YourAPIKey' with your chosen API key
const brokerURL = `wss://supsi-ticket.cloudns.org/supsi-chat/supsi-chat-websocket`;

let stompClient: Client | null = null;

export function connectToStomp(): Promise<Client> {
    if (!stompClient) {
        stompClient = new Client({
            brokerURL,
            debug: (str) => {
                console.log(str);
            },
        });
        return new Promise((resolve, reject) => {
            if (stompClient) {
                stompClient.onConnect = () => {
                    console.log('Connected to WebSocket');
                    resolve(stompClient!);
                };
                stompClient.onStompError = (frame) => {
                    console.error('Stomp error:', frame);
                    reject(frame);
                };
                stompClient.activate();
            }
        });
    }
    return Promise.resolve(stompClient);
}


export function subscribeToChannel(channelId: string, callback: (message: any) => void): StompSubscription | null {
    if (stompClient) {
        return stompClient.subscribe(`/app/${apiKey}/channel/${channelId}`, callback);
    }
    return null;
}
