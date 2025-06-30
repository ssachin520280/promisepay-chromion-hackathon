"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, DollarSign, User, FileText, AlertTriangle, Check, X } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { getContractById } from "@/lib/contracts"
import { toast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import EscrowFactoryABI from "@/abi/EscrowFactory.json"
import ConsumerABI from "@/abi/Consumer.json"
import { Timestamp } from "firebase/firestore"
import { auth } from "../../../../../../../firebase/client"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { Contract } from "../../../../../../../types/contracts"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../../../../../../firebase/client"

const ESCROW_FACTORY_ADDRESS = "0xde8080f7d36c42ae2ffdd60b65a52d49872a960c";
const CONSUMER_ADDRESS = "0x8807bda84db369a3270820f978337f5f1792dd5a";
const SUBSCRIPTION_ID = 5200;

export default function ClientContractDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const contractId = params.id as string
    const [contract, setContract] = useState<Contract | null>(null)
    const [loading, setLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [clientId, setClientId] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
            if (user) {
                setClientId(user.uid);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!contractId) return;

        async function fetchContract() {
            setLoading(true);
            try {
                const fetchedContract = await getContractById(contractId);
                setContract(fetchedContract);
            } catch (error) {
                console.error("Failed to fetch contract:", error);
                toast({
                    title: "Error",
                    description: "Failed to load contract details",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }

        fetchContract();
    }, [contractId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Clock className="w-4 h-4 text-blue-500" />
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case "pending":
                return <Clock className="w-4 h-4 text-yellow-500" />
            case "submitted":
                return <Check className="w-4 h-4 text-orange-500" />
            case "cancelled":
                return <X className="w-4 h-4 text-red-500" />
            default:
                return <XCircle className="w-4 h-4 text-red-500" />
        }
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            active: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            submitted: "bg-orange-100 text-orange-800",
            cancelled: "bg-red-100 text-red-800"
        }
        return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateInput: string | Date | Timestamp | undefined) => {
        if (!dateInput) return "N/A";
        
        try {
            let date: Date;
            if (typeof dateInput === "string") {
                date = new Date(dateInput);
            } else if (dateInput instanceof Timestamp) {
                date = dateInput.toDate();
            } else {
                date = dateInput;
            }
            
            return date.toLocaleDateString();
        } catch {
            return "Invalid date";
        }
    };

    const handleApproveWork = async () => {
        if (!contract?.projectId) {
            toast({
                title: "Error",
                description: "Project ID not found",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        try {
            if (!window.ethereum) {
                throw new Error("MetaMask not found. Please install MetaMask.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const escrowFactory = new ethers.Contract(
                ESCROW_FACTORY_ADDRESS,
                EscrowFactoryABI.abi,
                signer
            );

            const tx = await escrowFactory.approveByClient(contract.projectId);
            const receipt = await tx.wait();

            // Only update Firestore after confirming blockchain transaction success
            if (receipt.status === 1) {
                const contractRef = doc(db, "contracts", contract.id);
                await setDoc(
                    contractRef,
                    {
                        clientApproved: true,
                        blockchainHash: receipt.hash,
                    },
                    { merge: true }
                );

                toast({
                    title: "Work Approved",
                    description: "The work has been approved successfully.",
                });

                // Refresh contract data
                const updatedContract = await getContractById(contractId);
                setContract(updatedContract);
            } else {
                throw new Error("Transaction failed on blockchain");
            }

        } catch (error: any) {
            console.error("Error approving work:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to approve work",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReleasePayment = async () => {
        if (!contract?.projectId) {
            toast({
                title: "Error",
                description: "Project ID not found",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        try {
            if (!window.ethereum) {
                throw new Error("MetaMask not found. Please install MetaMask.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const escrowFactory = new ethers.Contract(
                ESCROW_FACTORY_ADDRESS,
                EscrowFactoryABI.abi,
                signer
            )

            // Release funds
            const releaseTx = await escrowFactory.releaseFunds(contract.projectId);
            const receipt = await releaseTx.wait();

            // Only update Firestore after confirming blockchain transaction success
            if (receipt.status === 1) {
                const contractRef = doc(db, "contracts", contract.id);
                await setDoc(
                    contractRef,
                    {
                        status: "completed",
                        completedAt: Timestamp.fromDate(new Date()),
                        blockchainHash: receipt.hash,
                    },
                    { merge: true }
                );

                toast({
                    title: "Payment Released",
                    description: "Payment has been successfully released to the freelancer.",
                });

                // Refresh contract data
                const updatedContract = await getContractById(contractId);
                setContract(updatedContract);
            } else {
                throw new Error("Transaction failed on blockchain");
            }

        } catch (error: any) {
            console.error("Error releasing payment:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to release payment",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelContract = async () => {
        if (!contract?.projectId) {
            toast({
                title: "Error",
                description: "Project ID not found",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        try {
            if (!window.ethereum) {
                throw new Error("MetaMask not found. Please install MetaMask.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const consumer = new ethers.Contract(
                CONSUMER_ADDRESS,
                ConsumerABI.abi,
                signer
            );

            // Get the signer's address
            const signerAddress = await signer.getAddress();

            // Request cancellation through the Consumer contract
            const tx = await consumer.requestCancellation(
                contract.projectId,
                signerAddress,
                SUBSCRIPTION_ID
            );
            const receipt = await tx.wait();

            // Only update Firestore after confirming blockchain transaction success
            if (receipt.status === 1) {
                const contractRef = doc(db, "contracts", contract.id);
                await setDoc(
                    contractRef,
                    {
                        status: "cancelled",
                        blockchainHash: receipt.hash,
                    },
                    { merge: true }
                );

                toast({
                    title: "Cancellation Requested",
                    description: "Cancellation request has been submitted. It will be processed by Chainlink Functions.",
                });

                // Refresh contract data
                const updatedContract = await getContractById(contractId);
                setContract(updatedContract);
            } else {
                throw new Error("Transaction failed on blockchain");
            }

        } catch (error: any) {
            console.error("Error cancelling contract:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to cancel contract",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const canApproveWork = contract?.status === "submitted" && contract?.aiApproved;
    const canReleasePayment = contract?.status === "submitted";
    const canCancelContract = ["pending", "active"].includes(contract?.status || "");

    if (loading) {
        return (
            <div>
                <DashboardHeader userType="client" userName="Client" />
                <div className="container mx-auto p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg">Loading contract details...</div>
                    </div>
                </div>
            </div>
        )
    }

    if (!contract) {
        return (
            <div>
                <DashboardHeader userType="client" userName="Client" />
                <div className="container mx-auto p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg">Contract not found</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <DashboardHeader userType="client" userName="Client" />
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Contracts
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{contract.title}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                {getStatusIcon(contract.status)}
                                <Badge className={getStatusBadge(contract.status)}>
                                    {contract.status}
                                </Badge>
                                {contract.status === "submitted" && (
                                    <Badge 
                                        className={contract.aiApproved 
                                            ? "bg-green-100 text-green-800" 
                                            : "bg-yellow-100 text-yellow-800"
                                        }
                                    >
                                        {contract.aiApproved ? "AI Approved" : "AI Pending"}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {canApproveWork && (
                                <Button 
                                    onClick={handleApproveWork}
                                    disabled={isProcessing}
                                    variant="outline"
                                >
                                    {isProcessing ? "Processing..." : "Approve Work"}
                                </Button>
                            )}
                            {canReleasePayment && (
                                <Button 
                                    onClick={handleReleasePayment}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "Processing..." : "Release Payment"}
                                </Button>
                            )}
                            {canCancelContract && (
                                <Button 
                                    onClick={handleCancelContract}
                                    disabled={isProcessing}
                                    variant="destructive"
                                >
                                    {isProcessing ? "Processing..." : "Cancel Contract"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Project Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{contract.description}</p>
                            </CardContent>
                        </Card>

                        {contract.status === "submitted" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                                        Work Submission
                                    </CardTitle>
                                    <CardDescription>
                                        Review the submitted work and take action
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">AI Approval Status:</span>
                                            <Badge 
                                                className={contract.aiApproved 
                                                    ? "bg-green-100 text-green-800" 
                                                    : "bg-yellow-100 text-yellow-800"
                                                }
                                            >
                                                {contract.aiApproved ? "Approved" : "Pending"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Submitted Date:</span>
                                            <span className="text-sm text-muted-foreground">
                                                {contract.submittedAt ? formatDate(contract.submittedAt) : "N/A"}
                                            </span>
                                        </div>
                                        {!contract.aiApproved && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <p className="text-sm text-yellow-800">
                                                    The work is currently being reviewed by AI. You can approve and release payment once AI approval is complete.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {canCancelContract && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        Cancellation Process
                                    </CardTitle>
                                    <CardDescription>
                                        Information about the cancellation process
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm text-blue-800">
                                                <strong>Note:</strong> Cancellation requests are processed through Chainlink Functions to validate time constraints. 
                                                The request will be automatically approved if the project has been active for at least 2 minutes.
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Current Status:</span>
                                            <Badge className={getStatusBadge(contract.status)}>
                                                {contract.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Created Date:</span>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(contract.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Freelancer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{contract.freelancerName}</h4>
                                        <p className="text-sm text-muted-foreground">{contract.freelancerEmail}</p>
                                    </div>
                                </div>
                                <Button className="w-full" variant="outline">
                                    Send Message
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Total Budget:</span>
                                        <span className="font-medium">{formatCurrency(contract.amountUsd)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>ETH Amount:</span>
                                        <span className="font-medium">{contract.amount} ETH</span>
                                    </div>
                                    {contract.blockchainHash && (
                                        <div className="flex justify-between">
                                            <span>Transaction Hash:</span>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {contract.blockchainHash.slice(0, 10)}...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Created</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(contract.createdAt)}</p>
                                        </div>
                                    </div>
                                    {contract.acceptedAt && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Accepted</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(contract.acceptedAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {contract.submittedAt && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Submitted</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(contract.submittedAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {contract.completedAt && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Completed</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(contract.completedAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Deadline</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(contract.deadline)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
} 