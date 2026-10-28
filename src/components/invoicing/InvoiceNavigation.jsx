import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, Landmark, PieChart, Sparkles } from 'lucide-react';

export default function InvoiceNavigation() {
  return (
    <TabsList aria-label="Invoicing & Finance Navigation">
      <TabsTrigger value="invoices" data-hint="NDIS claims, quotes & billing">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Invoices
      </TabsTrigger>
      <TabsTrigger value="bank" data-hint="Match statements & rules">
        <Landmark className="h-3.5 w-3.5" />
        Bank Reconciliation
      </TabsTrigger>
      <TabsTrigger value="finance" data-hint="Revenue, receivables & GST">
        <PieChart className="h-3.5 w-3.5" />
        Finance Summary
      </TabsTrigger>
      <TabsTrigger value="proda-xero" data-hint="Bulk PRODA CSV & Xero sync">
        <Sparkles className="h-3.5 w-3.5" />
        PRODA, Xero &amp; SCHADS Suite
      </TabsTrigger>
    </TabsList>
  );
}