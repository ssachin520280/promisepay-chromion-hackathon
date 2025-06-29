"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"

export default function MessagesPage() {
    // Mock data - replace with real data from your backend
    const conversations = [
        {
            id: "1",
            freelancer: "John Doe",
            avatar: "/avatars/john.jpg",
            lastMessage: "I've completed the first milestone. Can you review it?",
            timestamp: "2 hours ago",
            unread: 2,
            online: true
        },
        {
            id: "2",
            freelancer: "Jane Smith",
            avatar: "/avatars/jane.jpg",
            lastMessage: "The design mockups are ready for your feedback.",
            timestamp: "1 day ago",
            unread: 0,
            online: false
        },
        {
            id: "3",
            freelancer: "Mike Johnson",
            avatar: "/avatars/mike.jpg",
            lastMessage: "When can we schedule the project kickoff call?",
            timestamp: "3 days ago",
            unread: 1,
            online: true
        }
    ]

    return (
        <div>
            <DashboardHeader userType="client" userName="Client" />
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Messages</h1>
                    <p className="text-muted-foreground">Communicate with your freelancers</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Conversations List */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Conversations</CardTitle>
                            <CardDescription>Your active conversations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="relative">
                                <Input placeholder="Search conversations..." className="pl-8" />
                                <MessageSquare className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                            
                            <div className="space-y-2 mt-4">
                                {conversations.map((conversation) => (
                                    <div 
                                        key={conversation.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarImage src={conversation.avatar} />
                                                <AvatarFallback>
                                                    {conversation.freelancer.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            {conversation.online && (
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium truncate">{conversation.freelancer}</p>
                                                <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                                        </div>
                                        {conversation.unread > 0 && (
                                            <Badge variant="destructive" className="ml-2">
                                                {conversation.unread}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chat Area */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <Avatar>
                                    <AvatarImage src="/avatars/john.jpg" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>John Doe</CardTitle>
                                    <CardDescription className="flex items-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        Online
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 flex flex-col">
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg">
                                    <div className="flex justify-end">
                                        <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                                            <p>Hi John, how's the project coming along?</p>
                                            <p className="text-xs opacity-75 mt-1">2:30 PM</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                                            <p>Great! I've completed the first milestone. Can you review it?</p>
                                            <p className="text-xs text-muted-foreground mt-1">2:32 PM</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end">
                                        <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                                            <p>Perfect! I'll take a look and get back to you with feedback.</p>
                                            <p className="text-xs opacity-75 mt-1">2:35 PM</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Message Input */}
                                <div className="flex space-x-2">
                                    <Input placeholder="Type your message..." className="flex-1" />
                                    <Button size="icon">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 