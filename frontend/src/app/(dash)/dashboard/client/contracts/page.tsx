"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { FileCheck2, Clock, CheckCircle, XCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getContractsByClientId } from "@/lib/contracts"
import { auth } from "../../../../../../firebase/client"
import { onAuthStateChanged, User } from "firebase/auth"
import { Contract } from "../../../../../../types/contracts"

type SortField = 'title' | 'freelancerName' | 'amount' | 'deadline' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function ContractsPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string[]>(["active", "completed", "pending", "submitted"])
    const [sortField, setSortField] = useState<SortField>('createdAt')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [contracts, setContracts] = useState<Contract[]>([])
    const [loading, setLoading] = useState(true)
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

    // Fetch contracts once clientId is available
    useEffect(() => {
        if (!clientId) return

        async function fetchContracts() {
            setLoading(true)
            try {
                if (!clientId) throw new Error("Client ID is null")
                const fetched: Contract[] = await getContractsByClientId(clientId)
                setContracts(fetched)
            } catch (err) {
                console.error("Failed to fetch contracts:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchContracts()
    }, [clientId])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Clock className="w-4 h-4 text-blue-500" />
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case "pending":
                return <Clock className="w-4 h-4 text-yellow-500" />
            case "submitted":
                return <FileCheck2 className="w-4 h-4 text-purple-500" />
            default:
                return <XCircle className="w-4 h-4 text-red-500" />
        }
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            active: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            submitted: "bg-purple-100 text-purple-800",
            rejected: "bg-red-100 text-red-800"
        }
        return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4" />
        }
        return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
    }

    const handleStatusFilterChange = (status: string, checked: boolean) => {
        if (checked) {
            setStatusFilter(prev => [...prev, status])
        } else {
            setStatusFilter(prev => prev.filter(s => s !== status))
        }
    }

    const selectAllStatuses = () => {
        setStatusFilter(["active", "completed", "pending", "submitted", "rejected"])
    }

    const clearAllStatuses = () => {
        setStatusFilter([])
    }

    const formatDate = (date: Date | any) => {
        if (!date) return "N/A"
        const dateObj = date instanceof Date ? date : date.toDate()
        return dateObj.toLocaleDateString()
    }

    const formatAmount = (amount: number) => {
        return `${amount} ETH`
    }

    const filteredAndSortedContracts = useMemo(() => {
        let filtered = contracts.filter(contract => {
            const matchesSearch = searchTerm === "" || 
                contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.freelancerName.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesStatus = statusFilter.includes(contract.status)
            
            return matchesSearch && matchesStatus
        })

        filtered.sort((a, b) => {
            let aValue: any
            let bValue: any
            
            switch (sortField) {
                case 'title':
                    aValue = a.title
                    bValue = b.title
                    break
                case 'freelancerName':
                    aValue = a.freelancerName
                    bValue = b.freelancerName
                    break
                case 'amount':
                    aValue = a.amount
                    bValue = b.amount
                    break
                case 'deadline':
                    aValue = new Date(a.deadline)
                    bValue = new Date(b.deadline)
                    break
                case 'createdAt':
                    aValue = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate()
                    bValue = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate()
                    break
                default:
                    return 0
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [contracts, searchTerm, statusFilter, sortField, sortDirection])

    const handleViewDetails = (contractId: string) => {
        router.push(`/dashboard/client/contracts/${contractId}`)
    }

    const getFilterButtonText = () => {
        if (statusFilter.length === 0) return "No Status"
        if (statusFilter.length === 5) return "All Status"
        if (statusFilter.length === 1) return statusFilter[0]
        return `${statusFilter.length} Status`
    }

    // Calculate statistics
    const stats = useMemo(() => {
        const active = contracts.filter(c => c.status === "active").length
        const completed = contracts.filter(c => c.status === "completed").length
        const totalSpent = contracts
            .filter(c => c.status === "completed")
            .reduce((sum, c) => sum + c.amount, 0)
        
        return { active, completed, totalSpent }
    }, [contracts])

    if (loading) {
        return (
            <div>
                <DashboardHeader userType="client" userName={userName} />
                <div className="container mx-auto p-6">
                    <div className="flex items-center justify-center h-64">
                        <p>Loading contracts...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <DashboardHeader userType="client" userName={userName} />
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">My Contracts</h1>
                    <p className="text-muted-foreground">Manage your active and completed contracts</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">Currently in progress</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground">Successfully finished</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <span className="h-4 w-4 text-muted-foreground">Ξ</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSpent.toFixed(2)} ETH</div>
                            <p className="text-xs text-muted-foreground">Across all contracts</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Contract List</CardTitle>
                        <CardDescription>
                            Overview of all your contracts with freelancers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by project or freelancer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        {getFilterButtonText()}
                                        {statusFilter.length > 0 && statusFilter.length < 5 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {statusFilter.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={selectAllStatuses}>
                                        Select All
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={clearAllStatuses}>
                                        Clear All
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter.includes("pending")}
                                        onCheckedChange={(checked) => handleStatusFilterChange("pending", checked)}
                                    >
                                        Pending
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter.includes("active")}
                                        onCheckedChange={(checked) => handleStatusFilterChange("active", checked)}
                                    >
                                        Active
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter.includes("submitted")}
                                        onCheckedChange={(checked) => handleStatusFilterChange("submitted", checked)}
                                    >
                                        Submitted
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter.includes("completed")}
                                        onCheckedChange={(checked) => handleStatusFilterChange("completed", checked)}
                                    >
                                        Completed
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter.includes("rejected")}
                                        onCheckedChange={(checked) => handleStatusFilterChange("rejected", checked)}
                                    >
                                        Rejected
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {filteredAndSortedContracts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No contracts found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleSort('title')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Project {getSortIcon('title')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleSort('freelancerName')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Freelancer {getSortIcon('freelancerName')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleSort('amount')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Budget {getSortIcon('amount')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleSort('deadline')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Deadline {getSortIcon('deadline')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleSort('createdAt')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Created {getSortIcon('createdAt')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedContracts.map((contract) => (
                                        <TableRow key={contract.id}>
                                            <TableCell className="font-medium">{contract.title}</TableCell>
                                            <TableCell>{contract.freelancerName}</TableCell>
                                            <TableCell>{formatAmount(contract.amount)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(contract.status)}
                                                    <Badge className={getStatusBadge(contract.status)}>
                                                        {contract.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(new Date(contract.deadline))}</TableCell>
                                            <TableCell>{formatDate(contract.createdAt)}</TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleViewDetails(contract.id)}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 