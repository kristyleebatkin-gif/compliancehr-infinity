import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal text-center leading-snug rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#A100FF] text-white shadow-sm hover:opacity-95",
        destructive:
          "bg-[#FF2E9A] text-white shadow-sm hover:bg-[#FF2E9A]/90",
        outline:
          "border border-[#C084FC]/60 bg-white text-[#0A2B6D] shadow-2xs hover:bg-[#F5F0FF] hover:text-[#5A00D6]",
        secondary:
          "bg-[#F5F0FF] text-[#0A2B6D] border border-[#C084FC]/50 shadow-2xs hover:bg-[#EDE9FE]",
        ghost: "text-[#0A2B6D] hover:bg-[#F5F0FF] hover:text-[#5A00D6]",
        link: "text-[#0072FF] underline-offset-4 hover:text-[#5A00D6] hover:underline",
      },
      size: {
        default: "min-h-9 h-auto px-4 py-2",
        sm: "min-h-8 h-auto rounded-md px-3 py-1.5 text-xs",
        lg: "min-h-10 h-auto rounded-md px-8 py-2",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }