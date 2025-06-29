
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
import { Textarea } from "@/components/ui/textarea";
import { Contract } from "../../types/contracts";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { format } from "date-fns";

type SubmitWorkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onWorkSubmitted?: () => void;
};

export function SubmitWorkDialog({
  open,
  onOpenChange,
  contract,
  onWorkSubmitted,
}: SubmitWorkDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");

  if (!contract) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!comment) {
      toast({
        title: "Comment required",
        description: "Please add a comment before submitting your work.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - would connect to Firebase in real implementation
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Work submitted",
        description: "Your submission has been sent to the client for review.",
      });

      onWorkSubmitted?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: `${error}`,
        description: "Failed to submit work. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !isSubmitting && onOpenChange(value)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Work</DialogTitle>
          <DialogDescription>
            Submit your completed work for client review
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex flex-col space-y-1.5">
            <h3 className="text-sm font-medium leading-none">
              {contract.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Client: {contract.clientName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(contract.amountUsd)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-muted-foreground">Deadline:</span>
              <span>{format(contract.deadline, "MMM dd, yyyy")}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Delivery Comments
            </label>
            <Textarea
              id="comment"
              placeholder="Describe what you're delivering and any notes for the client..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>

          <div className="border border-dashed rounded-lg p-6">
            <div className="flex flex-col items-center text-center gap-1">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Drag files or click to upload</p>
              <p className="text-xs text-muted-foreground">
                (This is a UI mockup - file upload would be implemented with Firebase Storage)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Work"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
