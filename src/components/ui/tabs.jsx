import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import dashboardTabTone from '@/lib/dashboardTabTone';
import '@/components/dashboard/dashboardNavigation.css';

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    data-dashboard-tabs=""
    ref={ref}
    className={cn(
      "flex w-full flex-wrap items-center gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-2 text-[#0A2B6D] shadow-sm",
      className
    )}
    {...props} />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    data-dashboard-tab=""
    data-dashboard-tone={dashboardTabTone(props.value)}
    ref={ref}
    className={cn(
      "inline-flex min-h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#0A2B6D] [&_svg]:mr-0 [&_svg]:size-3.5 [&_svg]:shrink-0 ring-offset-background transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white data-[state=active]:shadow-sm",
      className
    )}
    {...props} />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }