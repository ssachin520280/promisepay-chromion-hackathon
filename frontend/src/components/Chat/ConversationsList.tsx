import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/client';
import { ConversationPreview } from '../../../types/conversation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ConversationsListProps {
    userId: string;
    onSelectConversation: (conversation: ConversationPreview) => void;
    selectedConversationId?: string;
}

export function ConversationsList({
    userId,
    onSelectConversation,
    selectedConversationId,
}: ConversationsListProps) {
    const [conversations, setConversations] = useState<ConversationPreview[]>([]);

    useEffect(() => {
        // Query conversations where the user is either the client or freelancer
        const conversationsQuery = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
            const newConversations = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as ConversationPreview[];
            setConversations(newConversations);
        });

        return () => unsubscribe();
    }, [userId]);

    const formatDate = (date: Date | Timestamp) => {
        if (date instanceof Timestamp) {
            return format(date.toDate(), 'MMM d');
        }
        return format(date, 'MMM d');
    };

    return (
        <ScrollArea className="h-[600px] border rounded-lg">
            <div className="p-4 space-y-2">
                {conversations.map((conversation) => {
                    const otherUser = conversation.clientId === userId
                        ? { id: conversation.freelancerId, name: conversation.freelancerName }
                        : { id: conversation.clientId, name: conversation.clientName };

                    return (
                        <button
                            key={conversation.id}
                            onClick={() => onSelectConversation(conversation)}
                            className={cn(
                                'w-full p-3 rounded-lg flex items-center gap-3 hover:bg-muted transition-colors',
                                selectedConversationId === conversation.id && 'bg-muted'
                            )}
                        >
                            <Avatar>
                                <AvatarImage src={conversation.otherUserProfileImage} alt={otherUser.name} />
                                <AvatarFallback>{otherUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{otherUser.name}</h4>
                                    {conversation.lastMessage && (
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(conversation.lastMessage.timestamp)}
                                        </span>
                                    )}
                                </div>
                                {conversation.contractId && (
                                    <p className="text-xs text-muted-foreground">Contract: {conversation.contractId}</p>
                                )}
                                {conversation.lastMessage && (
                                    <p className="text-sm text-muted-foreground truncate">
                                        {conversation.lastMessage.text}
                                    </p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </ScrollArea>
    );
} 