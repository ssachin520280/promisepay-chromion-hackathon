
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Contract } from "../../types/contracts";
import { toast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

type ReleasePaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onPaymentReleased?: () => void;
};

export function ReleasePaymentDialog({
  open,
  onOpenChange,
  contract,
  onPaymentReleased,
}: ReleasePaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReleased, setIsReleased] = useState(false);

  if (!contract) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleReleasePayment = async () => {
    setIsSubmitting(true);

    try {
      // Mock API call - would connect to Firebase in real implementation
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsReleased(true);

      // Wait for animation to complete before showing success toast
      setTimeout(() => {
        toast({
          title: "Payment released",
          description: "Payment has been successfully processed.",
        });

        onPaymentReleased?.();

        // Close dialog after a delay to show success state
        setTimeout(() => {
          onOpenChange(false);
          setIsReleased(false);
        }, 1000);
      }, 1000);

    } catch (error) {
      toast({
        title: `${error}`,
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !isSubmitting && onOpenChange(value)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review & Release Payment</DialogTitle>
          <DialogDescription>
            Confirm that the work meets your requirements
          </DialogDescription>
        </DialogHeader>

        {isReleased ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium">Payment Released!</h3>
            <p className="text-sm text-muted-foreground text-center">
              The payment has been successfully processed and the freelancer has been notified.
            </p>
          </div>
        ) : (
          <>
            <div className="py-4 space-y-4">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-sm font-medium leading-none">
                  {contract.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {contract.description}
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger>View contract details</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Freelancer:</span>
                        <span>{contract.freelancerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(contract.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>
                          {contract.createdAt instanceof Date
                            ? contract.createdAt.toLocaleDateString()
                            : contract.createdAt.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted:</span>
                        <span>
                          {contract.submittedAt
                            ? contract.submittedAt instanceof Date
                              ? contract.submittedAt.toLocaleDateString()
                              : contract.submittedAt.toDate().toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="pt-2">
                <div className="rounded-lg border bg-muted/40 p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Payment Summary</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total amount:</span>
                      <span className="font-medium">
                        {formatCurrency(contract.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleReleasePayment} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Release Payment"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
