import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Message } from '../../../types/conversation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/client';

interface ChatWindowProps {
    conversationId: string;
    userId: string;
    otherUser: {
        id: string;
        name: string;
        profileImage?: string;
    };
}

export function ChatWindow({ conversationId, userId, otherUser }: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const { messages, sendMessage } = useChat(conversationId, userId);
    const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Subscribe to conversation updates for online status
    useEffect(() => {
        const conversationRef = doc(db, 'conversations', conversationId);
        const unsubscribe = onSnapshot(conversationRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const participantStatus = data.participantStatus || {};
                setIsOtherUserOnline(participantStatus[otherUser.id] || false);
            }
        });

        return () => unsubscribe();
    }, [conversationId, otherUser.id]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    const formatMessageTime = (timestamp: Date | number | Timestamp) => {
        try {
            let date: Date;
            if (timestamp instanceof Timestamp) {
                date = timestamp.toDate();
            } else if (timestamp instanceof Date) {
                date = timestamp;
            } else {
                date = new Date(timestamp);
            }
            return format(date, 'h:mm a');
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return 'Invalid time';
        }
    };

    return (
        <div className="flex flex-col h-[600px] border rounded-lg">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{otherUser.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            isOtherUserOnline ? "bg-green-500" : "bg-gray-400"
                        )} />
                        {isOtherUserOnline ? 'Online' : 'Offline'}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((message: Message) => (
                        <div
                            key={message.id}
                            className={cn(
                                'flex w-full',
                                message.senderId === userId ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div className={cn(
                                'flex gap-2 max-w-[80%]',
                                message.senderId === userId ? 'flex-row-reverse' : 'flex-row'
                            )}>
                                {message.senderId !== userId && (
                                    <Avatar className="w-8 h-8 flex-shrink-0">
                                        <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
                                        <AvatarFallback>{otherUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                        'rounded-lg p-3',
                                        message.senderId === userId
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    )}
                                >
                                    <p className="break-words">{message.content}</p>
                                    <div className={cn(
                                        "flex items-center gap-1 mt-1",
                                        message.senderId === userId ? "justify-end" : "justify-start"
                                    )}>
                                        <span className="text-xs opacity-70">
                                            {formatMessageTime(message.timestamp)}
                                        </span>
                                        {message.senderId === userId && (
                                            <span className="text-xs opacity-70">
                                                {message.read ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                        Send
                    </Button>
                </div>
            </form>
        </div>
    );
} 