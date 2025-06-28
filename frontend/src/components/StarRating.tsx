
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
};

export function StarRating({
  rating,
  onRatingChange,
  readOnly = false,
  size = 20,
}: StarRatingProps) {
  const maxRating = 5;
  
  const handleClick = (index: number) => {
    if (readOnly) return;
    onRatingChange?.(index);
  };
  
  return (
    <div className="flex">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= rating;
        
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              "transition-all cursor-pointer",
              isFilled 
                ? "fill-amber-400 text-amber-400"
                : "text-muted stroke-muted-foreground",
              readOnly && "cursor-default"
            )}
            onClick={() => handleClick(starIndex)}
          />
        );
      })}
    </div>
  );
}
