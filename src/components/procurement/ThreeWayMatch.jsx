import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, GitCompareArrows, CircleCheck, CircleAlert, CircleX, Link2Off, Download } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';

const norm = (s) => String(s || '').trim().toLowerCase();
const money = (v) => `$${Number(v || 0).toLocaleString('en-AU', { maximumFractionDigits: 2 })}`;

// Three-way supplier matching (Xero benchmark): purchase order + supplier receipt + supplier record.
// Managers match each PO with a supplier receipt before it can be approved; every match is stamped
// with the receipt id, matching time and matching user.
export default function ThreeWayMatch() {
  const [data, setData] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [saving, setSaving] = useState(null);

  const load = () => {
    setData(null);
    Promise.all([
      base44.entities.PurchaseOrder.filter({}, { sort: '-created_date', limit: 200 }),
      base44.entities.Supplier.filter({}, { limit: 200 }),
      base44.entities.Receipt.filter({}, { sort: '-date', limit: 200, fields: ['id', 'merchant', 'amount', 'date', 'status', 'receipt_number', 'description'] }),
    ])
      .then(([orders, suppliers, rcpts]) => {
        const supplierNames = new Set((suppliers.items || []).map((s) => norm(s.name)));
        const receiptList = rcpts.items || [];
        setReceipts(receiptList);
        const rows = (orders.items || []).map((po) => {
          const linked = po.receipt_id ? receiptList.find((r) => r.id === po.receipt_id) : null;
          const inSuppliers = supplierNames.has(norm(po.supplier_name));
          const nameMatches = receiptList.filter((r) => norm(r.merchant) === norm(po.supplier_name));
          const signals = [Boolean(po.po_number), inSuppliers, nameMatches.length > 0 || Boolean(linked)].filter(Boolean).length;
          const status = linked ? 'Receipt matched' : signals === 3 ? 'Full match' : signals === 2 ? 'Partial match' : 'Unmatched';
          return {
            id: po.id,
            po_number: po.po_number || '(no number)',
            supplier: po.supplier_name || '-',
            total: po.total,
            receipt: linked,
            receiptCount: nameMatches.length,
            status,
          };
        });
        setData(rows);
      })
      .catch(() => setData([]));
  };

  useEffect(() => { load(); }, []);

  const matchReceipt = async (poId, receiptId) => {
    if (!receiptId) return;
    setSaving(poId);
    const me = await base44.auth.me().catch(() => null);
    await base44.entities.PurchaseOrder.update(poId, {
      receipt_id: receiptId,
      matched_at: new Date().toISOString(),
      matched_by: me?.full_name || me?.email || 'Unknown user',
    });
    setSaving(null);
    load();
  };

  const unmatch = async (poId) => {
    setSaving(poId);
    await base44.entities.PurchaseOrder.update(poId, { receipt_id: '', matched_at: '', matched_by: '' });
    setSaving(null);
    load();
  };

  const TONE = {
    'Receipt matched': 'text-emerald-600 bg-emerald-500/10 border-emerald-200',
    'Full match': 'text-emerald-600 bg-emerald-500/10 border-emerald-200',
    'Partial match': 'text-amber-600 bg-amber-500/10 border-amber-200',
    'Unmatched': 'text-red-600 bg-red-500/10 border-red-200',
  };
  const ICON = { 'Receipt matched': CircleCheck, 'Full match': CircleCheck, 'Partial match': CircleAlert, 'Unmatched': CircleX };

  const unmatchedReceipts = (receipts || []).filter((r) => !(data || []).some((d) => d.receipt && d.receipt.id === r.id));

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm"><GitCompareArrows className="h-4 w-4" /></div>
          <div>
            <p className="text-sm font-bold">Three-way matching</p>
            <p className="text-xs text-muted-foreground">Purchase order + supplier receipt + supplier record. A PO cannot be approved until its receipt is matched here.</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => downloadCsv('three-way-match.csv', [
            { label: 'PO number', key: 'po_number' }, { label: 'Supplier', key: 'supplier' }, { label: 'Total', key: 'total' },
            { label: 'Status', key: 'status' }, { label: 'Receipt merchant', key: 'receipt_merchant' }, { label: 'Receipt amount', key: 'receipt_amount' },
            { label: 'Name-matched receipts', key: 'receiptCount' },
          ], (data || []).map((r) => ({ ...r, receipt_merchant: r.receipt?.merchant || '', receipt_amount: r.receipt?.amount ?? '' })))}>
            <Download className="mr-2 h-4 w-4" />Export matching
          </Button>
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
                <div key={r.id} className={`rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 ${r.status === 'Unmatched' ? 'border-l-4 border-l-rose-400' : r.status === 'Partial match' ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-emerald-500'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{r.po_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.supplier} · {r.receipt ? `receipt: ${r.receipt.merchant || r.receipt.receipt_number || 'matched'} ${money(r.receipt.amount)}` : `${r.receiptCount} name-matched receipt${r.receiptCount === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold tabular-nums">{money(r.total)}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TONE[r.status]}`}>
                        <Icon className="h-3 w-3" />{r.status}
                      </span>
                    </div>
                  </div>
                  {!r.receipt && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        className="h-8 max-w-xs rounded-md border border-input bg-background px-2 text-xs"
                        defaultValue=""
                        onChange={(e) => matchReceipt(r.id, e.target.value)}
                        disabled={saving === r.id}
                      >
                        <option value="">Match a receipt to this order...</option>
                        {unmatchedReceipts.map((rc) => (
                          <option key={rc.id} value={rc.id}>
                            {(rc.merchant || 'Unknown supplier')} - {money(rc.amount)} - {rc.date ? String(rc.date).slice(0, 10) : 'no date'}
                          </option>
                        ))}
                      </select>
                      {saving === r.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                    </div>
                  )}
                  {r.receipt && (
                    <div className="mt-2">
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => unmatch(r.id)} disabled={saving === r.id}>
                        <Link2Off className="mr-1 h-3 w-3" />Unmatch receipt
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}