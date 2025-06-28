import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { db } from '../../firebase/client';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp, addDoc } from 'firebase/firestore';
import { Message } from '../../types/conversation';

export const useChat = (conversationId: string, userId: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
            path: '/api/socket',
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 60000, // Increased timeout to 60 seconds
            forceNew: true,
            withCredentials: true
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            socketInstance.emit('join-conversation', conversationId);
            socketInstance.emit('user-online', { userId, conversationId });
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
            socketInstance.emit('user-offline', { userId, conversationId });
        });

        socketInstance.on('new-message', (message: Message) => {
            console.log('New message received:', message);
            // Convert Firestore Timestamp to Date
            const processedMessage = {
                ...message,
                timestamp: message.timestamp instanceof Timestamp
                    ? message.timestamp.toDate()
                    : new Date(message.timestamp)
            };
            setMessages((prev) => [...prev, processedMessage]);
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.emit('leave-conversation', conversationId);
            socketInstance.emit('user-offline', { userId, conversationId });
            socketInstance.disconnect();
        };
    }, [conversationId, userId]);

    useEffect(() => {
        // Subscribe to Firestore messages
        const messagesQuery = query(
            collection(db, 'messages'),
            where('conversationId', '==', conversationId),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp instanceof Timestamp
                        ? data.timestamp.toDate()
                        : new Date(data.timestamp)
                } as Message;
            });
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [conversationId]);

    const sendMessage = async (content: string) => {
        try {
            // Create message data
            const messageData = {
                conversationId,
                senderId: userId,
                content,
                timestamp: Timestamp.now(),
                read: false
            };

            // Always store in Firestore first
            const messageRef = await addDoc(collection(db, 'messages'), messageData);

            // Update conversation's lastMessage and updatedAt
            const conversationRef = doc(db, 'conversations', conversationId);
            await updateDoc(conversationRef, {
                lastMessage: {
                    text: content,
                    senderId: userId,
                    timestamp: Timestamp.now()
                },
                updatedAt: Timestamp.now()
            });

            // If socket is connected, emit the message
            if (socket && isConnected) {
                socket.emit('send-message', {
                    ...messageData,
                    id: messageRef.id,
                    timestamp: new Date() // Convert to Date for socket emission
                });
            }

            console.log('Message sent:', messageData);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const markAsRead = async (messageId: string) => {
        try {
            const messageRef = doc(db, 'messages', messageId);
            await updateDoc(messageRef, {
                read: true,
            });
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    return {
        messages,
        sendMessage,
        markAsRead,
        isConnected,
    };
}; 