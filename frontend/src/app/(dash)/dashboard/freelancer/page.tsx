"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth"; // Add this import
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
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";
import { Contract } from "../../../../../types/contracts";
import { Chat } from '@/components/Chat/Chat';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function FreelancerDashboard() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(
        null
    );
    const [isSubmitWorkOpen, setIsSubmitWorkOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [walletDialogOpen, setWalletDialogOpen] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [savingWallet, setSavingWallet] = useState(false);
    const [walletError, setWalletError] = useState("");

    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");

    // Fetch authenticated user info
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                setUserId(user.uid);
                setUserName(user.displayName || user.email || "Freelancer");
            } else {
                setUserId(null);
                setUserName("Freelancer");
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchContracts = async () => {
            if (!userId) return;

            const q = query(
                collection(db, "contracts"),
                where("freelancerId", "==", userId)
            );

            const snapshot = await getDocs(q);
            const data: Contract[] = snapshot.docs.map((doc) => {
                const raw = doc.data();

                return {
                    id: doc.id,
                    title: raw.title,
                    description: raw.description,
                    amount: raw.amount,
                    amountUsd: raw.amountUsd,
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
    }, [userId]);

    // Fetch wallet address on mount
    useEffect(() => {
        const fetchWallet = async () => {
            if (!userId) return;
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setWalletAddress(userSnap.data().walletAddress || "");
            }
        };
        fetchWallet();
    }, [userId]);

    const handleAcceptContract = async (contractId: string) => {
        const acceptedAt = new Date();
        const blockchainHash = `0x${Math.random().toString(16).substring(2, 30)}`;

        setContracts((prev) =>
            prev.map((c) =>
                c.id === contractId
                    ? {
                        ...c,
                        status: "active",
                        acceptedAt,
                        blockchainHash,
                    }
                    : c
            )
        );

        // Firestore update
        try {
            const contractRef = doc(db, "contracts", contractId);
            await setDoc(
                contractRef,
                {
                    status: "active",
                    acceptedAt: Timestamp.fromDate(acceptedAt),
                    blockchainHash,
                },
                { merge: true }
            );
        } catch (err) {
            console.error("Failed to update contract in Firestore:", err);
        }
    };

    const handleSubmitWork = (contractId: string) => {
        const contract = contracts.find((c) => c.id === contractId);
        setSelectedContract(contract ?? null);
        setIsSubmitWorkOpen(true);
    };

    const handleWorkSubmitted = async () => {
        if (!selectedContract) return;

        const submittedAt = new Date();

        setContracts((prev) =>
            prev.map((c) =>
                c.id === selectedContract.id
                    ? {
                        ...c,
                        status: "submitted",
                        submittedAt,
                    }
                    : c
            )
        );

        // Firestore update
        try {
            const contractRef = doc(db, "contracts", selectedContract.id);
            await setDoc(
                contractRef,
                {
                    status: "submitted",
                    submittedAt: Timestamp.fromDate(submittedAt),
                },
                { merge: true }
            );
        } catch (err) {
            console.error("Failed to update contract in Firestore:", err);
        }
    };

    const handleSaveWallet = async () => {
        setSavingWallet(true);
        setWalletError("");
        try {
            if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
                setWalletError("Invalid wallet address");
                setSavingWallet(false);
                return;
            }
            if (!auth.currentUser) throw new Error("Not authenticated");
            const userRef = doc(db, "users", auth.currentUser.uid);
            await setDoc(userRef, { walletAddress }, { merge: true });
            setWalletDialogOpen(false);
        } catch {
            setWalletError("Failed to save wallet address");
        } finally {
            setSavingWallet(false);
        }
    };

    // Stats
    const totalEarnings = contracts
        .filter((c) => c.status === "completed")
        .reduce((sum, c) => sum + c.amountUsd, 0);

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
                userName={userName}
            />

            <main className="flex-1 container mx-auto px-4 py-6">
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h1 className="text-2xl font-bold">Freelancer Dashboard</h1>
                        <p className="text-muted-foreground">Manage your projects</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Wallet: {walletAddress ? (
                                <span className="font-mono">{walletAddress}</span>
                            ) : (
                                <span className="italic">Not set</span>
                            )}
                        </span>
                        <Button size="sm" onClick={() => setWalletDialogOpen(true)}>
                            {walletAddress ? "Edit Wallet" : "Add Wallet"}
                        </Button>
                    </div>
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
                            {userId && (
                                <Chat userId={userId} userType="freelancer" />
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

            <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{walletAddress ? "Edit Wallet Address" : "Add Wallet Address"}</DialogTitle>
                    </DialogHeader>
                    <Input
                        placeholder="0x..."
                        value={walletAddress}
                        onChange={e => setWalletAddress(e.target.value)}
                        className="font-mono"
                        maxLength={42}
                    />
                    {walletError && <div className="text-red-500 text-sm">{walletError}</div>}
                    <DialogFooter>
                        <Button onClick={handleSaveWallet} disabled={savingWallet}>
                            {savingWallet ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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