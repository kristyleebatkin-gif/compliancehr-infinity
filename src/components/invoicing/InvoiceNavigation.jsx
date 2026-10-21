import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

export default function InvoiceNavigation({ onGenerate }) {
  return <div className="finance-navigation flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
    <Button onClick={onGenerate} size="sm" className="h-8 shrink-0 border border-safe/30 bg-safe/15 text-foreground hover:bg-safe/25"><Plus className="h-3.5 w-3.5" />Generate invoice</Button>
    <TabsList data-dashboard-tabs={undefined} className="min-w-0 flex-1 flex-nowrap gap-1 bg-transparent p-0 shadow-none">
      <TabsTrigger data-dashboard-tab={undefined} value="invoices" className="finance-tone-primary min-h-8 flex-1 px-2 text-[11px]">Invoices</TabsTrigger>
      <TabsTrigger data-dashboard-tab={undefined} value="bank" className="finance-tone-evidence min-h-8 flex-1 px-2 text-[11px]">Bank Reconciliation</TabsTrigger>
      <TabsTrigger data-dashboard-tab={undefined} value="finance" className="finance-tone-safe min-h-8 flex-1 px-2 text-[11px]">Finance Summary</TabsTrigger>
    </TabsList>
  </div>;
}