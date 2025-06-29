"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { DashboardHeader } from "@/components/DashboardHeader"
import { Chat } from '@/components/Chat/Chat'
import { auth } from "../../../../../../firebase/client"

export default function MessagesPage() {
    const [clientId, setClientId] = useState<string | null>(null)
    const [userName, setUserName] = useState<string>("")

    // Fetch authenticated user info
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                setClientId(user.uid)
                setUserName(user.displayName || user.email || "Client")
            } else {
                setClientId(null)
            }
        })

        return () => unsubscribe()
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <DashboardHeader userType="client" userName={userName} />
            <main className="flex-1 container max-w-6xl py-6 px-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Messages</h1>
                    <p className="text-muted-foreground">Communicate with your freelancers in real-time</p>
                </div>

                <div className="bg-card rounded-lg border shadow-sm">
                    <div className="p-6">
                        {clientId ? (
                            <Chat userId={clientId} userType="client" />
                        ) : (
                            <div className="flex items-center justify-center h-96 text-muted-foreground">
                                Loading...
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
} 