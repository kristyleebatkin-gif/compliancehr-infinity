import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[#0072FF]/25 bg-[#0072FF]/10 text-[#0A2B6D]",
        secondary: "border-slate-200 bg-slate-100 text-[#0A2B6D]",
        destructive: "border-rose-200 bg-rose-50 text-rose-700",
        outline: "border-slate-300 bg-white text-[#0A2B6D]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/** @param {React.HTMLAttributes<HTMLDivElement> & import('class-variance-authority').VariantProps<typeof badgeVariants>} props */
function Badge({
  className = undefined,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }