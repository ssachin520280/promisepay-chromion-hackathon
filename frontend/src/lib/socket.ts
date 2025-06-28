import { Server as SocketIOServer } from 'socket.io';
import { db } from '../../firebase/client';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';

let io: SocketIOServer | undefined;
const onlineUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

export const initSocket = () => {
    if (!io) {
        io = new SocketIOServer({
            cors: {
                origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            },
            path: '/api/socket',
            transports: ['websocket', 'polling'],
            allowEIO3: true
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            let currentUserId: string | null = null;

            socket.on('join-conversation', (conversationId: string) => {
                socket.join(conversationId);
                console.log(`Client ${socket.id} joined conversation ${conversationId}`);
            });

            socket.on('leave-conversation', (conversationId: string) => {
                socket.leave(conversationId);
                console.log(`Client ${socket.id} left conversation ${conversationId}`);
            });

            socket.on('user-online', async ({ userId, conversationId }: { userId: string; conversationId: string }) => {
                currentUserId = userId;
                if (!onlineUsers.has(userId)) {
                    onlineUsers.set(userId, new Set());
                }
                onlineUsers.get(userId)?.add(socket.id);

                // Update conversation participants' online status
                const conversationRef = doc(db, 'conversations', conversationId);
                const conversationDoc = await getDoc(conversationRef);
                if (conversationDoc.exists()) {
                    const conversation = conversationDoc.data();
                    const participants = conversation.participants || [];

                    // Update online status for all participants
                    participants.forEach(async (participantId: string) => {
                        const isOnline = onlineUsers.has(participantId) && onlineUsers.get(participantId)!.size > 0;
                        await updateDoc(conversationRef, {
                            [`participantStatus.${participantId}`]: isOnline
                        });
                    });
                }

                // Notify all clients in the conversation about the online status
                io?.to(conversationId).emit('user-status-change', {
                    userId,
                    isOnline: true
                });
            });

            socket.on('user-offline', async ({ userId, conversationId }: { userId: string; conversationId: string }) => {
                if (onlineUsers.has(userId)) {
                    onlineUsers.get(userId)?.delete(socket.id);
                    if (onlineUsers.get(userId)?.size === 0) {
                        onlineUsers.delete(userId);

                        // Update conversation participants' online status
                        const conversationRef = doc(db, 'conversations', conversationId);
                        await updateDoc(conversationRef, {
                            [`participantStatus.${userId}`]: false
                        });

                        // Notify all clients in the conversation about the offline status
                        io?.to(conversationId).emit('user-status-change', {
                            userId,
                            isOnline: false
                        });
                    }
                }
            });

            socket.on('send-message', async (data: {
                conversationId: string;
                senderId: string;
                content: string;
                timestamp: Date | number;
                read: boolean;
                id?: string;
            }) => {
                try {
                    let messageId = data.id;

                    // If message doesn't have an ID, it wasn't stored in Firestore yet
                    if (!messageId) {
                        const messageRef = await addDoc(collection(db, 'messages'), {
                            conversationId: data.conversationId,
                            senderId: data.senderId,
                            content: data.content,
                            timestamp: serverTimestamp(),
                            read: false
                        });
                        messageId = messageRef.id;
                    }

                    // Update conversation's lastMessage and updatedAt
                    const conversationRef = doc(db, 'conversations', data.conversationId);
                    await updateDoc(conversationRef, {
                        lastMessage: {
                            text: data.content,
                            senderId: data.senderId,
                            timestamp: serverTimestamp()
                        },
                        updatedAt: serverTimestamp()
                    });

                    // Broadcast message to all clients in the conversation
                    io?.to(data.conversationId).emit('new-message', {
                        id: messageId,
                        ...data,
                        timestamp: new Date(),
                        read: false
                    });
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            });

            socket.on('mark-as-read', async (data: {
                conversationId: string;
                messageId: string;
            }) => {
                try {
                    const messageRef = doc(db, 'messages', data.messageId);
                    await updateDoc(messageRef, { read: true });
                    io?.to(data.conversationId).emit('message-read', data.messageId);
                } catch (error) {
                    console.error('Error marking message as read:', error);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                if (currentUserId) {
                    const userSockets = onlineUsers.get(currentUserId);
                    if (userSockets) {
                        userSockets.delete(socket.id);
                        if (userSockets.size === 0) {
                            onlineUsers.delete(currentUserId);
                        }
                    }
                }
            });
        });
    }
    return io;
}; 