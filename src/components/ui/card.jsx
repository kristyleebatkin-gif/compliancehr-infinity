import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<'div'>} props */
({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border-2 border-[#0A2B6D] bg-white text-[#0A2B6D] shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<'div'>} props */
({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 rounded-t-2xl border-b-2 border-[#0A2B6D]/15 bg-white p-4 text-[#0A2B6D]",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<'div'>} props */
({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-editorial text-base font-extrabold leading-tight tracking-tight text-[#0A2B6D]", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<'div'>} props */
({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs font-extrabold text-[#5A00D6]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<'div'>} props */
({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-2 bg-white text-[#0A2B6D]", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<'div'>} props */
({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0 bg-white", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }