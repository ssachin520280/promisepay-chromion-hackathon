import { useState } from 'react';
import { ConversationsList } from './ConversationsList';
import { ChatWindow } from './ChatWindow';
import { ConversationPreview } from '../../../types/conversation';

interface ChatProps {
    userId: string;
    userType: 'client' | 'freelancer';
}

export function Chat({ userId, userType }: ChatProps) {
    const [selectedConversation, setSelectedConversation] = useState<ConversationPreview | null>(null);

    const handleSelectConversation = (conversation: ConversationPreview) => {
        setSelectedConversation(conversation);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
                <ConversationsList
                    userId={userId}
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation?.id}
                />
            </div>
            <div className="md:col-span-2">
                {selectedConversation ? (
                    <ChatWindow
                        conversationId={selectedConversation.id}
                        userId={userId}
                        otherUser={{
                            id: userType === 'client' ? selectedConversation.freelancerId : selectedConversation.clientId,
                            name: userType === 'client' ? selectedConversation.freelancerName : selectedConversation.clientName,
                            profileImage: selectedConversation.otherUserProfileImage,
                        }}
                    />
                ) : (
                    <div className="h-[600px] border rounded-lg flex items-center justify-center text-muted-foreground">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
} 