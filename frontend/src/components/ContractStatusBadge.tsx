
import { Badge } from "@/components/ui/badge";
import { Contract } from "../../types/contracts";

type ContractStatusBadgeProps = {
  status: Contract["status"];
};

export function ContractStatusBadge({ status }: ContractStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending Acceptance",
      variant: "outline" as const,
    },
    active: {
      label: "In Progress",
      variant: "secondary" as const,
    },
    submitted: {
      label: "Submitted",
      variant: "default" as const,
    },
    completed: {
      label: "Completed",
      variant: "default" as const,
    },
    rejected: {
      label: "Rejected",
      variant: "destructive" as const,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className="ml-2">
      {config.label}
    </Badge>
  );
}
