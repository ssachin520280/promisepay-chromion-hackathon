import { Timestamp } from 'firebase/firestore';

export interface Conversation {
    id: string;
    clientId: string;
    freelancerId: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: Date;
    };
    messages: Message[];
}

export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    read: boolean;
}

export interface ConversationPreview {
    id: string;
    clientId: string;
    freelancerId: string;
    clientName: string;
    freelancerName: string;
    otherUserProfileImage?: string;
    contractId?: string;
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: Date | Timestamp;
    };
    updatedAt: Date | Timestamp;
}

export interface MessageNotification {
    conversationId: string;
    messageId: string;
    senderId: string;
    content: string;
    timestamp: Date;
    read: boolean;
} 