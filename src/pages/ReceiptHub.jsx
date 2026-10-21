import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import RegisterInsights from '@/components/RegisterInsights';
import FinanceMetricCards from '@/components/finance/FinanceMetricCards';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Download, History, Plus, Receipt as ReceiptIcon, ScanLine, Trash2, CheckCircle2, FileText } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import ModuleShell from '@/components/module/ModuleShell';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import { exportModuleAccessLog } from '@/lib/accessLogExport';
import ReceiptScanner from '@/components/receipts/ReceiptScanner';
import ScanToPdf from '@/components/receipts/ScanToPdf';
import { fileReceiptToAssetRegister } from '@/lib/assetRegister';
import ReceiptFilters, { filterReceipts } from '@/components/receipts/ReceiptFilters';

const money = (v) => (v == null ? '-' : `$${Number(v).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

const NDIS_CATEGORIES = ['Assistance with Daily Life (Core)', 'Assistance with Social & Community Participation (Core)', 'Consumables (Core)', 'Transport (Core)', 'Capacity Building - Improved Daily Living', 'Capacity Building - Improved Health & Wellbeing', 'Capacity Building - Finding & Keeping a Job', 'Capacity Building - Improved Learning', 'Capacity Building - Improved Relationships', 'Capacity Building - Increased Social & Community Participation', 'Capacity Building - Improved Living Arrangements', 'Capital - Assistive Technology', 'Capital - Home Modifications', 'Other'];

export default function ReceiptHub({ profile } = {}) {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({ description: '', merchant: '', receipt_number: '', amount: '', gst_amount: '', date: '', paid_by: '', reimburse_to: '', category: '', payment_method: '', ndis_category: '', ndis_support_item_number: '', status: 'Unreconciled', receipt_url: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Receipt.filter(profile ? { $or: [{ paid_by: profile.full_name }, { reimburse_to: profile.full_name }] } : {}, { sort: '-date', limit: 200 });
      setReceipts(page.items);
    } finally {
      setLoading(false);
    }
  }, [profile?.full_name]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (profile) setForm((current) => ({ ...current, paid_by: profile.full_name })); }, [profile?.full_name]);

  const save = async () => {
    if (!form.description.trim()) return;
    setSaving(true);
    try {
      const record = await base44.entities.Receipt.create({
        ...form,
        ...(profile ? { paid_by: profile.full_name } : {}),
        amount: form.amount === '' ? undefined : Number(form.amount),
        gst_amount: form.gst_amount === '' ? undefined : Number(form.gst_amount),
      });
      await fileReceiptToAssetRegister(record, record.paid_by);
      setForm({ description: '', merchant: '', receipt_number: '', amount: '', gst_amount: '', date: '', paid_by: '', reimburse_to: '', category: '', payment_method: '', ndis_category: '', ndis_support_item_number: '', status: 'Unreconciled', receipt_url: '', notes: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleReconcile = async (r) => {
    await base44.entities.Receipt.update(r.id, { status: r.status === 'Unreconciled' ? 'Reconciled' : 'Unreconciled' });
    await load();
  };

  const toggleReimbursed = async (r) => {
    await base44.entities.Receipt.update(r.id, r.reimbursed ? { reimbursed: false, reimbursed_date: null } : { reimbursed: true, reimbursed_date: new Date().toISOString().slice(0, 10) });
    await load();
  };

  const openReceiptFile = async (r) => {
    const storedUrl = safeUrl(r.receipt_url);
    if (storedUrl) { window.open(storedUrl, '_blank'); return; }
    if (!r.file_uri) return;
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: r.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Unable to open receipt', description: error.message, variant: 'destructive' });
    }
  };

  const exportCsv = () => {
    downloadCsv('Receipt-Register.csv', [
      { key: 'description', label: 'Description' }, { key: 'merchant', label: 'Merchant' },
      { key: 'receipt_number', label: 'Receipt Number' }, { key: 'date', label: 'Date' },
      { key: 'amount', label: 'Amount' }, { key: 'gst_amount', label: 'GST' },
      { key: 'paid_by', label: 'Paid By' }, { key: 'reimburse_to', label: 'Reimburse To' },
      { key: 'reimbursed', label: 'Reimbursed' }, { key: 'reimbursed_date', label: 'Reimbursed Date' },
      { key: 'category', label: 'Category' }, { key: 'payment_method', label: 'Payment Method' },
      { key: 'ndis_category', label: 'NDIS Support Category' }, { key: 'ndis_support_item_number', label: 'NDIS Item Number' },
      { key: 'status', label: 'Status' }, { key: 'file_name', label: 'Stored Receipt' },
      { key: 'receipt_url', label: 'Receipt Link' }, { key: 'notes', label: 'Notes' },
    ], receipts);
    toast({ title: 'Receipt register exported' });
  };

  const exportAccess = async () => {
    try {
      const count = await exportModuleAccessLog('/receipts', 'Receipt-Hub-Access-Log.csv');
      toast({ title: 'Access log exported', description: `${count} access records for the Receipt Hub.` });
    } catch (error) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    }
  };

  const unrecTotal = receipts.filter((r) => r.status === 'Unreconciled').reduce((s, r) => s + (r.amount || 0), 0);
  const reimburseTotal = receipts.filter((r) => !r.reimbursed && r.reimburse_to).reduce((s, r) => s + (r.amount || 0), 0);
  const [filters, setFilters] = useState({ q: '', status: 'All', minAmount: '', maxAmount: '', dateFrom: '', dateTo: '' });
  const shownReceipts = filterReceipts(receipts, filters);

  return (
    <div className="finance-workspace space-y-4">
      <ModuleShell
        icon={ReceiptIcon}
        title="Receipt Hub"
        subtitle="Scan, store, reconcile and reimburse receipts with full records."
        moduleKey="receipts"
        insightModule="receipts"
        actions={<>
          <Button variant="outline" className="border-border bg-white text-black" onClick={exportCsv} disabled={loading || receipts.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>
          <Button variant="outline" className="border-border bg-white text-black" onClick={exportAccess}><History className="mr-2 h-4 w-4" />Access log</Button>
        </>}
        search={<ReceiptFilters filters={filters} setFilters={setFilters} count={shownReceipts.length} total={receipts.length} />}
        small={[
          ['Receipts', String(receipts.length)],
          ['Unreconciled', money(unrecTotal)],
          ['To reimburse', money(reimburseTotal)],
        ].map(([label, value]) => (
          <div key={label}><p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value}</p></div>
        ))}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button className="border border-brand/30 bg-brand/10 text-brand hover:bg-brand/15" onClick={() => setScanOpen(true)}><ScanLine className="mr-2 h-4 w-4" />Scan receipt</Button>
        <Button className="border border-brand/30 bg-brand/10 text-brand hover:bg-brand/15" onClick={() => setPdfOpen(true)}><FileText className="mr-2 h-4 w-4" />Scan to PDF</Button>
        <Button className="border border-brand/30 bg-brand/10 text-brand hover:bg-brand/15" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Log receipt</Button>
      </div>

      <ReceiptScanner open={scanOpen} onOpenChange={setScanOpen} onSaved={load} />
      <ScanToPdf open={pdfOpen} onOpenChange={setPdfOpen} />

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : receipts.length === 0 ? (
        <EmptyState icon={ReceiptIcon} modulePath="/receipts" title="No receipts logged yet" message="Scan or log your first receipt to start reconciling." />
      ) : (
        <div className="space-y-3">
          {shownReceipts.length === 0 ? (
            <EmptyState icon={ReceiptIcon} title="No receipts match these filters" message="Try widening your search or clearing the filters." />
          ) : shownReceipts.map((r) => (
            <Card key={r.id} className={`border-l-4 transition-shadow hover:shadow-md ${r.status === 'Reconciled' ? 'border-l-emerald-500' : 'border-l-amber-400'}`}>
              <CardContent className="px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{r.description}{r.category ? ` · ${r.category}` : ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {[r.merchant, r.date ? format(new Date(r.date), 'd MMM yyyy') : '', r.receipt_number ? `#${r.receipt_number}` : '', r.paid_by ? `Paid by ${r.paid_by}` : '', r.payment_method].filter(Boolean).join(' · ')}
                    </p>
                    {r.reimburse_to && <p className="mt-0.5 text-xs text-muted-foreground">Reimburse to: <span className="font-medium text-foreground">{r.reimburse_to}</span>{r.reimbursed ? ` · reimbursed ${r.reimbursed_date ? format(new Date(r.reimbursed_date), 'd MMM yyyy') : ''}` : ' · pending'}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {r.amount != null && <p className="font-semibold">{money(r.amount)}</p>}
                    <Badge variant={r.status === 'Reconciled' ? 'default' : 'secondary'}>{r.status}</Badge>
                    {r.ndis_category && <Badge className="border-transparent bg-teal/10 text-teal">NDIS: {r.ndis_category}</Badge>}
                    {r.reimburse_to && <Badge className={r.reimbursed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'}>{r.reimbursed ? 'Reimbursed' : 'Reimbursement pending'}</Badge>}
                    {r.file_uri && <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => openReceiptFile(r)}>Open receipt</Button>}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleReconcile(r)} title="Toggle reconciled"><CheckCircle2 className="h-4 w-4" /></Button>
                    {r.reimburse_to && <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toggleReimbursed(r)}>{r.reimbursed ? 'Undo reimbursement' : 'Mark reimbursed'}</Button>}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => { await base44.entities.Receipt.delete(r.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Log receipt</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Description *</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Merchant / supplier</Label><Input value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5"><Label>Amount ($)</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>GST ($)</Label><Input type="number" step="0.01" value={form.gst_amount} onChange={(e) => setForm({ ...form, gst_amount: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5"><Label>Paid by</Label><Input value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Reimburse to</Label><Input value={form.reimburse_to} onChange={(e) => setForm({ ...form, reimburse_to: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Unreconciled', 'Reconciled'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Payment method</Label><Input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Receipt link</Label><Input value={form.receipt_url} onChange={(e) => setForm({ ...form, receipt_url: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label>NDIS support category</Label>
                <Select value={form.ndis_category || 'none'} onValueChange={(v) => setForm({ ...form, ndis_category: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not applicable</SelectItem>
                    {NDIS_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>NDIS support item number</Label><Input value={form.ndis_support_item_number} onChange={(e) => setForm({ ...form, ndis_support_item_number: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={save} disabled={saving || !form.description.trim()}>Save receipt</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}