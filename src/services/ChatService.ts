import type {
    Message,
    MessageRespose,
} from "../types/Message";

import type { ChannelResponse } from "../types/Channel";

class ChatService {
    static baseURL = "";

    static apiKey = "";

    static init(baseURL: string, apiKey: string) {
        this.baseURL = baseURL;
        this.apiKey = apiKey;
    }

    static async checkApiKey() {
        if (!this.apiKey) {
            throw new Error("API key is not set");
        }
    }

    static async getChannels(): Promise<ChannelResponse> {
        await this.checkApiKey();
        const response = await fetch(
            `${this.baseURL}/channels?apiKey=${this.apiKey}`
        );

        return response.json();
    }

    static async getChannelMessages(
        channelId: number
    ): Promise<MessageRespose> {
        await this.checkApiKey();
        const response = await fetch(
            `${this.baseURL}/channels/${channelId}/messages?apiKey=${this.apiKey}`
        );
        return response.json();
    }

    static async createMessage(
        channelId: number,
        message: {
            body: string;
            author: string;
            parentMessageId?: string;
        },
        attachment: File | null = null
    ): Promise<Message> {
        await this.checkApiKey();

        const formData = new FormData();
        formData.append(
            "message",
            new Blob([JSON.stringify(message)], { type: "application/json" })
        );
        if (attachment) alert("attachment" + attachment.name);

        if (attachment) formData.append("attachment", attachment, attachment.name);
        else formData.append("attachment", new Blob(), "empty");

        const response = await fetch(
            `${this.baseURL}/channels/${channelId}/messages?apiKey=${this.apiKey}`,
            {
                method: "POST",
                body: formData,
            }
        );
        return response.json();
    }

    static async updateMessage(messageId: string, newText: string) {
        await this.checkApiKey();
        const response = await fetch(
            `${this.baseURL}/messages/${messageId}/body?apiKey=${this.apiKey}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ body: newText }),
            }
        );
        return response.json();
    }
}

export default ChatService;
