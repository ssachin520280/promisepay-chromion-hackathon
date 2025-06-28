"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ContractsList } from "@/components/ContractsList";
import { SubmitWorkDialog } from "@/components/SubmitWorkDialog";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { auth, db } from "../../../../../firebase/client";
import {
    collection,
    query,
    where,
    getDocs,
    Timestamp,
} from "firebase/firestore";
import { Contract } from "../../../../../types/contracts";
import { Chat } from '@/components/Chat/Chat';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function FreelancerDashboard() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(
        null
    );
    const [isSubmitWorkOpen, setIsSubmitWorkOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchContracts = async () => {
            if (!auth.currentUser) return;

            const q = query(
                collection(db, "contracts"),
                where("freelancerId", "==", auth.currentUser.uid)
            );

            const snapshot = await getDocs(q);
            const data: Contract[] = snapshot.docs.map((doc) => {
                const raw = doc.data();

                return {
                    id: doc.id,
                    title: raw.title,
                    description: raw.description,
                    amount: raw.amount,
                    deadline: raw.deadline,
                    status: raw.status,
                    clientId: raw.clientId,
                    clientName: raw.clientName,
                    clientEmail: raw.clientEmail,
                    freelancerId: raw.freelancerId,
                    freelancerName: raw.freelancerName,
                    freelancerEmail: raw.freelancerEmail,
                    createdAt: raw.createdAt,
                    acceptedAt: raw.acceptedAt ?? null,
                    submittedAt: raw.submittedAt ?? null,
                    completedAt: raw.completedAt ?? null,
                    blockchainHash: raw.blockchainHash ?? null,
                    rating: raw.rating ?? {},
                    unionLogs: raw.unionLogs ?? {},
                };
            });

            setContracts(data);
        };

        fetchContracts();
    }, []);

    const handleAcceptContract = (contractId: string) => {
        setContracts((prev) =>
            prev.map((c) =>
                c.id === contractId
                    ? {
                        ...c,
                        status: "active",
                        acceptedAt: new Date(),
                        blockchainHash: `0x${Math.random().toString(16).substring(2, 30)}`,
                    }
                    : c
            )
        );

        // Firestore update can be added here
    };

    const handleSubmitWork = (contractId: string) => {
        const contract = contracts.find((c) => c.id === contractId);
        setSelectedContract(contract ?? null);
        setIsSubmitWorkOpen(true);
    };

    const handleWorkSubmitted = () => {
        if (!selectedContract) return;

        setContracts((prev) =>
            prev.map((c) =>
                c.id === selectedContract.id
                    ? {
                        ...c,
                        status: "submitted",
                        submittedAt: new Date(),
                    }
                    : c
            )
        );
    };

    // Stats
    const totalEarnings = contracts
        .filter((c) => c.status === "completed")
        .reduce((sum, c) => sum + c.amount, 0);

    const pendingContracts = contracts.filter((c) => c.status === "pending")
        .length;
    const activeContracts = contracts.filter((c) => c.status === "active").length;
    const completedContracts = contracts.filter(
        (c) => c.status === "completed"
    ).length;

    const clientRatings = contracts
        .filter((c) => c.rating?.clientToFreelancer)
        .map((c) => c.rating!.clientToFreelancer!);

    const avgRating =
        clientRatings.length > 0
            ? clientRatings.reduce((sum, r) => sum + r.stars, 0) / clientRatings.length
            : 0;

    return (
        <div className="min-h-screen w-full flex flex-col bg-background">
            <DashboardHeader
                userType="freelancer"
                userName={auth.currentUser?.displayName || "Freelancer"}
            />

            <main className="flex-1 container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Freelancer Dashboard</h1>
                    <p className="text-muted-foreground">Manage your projects</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatsCard
                                value={`$${totalEarnings.toLocaleString()}`}
                                label="Total Earnings"
                                isCurrency
                            />
                            <StatsCard value={activeContracts} label="Active Projects" />
                            <StatsCard value={pendingContracts} label="Pending Offers" />
                            <StatsCard
                                value={avgRating.toFixed(1)}
                                label="Client Rating"
                                isRating
                            />
                        </div>

                        {/* Contracts List */}
                        <div className="bg-card rounded-lg border shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">My Contracts</h2>
                            <ContractsList
                                contracts={contracts}
                                userType="freelancer"
                                onAcceptContract={handleAcceptContract}
                                onSubmitWork={handleSubmitWork}
                            />
                        </div>

                        {/* Recent Feedback */}
                        {completedContracts > 0 && clientRatings.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Recent Feedback</h2>
                                <div className="space-y-4">
                                    {clientRatings.slice(0, 3).map((rating, i) => (
                                        <FeedbackCard key={i} rating={rating} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="messages" className="m-0">
                        <div className="bg-card rounded-lg border shadow-sm p-6">
                            {auth.currentUser && (
                                <Chat userId={auth.currentUser.uid} userType="freelancer" />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <SubmitWorkDialog
                open={isSubmitWorkOpen}
                onOpenChange={setIsSubmitWorkOpen}
                contract={selectedContract}
                onWorkSubmitted={handleWorkSubmitted}
            />
        </div>
    );
}

// Helper Components
function StatsCard({
    value,
    label,
    isCurrency,
    isRating,
}: {
    value: number | string;
    label: string;
    isCurrency?: boolean;
    isRating?: boolean;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                    <div
                        className={`text-2xl font-bold ${isCurrency ? "text-green-600 dark:text-green-400" : ""
                            }`}
                    >
                        {value}
                        {isRating && (
                            <div className="mt-1">
                                <StarRating rating={Number(value)} readOnly size={16} />
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function FeedbackCard({
    rating,
}: {
    rating: {
        stars: number;
        comment: string;
        createdAt: Date | Timestamp | null;
    };
}) {
    const formattedDate =
        rating.createdAt instanceof Timestamp
            ? format(rating.createdAt.toDate(), "MMM dd, yyyy")
            : rating.createdAt instanceof Date
                ? format(rating.createdAt, "MMM dd, yyyy")
                : "Unknown Date";

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <StarRating rating={rating.stars} readOnly size={16} />
                            <span className="text-xs text-muted-foreground">
                                {formattedDate}
                            </span>
                        </div>
                        <p className="mt-2 text-sm">{rating.comment}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
