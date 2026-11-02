import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-transparent px-2 py-0.5 text-[11px] leading-4 font-extrabold text-[#0A2B6D] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [background:linear-gradient(#ffffff,#ffffff)_padding-box,linear-gradient(120deg,#00C6FF_0%,#0072FF_28%,#5A00D6_62%,#FF2E9A_100%)_border-box]",
  {
    variants: {
      variant: {
        default: "text-[#0A2B6D] shadow-2xs",
        secondary: "text-[#0A2B6D] shadow-2xs",
        destructive: "text-[#0A2B6D] shadow-2xs",
        outline: "text-[#0A2B6D] shadow-2xs",
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