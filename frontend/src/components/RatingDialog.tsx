"use client";
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
import { StarRating } from "./StarRating";
import { toast } from "@/hooks/use-toast";

type RatingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  contractTitle: string;
  raterType: "client" | "freelancer";
  recipientName: string;
};

export function RatingDialog({
  open,
  onOpenChange,
  contractTitle,
  recipientName,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - would connect to Firebase in real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: `${error}`,
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {recipientName}</DialogTitle>
          <DialogDescription>
            For contract: {contractTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={32}
            />
            <span className="text-sm text-muted-foreground">
              {rating === 0
                ? "Select a rating"
                : `${rating} star${rating !== 1 ? "s" : ""}`}
            </span>
          </div>

          <Textarea
            placeholder="Share your experience working with this person..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
