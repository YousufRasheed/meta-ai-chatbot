export interface FacebookAttachment {
    type: 'image' | 'video' | 'audio' | 'file';
    payload: {
        url: string;
    };
}

export interface FacebookMessage {
    mid: string;
    text?: string;
    attachments?: FacebookAttachment[];
}

export interface MessagingEvent {
    sender: {
        id: string;
    };
    recipient: {
        id: string;
    };
    timestamp: number;
    message: FacebookMessage;
}

export interface WebhookEntry {
    id: string;
    time: number;
    messaging: MessagingEvent[];
}

export interface WebhookEvent {
    object: string;
    entry: WebhookEntry[];
}
