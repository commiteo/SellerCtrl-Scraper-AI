import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary-600 shadow-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-600 shadow-md",
        destructive:
          "border-transparent bg-error text-error-foreground hover:bg-error-600 shadow-md",
        outline: "text-foreground border-dropdown-border",
        success: "border-transparent bg-success text-success-foreground hover:bg-success-600 shadow-md",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning-600 shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
