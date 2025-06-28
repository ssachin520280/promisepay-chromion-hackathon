import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Contract } from "../../types/contracts";
import { format, parseISO } from "date-fns"; // Changed to parseISO
import { ContractStatusBadge } from "./ContractStatusBadge";
import { useState } from "react";
import { RatingDialog } from "./RatingDialog";
import { Calendar, Clock, User } from "lucide-react";
import { Timestamp } from "firebase/firestore";

type ContractCardProps = {
  contract: Contract;
  userType: "client" | "freelancer";
  onAcceptContract?: (contractId: string) => void;
  onSubmitWork?: (contractId: string) => void;
  onReleasePayment?: (contractId: string) => void;
};

export function ContractCard({
  contract,
  userType,
  onAcceptContract,
  onSubmitWork,
  onReleasePayment,
}: ContractCardProps) {
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  // --- UTILS ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const safeFormatDate = (dateInput: string | Date | Timestamp | undefined) => {
    try {
      let date: Date;

      if (!dateInput) return "N/A";
      if (typeof dateInput === "string") date = parseISO(dateInput);
      else if (dateInput instanceof Timestamp) date = dateInput.toDate();
      else date = dateInput;

      return format(date, "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // --- DERIVED VALUES ---
  const isClient = userType === "client";
  const canRate = contract.status === "completed" && !contract.rating?.[isClient ? "clientToFreelancer" : "freelancerToClient"];
  const counterpartyName = isClient ? contract.freelancerName : contract.clientName;

  // --- ACTION BUTTONS ---
  const renderActionButton = () => {
    if (isClient && contract.status === "submitted") {
      return (
        <Button onClick={() => onReleasePayment?.(contract.id)}>
          Review & Release Payment
        </Button>
      );
    } else if (!isClient) {
      if (contract.status === "pending") {
        return (
          <Button onClick={() => onAcceptContract?.(contract.id)}>
            Accept Contract
          </Button>
        );
      } else if (contract.status === "active") {
        return (
          <Button onClick={() => onSubmitWork?.(contract.id)}>
            Submit Work
          </Button>
        );
      }
    }
    return null;
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{contract.title}</CardTitle>
            <ContractStatusBadge status={contract.status} />
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {contract.description}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Freelancer/Client Info */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 opacity-70" />
              <span className="text-muted-foreground">
                {isClient ? "Freelancer:" : "Client:"}
              </span>
              <span className="font-medium">{counterpartyName}</span>
            </div>

            {/* Deadline (now handles string) */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 opacity-70" />
              <span className="text-muted-foreground">Due:</span>
              <span className="font-medium">
                {safeFormatDate(contract.deadline)}
              </span>
            </div>

            {/* Payment Amount */}
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <span className="font-semibold">{formatCurrency(contract.amount)}</span>
            </div>

            {/* Created At */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 opacity-70" />
              <span className="text-muted-foreground">Created:</span>
              <span>{safeFormatDate(contract.createdAt)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          {canRate && (
            <Button
              variant="outline"
              onClick={() => setIsRatingDialogOpen(true)}
              className="text-sm"
            >
              Leave Feedback
            </Button>
          )}
          {renderActionButton()}
        </CardFooter>
      </Card>

      <RatingDialog
        open={isRatingDialogOpen}
        onOpenChange={setIsRatingDialogOpen}
        contractId={contract.id}
        contractTitle={contract.title}
        raterType={userType}
        recipientName={counterpartyName}
      />
    </>
  );
}