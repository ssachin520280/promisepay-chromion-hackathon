"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, DollarSign, User, FileText } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"

interface ContractDetails {
    id: string
    title: string
    description: string
    freelancer: {
        name: string
        email: string
        rating: number
    }
    budget: string
    status: string
    startDate: string
    endDate: string
    milestones: Array<{
        id: string
        title: string
        description: string
        amount: string
        status: 'pending' | 'in-progress' | 'completed'
        dueDate: string
    }>
    totalPaid: string
    remainingAmount: string
}

export default function ClientContractDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const contractId = params.id as string
    const [contract, setContract] = useState<ContractDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Mock data - replace with real API call
        const mockContract: ContractDetails = {
            id: contractId,
            title: "Website Redesign",
            description: "Complete redesign of the company website with modern UI/UX, responsive design, and improved user experience. The project includes homepage, about page, services page, contact page, and blog section.",
            freelancer: {
                name: "John Doe",
                email: "john.doe@example.com",
                rating: 4.8
            },
            budget: "2.5 ETH",
            status: "active",
            startDate: "2024-01-15",
            endDate: "2024-02-15",
            milestones: [
                {
                    id: "1",
                    title: "Design Mockups",
                    description: "Create wireframes and design mockups for all pages",
                    amount: "0.5 ETH",
                    status: "completed",
                    dueDate: "2024-01-20"
                },
                {
                    id: "2",
                    title: "Frontend Development",
                    description: "Implement the frontend using React and Next.js",
                    amount: "1.0 ETH",
                    status: "in-progress",
                    dueDate: "2024-02-05"
                },
                {
                    id: "3",
                    title: "Testing & Deployment",
                    description: "Final testing and deployment to production",
                    amount: "1.0 ETH",
                    status: "pending",
                    dueDate: "2024-02-15"
                }
            ],
            totalPaid: "0.5 ETH",
            remainingAmount: "2.0 ETH"
        }

        setTimeout(() => {
            setContract(mockContract)
            setLoading(false)
        }, 500)
    }, [contractId])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Clock className="w-4 h-4 text-blue-500" />
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case "pending":
                return <Clock className="w-4 h-4 text-yellow-500" />
            default:
                return <XCircle className="w-4 h-4 text-red-500" />
        }
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            active: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800"
        }
        return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    }

    const getMilestoneStatusBadge = (status: string) => {
        const variants = {
            'in-progress': "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800"
        }
        return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    }

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
                            </div>
                        </div>
                        <Button variant="outline">Contact Freelancer</Button>
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Milestones</CardTitle>
                                <CardDescription>Project milestones and payment schedule</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {contract.milestones.map((milestone) => (
                                        <div key={milestone.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold">{milestone.title}</h4>
                                                <Badge className={getMilestoneStatusBadge(milestone.status)}>
                                                    {milestone.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{milestone.amount}</span>
                                                <span className="text-muted-foreground">Due: {milestone.dueDate}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
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
                                        <h4 className="font-semibold">{contract.freelancer.name}</h4>
                                        <p className="text-sm text-muted-foreground">{contract.freelancer.email}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-sm">★</span>
                                            <span className="text-sm font-medium">{contract.freelancer.rating}</span>
                                        </div>
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
                                        <span className="font-medium">{contract.budget}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Paid:</span>
                                        <span className="font-medium text-green-600">{contract.totalPaid}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold">
                                        <span>Remaining:</span>
                                        <span>{contract.remainingAmount}</span>
                                    </div>
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
                                            <p className="text-sm font-medium">Start Date</p>
                                            <p className="text-sm text-muted-foreground">{contract.startDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">End Date</p>
                                            <p className="text-sm text-muted-foreground">{contract.endDate}</p>
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