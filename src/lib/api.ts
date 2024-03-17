// api.ts

const apiKey = 'losa'; // Replace 'YourAPIKey' with your chosen API key
const baseURL = `https://supsi-ticket.cloudns.org/supsi-chat/bff`;

export async function fetchChannels(): Promise<any[]> {
    const response = await fetch(`${baseURL}/channels?apiKey=${apiKey}`);
    return await response.json();
}

export async function fetchMessages(channelId: string): Promise<any[]> {
    const response = await fetch(`${baseURL}/channels/${channelId}/messages?apiKey=${apiKey}`);
    return await response.json();
}

export async function createMessage(channelId: string, message: string, attachment?: File): Promise<void> {
    const formData = new FormData();
    const messageData = { body: message, author: 'losa' };
    formData.append('message', JSON.stringify(messageData));
    if (attachment) {
        formData.append('attachment', attachment);
    }
    await fetch(`${baseURL}/channels/${channelId}/messages?apiKey=${apiKey}`, {
        method: 'POST',
        body: formData,
    });
}

export async function updateMessage(messageId: string, newText: string): Promise<void> {
    await fetch(`${baseURL}/messages/${messageId}/body?apiKey=${apiKey}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: newText }),
    });
}
