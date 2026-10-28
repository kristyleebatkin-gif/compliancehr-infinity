import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileSpreadsheet, Landmark, PieChart, Sparkles } from 'lucide-react';

const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

export default function InvoiceNavigation({ onGenerate }) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-end">
        <Button
          onClick={onGenerate}
          size="sm"
          className="h-9 shrink-0 rounded-full border-2 border-[#0A2B6D] px-4 font-extrabold text-white shadow-sm"
          style={{ background: BADGE_GRADIENT }}
        >
          <Plus className="mr-1 h-3.5 w-3.5 text-white" />
          Generate invoice
        </Button>
      </div>
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
    </div>
  );
}