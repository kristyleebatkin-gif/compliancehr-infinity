import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

export default function InvoiceNavigation({ onGenerate }) {
  return (
    <div className="rounded-3xl p-[10px] shadow-md" style={{ background: TOP_BORDER_GRADIENT }}>
      <div className="finance-navigation flex flex-wrap items-center gap-2.5 rounded-[14px] bg-white p-2.5">
        <Button
          onClick={onGenerate}
          size="sm"
          className="h-9 shrink-0 rounded-full border-2 border-[#0A2B6D] px-4 font-extrabold text-white shadow-sm"
          style={{ background: BADGE_GRADIENT }}
        >
          <Plus className="mr-1 h-3.5 w-3.5 text-white" />
          Generate invoice
        </Button>
        <TabsList
          data-dashboard-tabs={undefined}
          className="min-w-0 flex-1 flex-wrap gap-2 border-0 bg-transparent p-0 shadow-none"
        >
          <TabsTrigger value="invoices" className="min-h-9 flex-1 px-3 text-xs font-extrabold">
            Invoices
          </TabsTrigger>
          <TabsTrigger value="bank" className="min-h-9 flex-1 px-3 text-xs font-extrabold">
            Bank Reconciliation
          </TabsTrigger>
          <TabsTrigger value="finance" className="min-h-9 flex-1 px-3 text-xs font-extrabold">
            Finance Summary
          </TabsTrigger>
          <TabsTrigger value="proda-xero" className="min-h-9 flex-1 px-3 text-xs font-extrabold">
            PRODA, Xero &amp; SCHADS Suite
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}