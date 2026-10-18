import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import InvoiceBuilder from '@/components/invoicing/InvoiceBuilder';
import InvoicePreview from '@/components/invoicing/InvoicePreview';
import AgedReceivables from '@/components/invoicing/AgedReceivables';
import { downloadInvoicePdf, printInvoicePdf, invoicePdfBase64, downloadInvoiceTemplatePdf } from '@/lib/invoicePdf';
import { downloadCsv } from '@/lib/csvExport';
import { Plus, Trash2, FileSpreadsheet, Printer, Send, FileDown, FileUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Draft', 'Sent', 'Paid', 'Overdue'];

export default function InvoicingCentre() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [business, setBusiness] = useState({});
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [sendTarget, setSendTarget] = useState(null);
  const [sendForm, setSendForm] = useState({ to: '', subject: '', message: '', attach: true });
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, bizPage] = await Promise.all([
        base44.entities.Invoice.filter({}, { sort: '-created_date', limit: 100 }),
        base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }),
      ]);
      setInvoices(page.items);
      setBusiness(bizPage.items[0] || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const outstanding = invoices.filter((i) => i.status !== 'Paid').reduce((sum, i) => sum + (i.amount || 0), 0);
  const paid = invoices.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + (i.amount || 0), 0);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);

  const uploadInvoiceTemplate = async (file) => {
    if (!file) return;
    setUploadingTemplate(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.FormsLibraryDocument.create({
        library: 'company-safe',
        document_type: 'Invoice Template',
        title: file.name,
        file_name: file.name,
        file_uri,
        uploaded_date: format(new Date(), 'yyyy-MM-dd'),
      });
      toast({ title: 'Invoice template uploaded', description: 'Stored privately in the Company Safe library.' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingTemplate(false);
    }
  };

  const setStatus = async (inv, status) => {
    const patch = { status };
    if (status === 'Paid') patch.paid_date = format(new Date(), 'yyyy-MM-dd');
    if (status === 'Sent' && !inv.sent_at) patch.sent_at = new Date().toISOString();
    await base44.entities.Invoice.update(inv.id, patch);
    await load();
    toast({ title: `Invoice ${inv.invoice_number} marked ${status.toLowerCase()}` });
  };

  const exportCsv = () => {
    downloadCsv(
      'Invoices.csv',
      [
        { key: 'invoice_number', label: 'Invoice Number' }, { key: 'client_name', label: 'Billed To' },
        { key: 'biller_type', label: 'Biller Type' }, { key: 'participant_name', label: 'Participant' },
        { key: 'ndis_number', label: 'NDIS Number' }, { key: 'amount', label: 'Total ($)' },
        { key: 'issue_date', label: 'Issue Date' }, { key: 'due_date', label: 'Due Date' },
        { key: 'status', label: 'Status' }, { key: 'payment_terms', label: 'Payment Terms' },
        { key: 'paid_date', label: 'Paid Date' }, { key: 'notes', label: 'Notes' },
      ],
      invoices,
    );
    toast({ title: 'Invoices exported to CSV' });
  };

  const openSend = (inv) => {
    setSendTarget(inv);
    setSendForm({
      to: inv.client_email || '',
      subject: `Invoice ${inv.invoice_number} from ${business.business_name || 'our business'}`,
      message: `Hi,\n\nPlease find attached invoice ${inv.invoice_number} for NDIS supports delivered to ${inv.participant_name || inv.client_name || 'the participant'}.\n\nTotal due: $${(inv.amount || 0).toFixed(2)}\nDue: ${inv.due_date || ''}\n\nPayment details are included on the invoice.\n\nKind regards,\n${business.business_name || ''}`,
      attach: true,
    });
  };

  const send = async () => {
    setSending(true);
    try {
      const payload = { to: sendForm.to, subject: sendForm.subject, body: sendForm.message };
      if (sendForm.attach) payload.attachments = [{ filename: `Invoice-${sendTarget.invoice_number}.pdf`, content: invoicePdfBase64(sendTarget, business) }];
      const res = await base44.functions.invoke('sendAppEmail', payload);
      if (res.data?.error) throw new Error(res.data.error);
      const patch = { status: 'Sent', sent_at: new Date().toISOString() };
      await base44.entities.Invoice.update(sendTarget.id, patch);
      setSendTarget(null);
      await load();
      toast({ title: 'Invoice sent', description: `Emailed to ${sendForm.to} with the PDF attached.` });
    } catch (error) {
      toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const summary = useMemo(() => ({
    total: invoices.length,
    sent: invoices.filter((i) => i.status === 'Sent').length,
    paid: invoices.filter((i) => i.status === 'Paid').length,
    overdue: invoices.filter((i) => i.status === 'Overdue').length,
  }), [invoices]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileSpreadsheet}
        title="Invoicing Centre"
        subtitle="Create, send and track NDIS invoices with GST-free supports and payment tracking."
        showAlerts={false}
        showCompliance={false}
        showAudit={false}
      />

      <div className="flex flex-wrap items-center gap-2">
        <ModuleComplianceStrip path="/invoicing" />
        <ModuleAuditChecklistButton />
        <ModuleAuditButton />
        <Button onClick={() => setBuilderOpen(true)}><Plus className="mr-2 h-4 w-4" />Generate invoice</Button>
        <Button variant="outline" onClick={() => downloadInvoiceTemplatePdf(business)}><FileDown className="mr-2 h-4 w-4" />Invoice template</Button>
        <label className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-transparent px-4 py-2 text-sm font-semibold shadow-sm hover:bg-accent ${uploadingTemplate ? 'pointer-events-none opacity-60' : ''}`}>
          {uploadingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}{uploadingTemplate ? 'Uploading…' : 'Upload template'}
          <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx" onChange={(e) => { uploadInvoiceTemplate(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        <Button variant="outline" onClick={exportCsv} disabled={loading || invoices.length === 0}><FileDown className="mr-2 h-4 w-4" />Export CSV</Button>
      </div>

      {!business.business_name && !loading && (
        <Card><CardContent className="p-4 text-sm text-muted-foreground">Add your business name, address, contact details and banking details in Company Safe so they appear on every invoice.</CardContent></Card>
      )}

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Invoices', value: summary.total },
          { label: 'Sent', value: summary.sent },
          { label: 'Paid', value: summary.paid },
          { label: 'Overdue', value: summary.overdue },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4"><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

      <AgedReceivables invoices={invoices} onChanged={load} />

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : invoices.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No invoices yet. Click Generate invoice to create your first NDIS invoice.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{inv.invoice_number}{inv.client_name ? ` · ${inv.client_name}` : ''}{inv.participant_name ? ` (${inv.participant_name})` : ''}</p>
                  <p className="text-sm text-muted-foreground">
                    {inv.issue_date ? `Issued ${format(new Date(inv.issue_date), 'd MMM yyyy')}` : ''}
                    {inv.due_date ? ` · Due ${format(new Date(inv.due_date), 'd MMM yyyy')}` : ''}
                    {` · ${(JSON.parse(inv.line_items || '[]').length)} support line${(JSON.parse(inv.line_items || '[]').length) === 1 ? '' : 's'}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">${(inv.amount || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>
                  <Badge className={statusTone(inv.status)}>{inv.status}</Badge>
                  <Select value={inv.status} onValueChange={(v) => setStatus(inv, v)}>
                    <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" title="Preview" onClick={() => setPreview(inv)}><FileSpreadsheet className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Download PDF" onClick={() => downloadInvoicePdf(inv, business)}><FileDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Print" onClick={() => printInvoicePdf(inv, business)}><Printer className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Send by email" onClick={() => openSend(inv)}><Send className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Delete" onClick={async () => { await base44.entities.Invoice.delete(inv.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <InvoiceBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} onSaved={load} invoiceCount={invoices.length} />

      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={(next) => { if (!next) setPreview(null); }}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>Invoice preview - {preview?.invoice_number}</DialogTitle></DialogHeader>
          {preview && <InvoicePreview invoice={preview} business={business} />}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => printInvoicePdf(preview, business)}><Printer className="h-4 w-4" />Print</Button>
            <Button onClick={() => downloadInvoicePdf(preview, business)}><FileDown className="h-4 w-4" />Download PDF</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send dialog */}
      <Dialog open={!!sendTarget} onOpenChange={(next) => { if (!next) setSendTarget(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send invoice {sendTarget?.invoice_number}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>To *</Label><Input value={sendForm.to} onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })} placeholder="biller@example.com" /></div>
            <div className="grid gap-1.5"><Label>Subject</Label><Input value={sendForm.subject} onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Message</Label><Textarea rows={5} value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sendForm.attach} onChange={(e) => setSendForm({ ...sendForm, attach: e.target.checked })} />Attach the invoice PDF</label>
            <Button onClick={send} disabled={sending || !sendForm.to.trim()}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Send invoice</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}