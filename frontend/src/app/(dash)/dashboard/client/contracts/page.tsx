"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { FileCheck2, Clock, CheckCircle, XCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react"
import { DashboardHeader } from "@/components/DashboardHeader"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"

type SortField = 'title' | 'freelancer' | 'budget' | 'startDate' | 'endDate'
type SortDirection = 'asc' | 'desc'

interface Contract {
    id: string
    title: string
    freelancer: string
    budget: string
    status: string
    startDate: string
    endDate: string
}

export default function ContractsPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string[]>(["active", "completed", "pending"])
    const [sortField, setSortField] = useState<SortField>('startDate')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    // Mock data - replace with real data from your backend
    const contracts: Contract[] = [
        {
            id: "1",
            title: "Website Redesign",
            freelancer: "John Doe",
            budget: "2.5 ETH",
            status: "active",
            startDate: "2024-01-15",
            endDate: "2024-02-15"
        },
        {
            id: "2",
            title: "Mobile App Development",
            freelancer: "Jane Smith",
            budget: "5.0 ETH",
            status: "completed",
            startDate: "2024-01-01",
            endDate: "2024-01-30"
        },
        {
            id: "3",
            title: "Logo Design",
            freelancer: "Mike Johnson",
            budget: "1.0 ETH",
            status: "pending",
            startDate: "2024-02-01",
            endDate: "2024-02-10"
        }
    ]

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
        setStatusFilter(["active", "completed", "pending"])
    }

    const clearAllStatuses = () => {
        setStatusFilter([])
    }

    const filteredAndSortedContracts = useMemo(() => {
        let filtered = contracts.filter(contract => {
            const matchesSearch = searchTerm === "" || 
                contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.freelancer.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesStatus = statusFilter.includes(contract.status)
            
            return matchesSearch && matchesStatus
        })

        filtered.sort((a, b) => {
            let aValue = a[sortField]
            let bValue = b[sortField]
            
            if (sortField === 'budget') {
                const aNum = parseFloat((aValue as string).replace(' ETH', ''));
                const bNum = parseFloat((bValue as string).replace(' ETH', ''));
                if (aNum < bNum) return sortDirection === 'asc' ? -1 : 1;
                if (aNum > bNum) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
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
        if (statusFilter.length === 3) return "All Status"
        if (statusFilter.length === 1) return statusFilter[0]
        return `${statusFilter.length} Status`
    }

    return (
        <div>
            <DashboardHeader userType="client" userName="Client" />
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
                            <div className="text-2xl font-bold">2</div>
                            <p className="text-xs text-muted-foreground">Currently in progress</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Successfully finished</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <span className="h-4 w-4 text-muted-foreground">Ξ</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8.5 ETH</div>
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
                                        {statusFilter.length > 0 && statusFilter.length < 3 && (
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
                                        checked={statusFilter.includes("active")}
                                        onCheckedChange={(checked) => handleStatusFilterChange("active", checked)}
                                    >
                                        Active
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter.includes("completed")}
                                        onCheckedChange={(checked) => handleStatusFilterChange("completed", checked)}
                                    >
                                        Completed
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                        checked={statusFilter.includes("pending")}
                                        onCheckedChange={(checked) => handleStatusFilterChange("pending", checked)}
                                    >
                                        Pending
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

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
                                            onClick={() => handleSort('freelancer')}
                                            className="h-auto p-0 font-semibold"
                                        >
                                            Freelancer {getSortIcon('freelancer')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => handleSort('budget')}
                                            className="h-auto p-0 font-semibold"
                                        >
                                            Budget {getSortIcon('budget')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => handleSort('startDate')}
                                            className="h-auto p-0 font-semibold"
                                        >
                                            Start Date {getSortIcon('startDate')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => handleSort('endDate')}
                                            className="h-auto p-0 font-semibold"
                                        >
                                            End Date {getSortIcon('endDate')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedContracts.map((contract) => (
                                    <TableRow key={contract.id}>
                                        <TableCell className="font-medium">{contract.title}</TableCell>
                                        <TableCell>{contract.freelancer}</TableCell>
                                        <TableCell>{contract.budget}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(contract.status)}
                                                <Badge className={getStatusBadge(contract.status)}>
                                                    {contract.status}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>{contract.startDate}</TableCell>
                                        <TableCell>{contract.endDate}</TableCell>
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 