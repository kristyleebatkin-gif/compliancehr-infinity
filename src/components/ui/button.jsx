import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal text-center leading-snug rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700",
        destructive:
          "bg-rose-600 text-white shadow-xs hover:bg-rose-700",
        outline:
          "border border-slate-300 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300",
        secondary:
          "bg-slate-100 text-slate-900 border border-slate-200 shadow-2xs hover:bg-slate-200/80",
        ghost: "text-slate-700 hover:bg-slate-100 hover:text-indigo-600",
        link: "text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline",
      },
      size: {
        default: "min-h-9 h-auto px-4 py-2",
        sm: "min-h-8 h-auto rounded-lg px-3 py-1.5 text-xs",
        lg: "min-h-10 h-auto rounded-lg px-8 py-2",
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