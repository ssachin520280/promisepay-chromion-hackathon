"use client";

import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getContractsByClientId } from "@/lib/contracts";
import { auth } from "../../../../../firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ContractsList } from "@/components/ContractsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CreateContractForm } from "@/components/CreateContractForm";
import { ReleasePaymentDialog } from "@/components/ReleasePaymentDialog";
import { Contract } from "../../../../../types/contracts"; // Ensure this is properly typed
import { Plus, ListChecks } from "lucide-react";
import { Chat } from '@/components/Chat/Chat';
import { useSearchParams } from 'next/navigation';

export default function ClientDashboard() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        const tab = searchParams.get('tab');
        return tab === 'create' || tab === 'messages' ? tab : 'contracts';
    });
    const [contracts, setContracts] = useState<Contract[]>([]); // Ensure the type is Contract[]
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [isReleasePaymentOpen, setIsReleasePaymentOpen] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [aiStatuses, setAIStatuses] = useState<Record<string, boolean>>({});

    // Fetch authenticated user info
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                setClientId(user.uid);
                setUserName(user.displayName || user.email || "Client");
            } else {
                setClientId(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch contracts once clientId is available
    useEffect(() => {
        if (!clientId) return;

        async function fetchContracts() {
            setLoading(true);
            try {
                if (!clientId) throw new Error("Client ID is null");
                const fetched: Contract[] = await getContractsByClientId(clientId); // Ensure this returns Contract[] type
                setContracts(fetched); // Set contracts as an array of Contract type
            } catch (err) {
                console.error("Failed to fetch contracts:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchContracts();
    }, [clientId]);

    // Fetch AI approval status for all contracts
    useEffect(() => {
        async function fetchAIStatuses() {
            const statuses: Record<string, boolean> = {};
            for (const contract of contracts) {
                console.log(contract.aiApproved);
                // Assuming contract.id is the projectId (number or string)
                try {
                    statuses[contract.id] = contract.aiApproved ?? false;
                } catch {
                    statuses[contract.id] = false;
                }
            }
            setAIStatuses(statuses);
        }
        if (contracts.length > 0) {
            fetchAIStatuses();
            // Optionally, poll every 10 seconds:
            const interval = setInterval(fetchAIStatuses, 10000);
            return () => clearInterval(interval);
        }
    }, [contracts]);

    const handleReleasePayment = (contractId: string) => {
        const contract = contracts.find(c => c.id === contractId);
        if (contract) {
            setSelectedContract(contract);
            setIsReleasePaymentOpen(true);
        }
    };

    const handlePaymentReleased = () => {
        if (!selectedContract) return;

        setContracts(prevContracts =>
            prevContracts.map(contract =>
                contract.id === selectedContract.id
                    ? {
                        ...contract,
                        status: "completed" as const,
                        completedAt: Timestamp.fromDate(new Date()),  // Convert Date to Firestore Timestamp
                        blockchainHash: `0x${Math.random().toString(16).substring(2, 30)}`,
                    }
                    : contract
            )
        );
    };

    const refreshContracts = async () => {
        if (!clientId) return;
        try {
            const updated: Contract[] = await getContractsByClientId(clientId); // Ensure this returns Contract[] type
            setContracts(updated); // Set contracts as an array of Contract type
        } catch (err) {
            console.error("Failed to refresh contracts:", err);
        }
    };

    return (
        <div className="min-h-screen mt-4 flex flex-col bg-background">
            <DashboardHeader userType="client" userName={userName} />
            <main className="flex-1 container max-w-6xl py-6 px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    {activeTab === "create" && (
                        <Button
                            variant="outline"
                            className="mt-4 md:mt-0"
                            onClick={() => setActiveTab("contracts")}
                        >
                            <ListChecks className="mr-2 h-4 w-4" />
                            View Contracts
                        </Button>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="contracts">My Contracts</TabsTrigger>
                        <TabsTrigger value="create">Create Contract</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                    </TabsList>

                    <TabsContent value="contracts" className="m-0">
                        <div className="bg-card rounded-lg border shadow-sm">
                            <div className="p-6">
                                {loading ? (
                                    <p>Loading contracts...</p>
                                ) : (
                                    <ContractsList
                                        contracts={contracts.map(c => ({
                                            ...c,
                                            aiApproved: aiStatuses[c.id] ?? false,
                                        }))}
                                        userType="client"
                                        onReleasePayment={handleReleasePayment}
                                    />
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="create" className="m-0">
                        <div className="bg-card rounded-lg border shadow-sm">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Create New Contract</h2>
                                <CreateContractForm
                                    onSuccess={async () => {
                                        await refreshContracts();
                                        setActiveTab("contracts");
                                    }}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="messages" className="m-0">
                        <div className="bg-card rounded-lg border shadow-sm">
                            <div className="p-6">
                                {clientId && <Chat userId={clientId} userType="client" />}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <ReleasePaymentDialog
                open={isReleasePaymentOpen}
                onOpenChange={setIsReleasePaymentOpen}
                contract={selectedContract}
                onPaymentReleased={handlePaymentReleased}
            />
        </div>
    );
}