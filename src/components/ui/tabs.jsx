import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>} props */
  ({ className = undefined, children, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex min-h-10 w-full flex-wrap items-center justify-start gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 text-[#0A2B6D] shadow-2xs",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  )
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>} props */
  ({ className = undefined, children, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex min-h-[34px] items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold text-[#0A2B6D]/80 ring-offset-background transition-all hover:bg-slate-100 hover:text-[#0A2B6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#0A2B6D] data-[state=active]:text-white data-[state=active]:shadow-2xs [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>} props */
  ({ className = undefined, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
)
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }