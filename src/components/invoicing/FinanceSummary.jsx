import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Wallet, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { statusTone } from '@/lib/statusStyles';

const money = (v) => `$${Number(v || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const money0 = (v) => `$${Number(v || 0).toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;

// Integrated finance summary: income vs expenses across invoices, finance records,
// receipts and purchase orders, with an expense-by-category breakdown.
export default function FinanceSummary() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [inv, fin, po] = await Promise.all([
          base44.entities.Invoice.aggregate({ groupBy: 'status', sum: ['amount'] }),
          base44.entities.FinanceRecord.aggregate({ groupBy: 'record_type', sum: ['amount'] }),
          base44.entities.PurchaseOrder.aggregate({ groupBy: 'status', sum: ['total'] }),
        ]);
        if (!live) return;
        const invRow = (s) => Number((inv.rows || []).find((r) => r.status === s)?.sum_amount || 0);
        const finSum = (t) => Number((fin.rows || []).find((r) => (r.record_type || '').startsWith(t))?.sum_amount || 0);
        setData({
          invoiced: Number((inv.rows || []).reduce((t, r) => t + Number(r.sum_amount || 0), 0)),
          paid: invRow('Paid'),
          outstanding: invRow('Sent') + invRow('Overdue'),
          overdue: invRow('Overdue'),
          income: finSum('Income') + finSum('Payment'),
          expenses: finSum('Expense') + finSum('Bill') + finSum('Regular Expense'),
          reimbursements: finSum('Reimbursement'),
          committedPos: Number((po.rows || []).filter((r) => ['Submitted', 'Approved'].includes(r.status)).reduce((t, r) => t + Number(r.sum_total || 0), 0)),
        });
      } catch {
        if (live) setData({});
      }
    })();
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!data) return;
    let live = true;
    base44.entities.FinanceRecord.filter({}, { sort: '-transaction_date', limit: 60 })
      .then((page) => { if (live) setData((d) => ({ ...d, recent: page.items || [] })); })
      .catch(() => { if (live) setData((d) => ({ ...d, recent: [] })); });
    return () => { live = false; };
  }, [data && data.recent === undefined]);

  if (!data || data.recent === undefined) {
    return (
      <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />Compiling the finance summary...
      </CardContent></Card>
    );
  }

  const expenseRows = [];
  data.recent.forEach((r) => {
    if (['Expense', 'Bill', 'Regular Expense'].includes(r.record_type)) {
      const row = expenseRows.find((e) => e.bucket === (r.category || 'Uncategorised'));
      if (row) row.value += Number(r.amount || 0);
      else expenseRows.push({ bucket: r.category || 'Uncategorised', value: Number(r.amount || 0) });
    }
  });
  const expenseChart = expenseRows.sort((a, b) => b.value - a.value).slice(0, 6);
  const net = data.paid + data.income - data.expenses - data.reimbursements;

  const cards = [
    { label: 'Collected revenue', value: money0(data.paid + data.income), sub: `${money0(data.outstanding)} outstanding incl. ${money0(data.overdue)} overdue`, Icon: TrendingUp, grad: 'from-emerald-500 via-teal-500 to-cyan-500' },
    { label: 'Expenses', value: money0(data.expenses), sub: `${money0(data.reimbursements)} reimbursements`, Icon: TrendingDown, grad: 'from-rose-500 via-red-500 to-orange-500' },
    { label: 'Committed POs', value: money0(data.committedPos), sub: 'submitted + approved orders', Icon: Wallet, grad: 'from-indigo-500 via-violet-500 to-purple-500' },
    { label: 'Net position', value: net >= 0 ? `+${money0(net)}` : `-${money0(Math.abs(net))}`, sub: 'collected revenue less expenses', Icon: Wallet, grad: net >= 0 ? 'from-teal-500 via-emerald-500 to-green-500' : 'from-amber-500 via-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl bg-gradient-to-br ${c.grad} p-4 text-white shadow-md`}>
            <div className="w-fit rounded-xl bg-white/20 p-2.5"><c.Icon className="h-5 w-5" /></div>
            <p className="mt-3 text-2xl font-bold tabular-nums">{c.value}</p>
            <p className="mt-0.5 text-xs font-medium text-white/85">{c.label}</p>
            <p className="mt-0.5 text-[11px] text-white/70">{c.sub}</p>
          </div>
        ))}
      </div>

      {expenseChart.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rose-500 to-orange-500" />Expenses by category</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={expenseChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bucket" fontSize={11} interval={0} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="value" name="Expenses" radius={[6, 6, 0, 0]}>
                  {expenseChart.map((_, i) => <Cell key={i} fill={['#f43f5e', '#f97316', '#eab308', '#8b5cf6', '#0ea5e9', '#10b981'][i % 6]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-bold"><span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />Recent finance records</p>
            <Link to="/receipts" className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">Receipt hub <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-3 space-y-2">
            {data.recent.map((r) => (
              <div key={r.id} className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug">{r.description}</p>
                  <p className="text-[11px] text-muted-foreground">{r.transaction_date} · {r.category || r.record_type} · {r.payee_payer || ''}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className={`text-sm font-semibold ${['Income', 'Payment'].includes(r.record_type) ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {['Income', 'Payment'].includes(r.record_type) ? '+' : '-'}{money(r.amount)}
                  </p>
                  <Badge variant="outline" className={`text-[10px] ${statusTone(r.status)}`}>{r.status}</Badge>
                </div>
              </div>
            ))}
            {data.recent.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No finance records yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}