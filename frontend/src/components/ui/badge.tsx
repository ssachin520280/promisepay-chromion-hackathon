import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline:
          "text-foreground",
        status: 
          "border-transparent",
        client:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        freelancer:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      },
      status: {
        pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        active: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        submitted: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: "pending" | "active" | "submitted" | "completed";
}

function Badge({ className, variant, status, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, status }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
