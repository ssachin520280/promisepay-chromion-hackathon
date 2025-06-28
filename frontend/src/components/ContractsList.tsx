
import { useState } from "react";
import { Contract, FilterStatus } from "../../types/contracts";
import { ContractCard } from "./ContractCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

type ContractsListProps = {
  contracts: Contract[];
  userType: "client" | "freelancer";
  onAcceptContract?: (contractId: string) => void;
  onSubmitWork?: (contractId: string) => void;
  onReleasePayment?: (contractId: string) => void;
};

export function ContractsList({
  contracts,
  userType,
  onAcceptContract,
  onSubmitWork,
  onReleasePayment,
}: ContractsListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContracts = contracts.filter((contract) => {
    // Filter by status
    if (filterStatus !== "all" && contract.status !== filterStatus) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = contract.title.toLowerCase().includes(query);
      const matchDescription = contract.description.toLowerCase().includes(query);
      const matchClient = contract.clientName.toLowerCase().includes(query);
      const matchFreelancer = contract.freelancerName.toLowerCase().includes(query);

      if (!(matchTitle || matchDescription || matchClient || matchFreelancer)) {
        return false;
      }
    }

    return true;
  });

  const contractCountByStatus = (status: FilterStatus) => {
    if (status === "all") return contracts.length;
    return contracts.filter(c => c.status === status).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={(value: unknown) => setFilterStatus(value as FilterStatus)}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">
            All ({contractCountByStatus("all")})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({contractCountByStatus("pending")})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({contractCountByStatus("active")})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({contractCountByStatus("submitted")})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({contractCountByStatus("completed")})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0">
          <ContractsGrid
            contracts={filteredContracts}
            userType={userType}
            onAcceptContract={onAcceptContract}
            onSubmitWork={onSubmitWork}
            onReleasePayment={onReleasePayment}
          />
        </TabsContent>

        {["pending", "active", "submitted", "completed"].map((status) => (
          <TabsContent key={status} value={status} className="m-0">
            <ContractsGrid
              contracts={filteredContracts}
              userType={userType}
              onAcceptContract={onAcceptContract}
              onSubmitWork={onSubmitWork}
              onReleasePayment={onReleasePayment}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ContractsGrid({
  contracts,
  userType,
  onAcceptContract,
  onSubmitWork,
  onReleasePayment,
}: ContractsListProps) {
  if (contracts.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No contracts found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          userType={userType}
          onAcceptContract={onAcceptContract}
          onSubmitWork={onSubmitWork}
          onReleasePayment={onReleasePayment}
        />
      ))}
    </div>
  );
}
