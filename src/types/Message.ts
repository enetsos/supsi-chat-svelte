
import type { Attachment } from "./Attachment"

export type Message = {
    id: string;
    parentMessageId: string | null;
    body: string;
    author: string;
    date: string;
    lastEditTime: string;
    channel: number;
    attachment: Attachment | null;
};

export type MessageRespose = Message[];