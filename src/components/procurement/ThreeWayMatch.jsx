import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, GitCompareArrows, CircleCheck, CircleAlert, CircleX } from 'lucide-react';

const norm = (s) => String(s || '').trim().toLowerCase();

// Three-way supplier invoice matching (Xero benchmark): purchase order + supplier invoice/receipt + supplier record.
export default function ThreeWayMatch() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let live = true;
    Promise.all([
      base44.entities.PurchaseOrder.filter({}, { sort: '-created_date', limit: 200 }),
      base44.entities.Supplier.filter({}, { limit: 200 }),
      base44.entities.Receipt.filter({}, { sort: '-date', limit: 200, fields: ['merchant', 'amount', 'date', 'status'] }),
    ])
      .then(([orders, suppliers, receipts]) => {
        if (!live) return;
        const supplierNames = new Set((suppliers.items || []).map((s) => norm(s.name)));
        const rows = (orders.items || []).map((po) => {
          const inSuppliers = supplierNames.has(norm(po.supplier_name));
          const matchedReceipts = (receipts.items || []).filter((r) => norm(r.merchant) === norm(po.supplier_name));
          const signals = [Boolean(po.po_number), inSuppliers, matchedReceipts.length > 0].filter(Boolean).length;
          const status = signals === 3 ? 'Full match' : signals === 2 ? 'Partial match' : 'Unmatched';
          return {
            id: po.id,
            po_number: po.po_number || '(no number)',
            supplier: po.supplier_name || '-',
            total: po.total,
            receipts: matchedReceipts.length,
            status,
          };
        });
        setData(rows);
      })
      .catch(() => live && setData([]));
    return () => { live = false; };
  }, []);

  const TONE = {
    'Full match': 'text-emerald-600 bg-emerald-500/10 border-emerald-200',
    'Partial match': 'text-amber-600 bg-amber-500/10 border-amber-200',
    'Unmatched': 'text-red-600 bg-red-500/10 border-red-200',
  };
  const ICON = { 'Full match': CircleCheck, 'Partial match': CircleAlert, 'Unmatched': CircleX };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2"><GitCompareArrows className="h-4 w-4 text-emerald-600" /></div>
          <div>
            <p className="text-sm font-bold">Three-way matching</p>
            <p className="text-xs text-muted-foreground">Purchase order + supplier receipt + supplier record, matched by supplier name</p>
          </div>
        </div>

        {data === null ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />Matching records...
          </div>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No purchase orders to match yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {data.map((r) => {
              const Icon = ICON[r.status];
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{r.po_number}</p>
                    <p className="text-xs text-muted-foreground">{r.supplier} · {r.receipts} receipt{r.receipts === 1 ? '' : 's'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold tabular-nums">${Number(r.total || 0).toLocaleString('en-AU', { maximumFractionDigits: 2 })}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TONE[r.status]}`}>
                      <Icon className="h-3 w-3" />{r.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}