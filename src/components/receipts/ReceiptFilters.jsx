import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

// Multi-field receipt search & filters: free text (matches any field, tolerant of
// punctuation/typo-ish tokens), status, amount range and date range — all combined.
export const normalise = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

export function filterReceipts(receipts, { q, status, minAmount, maxAmount, dateFrom, dateTo }) {
  const tokens = normalise(q).split(' ').filter(Boolean);
  return receipts.filter((r) => {
    if (status !== 'All' && (r.status || 'Unreconciled') !== status) return false;
    const amount = Number(r.amount || 0);
    if (minAmount !== '' && amount < Number(minAmount)) return false;
    if (maxAmount !== '' && amount > Number(maxAmount)) return false;
    if (dateFrom && (r.date || '') < dateFrom) return false;
    if (dateTo && (r.date || '') > dateTo) return false;
    if (tokens.length) {
      const haystack = normalise([r.description, r.merchant, r.receipt_number, r.paid_by, r.reimburse_to, r.category, r.payment_method, r.notes].join(' '));
      // Each token must appear — but also matches a prefix of a longer word (e.g. "woolies" → "woolworths" falls back to common prefix "wool").
      const words = haystack.split(' ');
      const tokenHits = (t) => words.some((w) => w.includes(t) || (t.length >= 4 && w.startsWith(t.slice(0, Math.max(3, Math.floor(t.length * 0.6))))));
      if (!tokens.every(tokenHits)) return false;
    }
    return true;
  });
}

export default function ReceiptFilters({ filters, setFilters, count, total }) {
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  return (
    <div className="module-filter-bar rounded-xl border border-border/60 bg-card p-2">
      <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search merchant, description, number, paid by…" value={filters.q} onChange={(e) => set('q', e.target.value)} />
        </div>
        <Select value={filters.status} onValueChange={(v) => set('status', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            <SelectItem value="Unreconciled">Unreconciled</SelectItem>
            <SelectItem value="Reconciled">Reconciled</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Input type="number" step="0.01" placeholder="Min $" value={filters.minAmount} onChange={(e) => set('minAmount', e.target.value)} />
          <span className="text-xs text-muted-foreground">–</span>
          <Input type="number" step="0.01" placeholder="Max $" value={filters.maxAmount} onChange={(e) => set('maxAmount', e.target.value)} />
        </div>
        <div className="flex items-center gap-1">
          <Input type="date" value={filters.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} aria-label="From date" />
          <span className="text-xs text-muted-foreground">–</span>
          <Input type="date" value={filters.dateTo} onChange={(e) => set('dateTo', e.target.value)} aria-label="To date" />
        </div>
      </div>
      {(filters.q || filters.status !== 'All' || filters.minAmount || filters.maxAmount || filters.dateFrom || filters.dateTo) && (
        <p className="mt-2 text-xs font-medium text-muted-foreground">Showing {count} of {total} receipts. <button className="underline hover:text-foreground" onClick={() => setFilters({ q: '', status: 'All', minAmount: '', maxAmount: '', dateFrom: '', dateTo: '' })}>Clear filters</button></p>
      )}
      <Label className="sr-only">Receipt filters</Label>
    </div>
  );
}