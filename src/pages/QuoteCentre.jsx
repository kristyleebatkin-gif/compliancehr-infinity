import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ClipboardList, Download, FileDown, Eye, Loader2, Mail, Plus, Trash2, Pencil, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import { SUPPORT_ITEMS, lineAmount, parseLineItems, PRICE_GUIDE_VERSION } from '@/lib/ndisPriceGuide';
import { downloadQuotePdf, downloadQuoteTemplatePdf, printQuotePdf, quotePdfBase64, quotePdfFilename } from '@/lib/quotePdf';
import QuoteBuilder from '@/components/quotes/QuoteBuilder';
import QuotePreview from '@/components/quotes/QuotePreview';

const money = (v) => (v == null ? '-' : `$${Number(v).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
const STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'];

export default function QuoteCentre() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState([]);
  const [business, setBusiness] = useState({});
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [sending, setSending] = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [quotePage, businessPage] = await Promise.all([
        base44.entities.Quote.filter({}, { sort: '-created_date', limit: 200 }),
        base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }),
      ]);
      setQuotes(quotePage.items);
      setBusiness(businessPage.items?.[0] || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setBuilderOpen(true); };
  const openEdit = (q) => { setEditing(q); setBuilderOpen(true); };

  const sendQuote = async (q) => {
    if (!q.client_email) {
      toast({ title: 'No client email', description: 'Add a client email to send this quote.', variant: 'destructive' });
      return;
    }
    setSending(q.id);
    try {
      const lines = parseLineItems(q.line_items);
      const total = lines.length ? lines.reduce((sum, l) => sum + lineAmount(l), 0) : (Number(q.total) || 0);
      const body = [
        `Dear ${q.client_name || 'Client'},`,
        '',
        `Please find attached our quotation ${q.quote_number} for the supports below.`,
        `Quote date: ${q.issue_date || '-'}   |   Valid until: ${q.expiry_date || '-'}`,
        '',
        ...(lines.length ? lines.map((l) => `- ${l.description}: ${l.qty} ${l.unit || ''} x $${Number(l.unit_price || 0).toFixed(2)} = $${lineAmount(l).toFixed(2)}`) : []),
        '',
        `QUOTE TOTAL: $${total.toFixed(2)} (NDIS supports are GST free)`,
        '',
        q.terms_conditions || business.quote_terms || '',
        '',
        'To accept this quotation, sign the attached PDF and return it to us. We will then prepare a formal service agreement.',
      ].filter(Boolean).join('\n').slice(0, 5000);
      const res = await base44.functions.invoke('sendAppEmail', {
        to: q.client_email,
        subject: `Quotation ${q.quote_number} - ${business.business_name || 'Support Services'}`,
        body,
        attachments: [{ filename: quotePdfFilename(q), content: quotePdfBase64(q, business) }],
      });
      if (res.data?.error) {
        toast({ title: 'Could not send', description: res.data.error, variant: 'destructive' });
      } else {
        await base44.entities.Quote.update(q.id, { status: q.status === 'Draft' ? 'Sent' : q.status, sent_at: new Date().toISOString(), sent_to: q.client_email });
        await load();
        toast({ title: 'Quote sent', description: `Emailed to ${q.client_email} with the PDF attached.` });
      }
    } catch (error) {
      toast({ title: 'Could not send', description: error.message, variant: 'destructive' });
    } finally {
      setSending(null);
    }
  };

  const exportRegister = async () => {
    setExporting(true);
    try {
      downloadCsv('Quote-Register.csv', [
        { key: 'quote_number', label: 'Quote Number' }, { key: 'client_name', label: 'Quote For' },
        { key: 'client_email', label: 'Client Email' }, { key: 'biller_type', label: 'Biller Type' },
        { key: 'participant_name', label: 'Participant' }, { key: 'ndis_number', label: 'NDIS Number' },
        { key: 'issue_date', label: 'Quote Date' }, { key: 'expiry_date', label: 'Valid Until' },
        { key: 'total', label: 'Total' }, { key: 'status', label: 'Status' },
        { key: 'sent_to', label: 'Sent To' }, { key: 'sent_at', label: 'Sent At' },
        { key: 'terms_conditions', label: 'Terms' }, { key: 'notes', label: 'Notes' },
      ], quotes);
      toast({ title: 'Quote register exported' });
    } finally {
      setExporting(false);
    }
  };

  const totalValue = quotes.reduce((sum, q) => sum + (Number(q.total) || 0), 0);
  const acceptedValue = quotes.filter((q) => q.status === 'Accepted').reduce((sum, q) => sum + (Number(q.total) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/10 p-3"><ClipboardList className="h-7 w-7" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quote Centre</h1>
              <p className="text-sm text-slate-300">NDIS support quotations with price guide items, business details and terms from Company Safe.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[['Quotes', String(quotes.length)], ['Quoted value', money(totalValue)], ['Accepted', money(acceptedValue)]].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">{label}</p>
                <p className="text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="bg-white text-slate-900 hover:bg-slate-200" onClick={openNew}><Plus className="mr-2 h-4 w-4" />New quote</Button>
          <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={() => downloadQuoteTemplatePdf(business)}><FileDown className="mr-2 h-4 w-4" />Quote template</Button>
          <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={exportRegister} disabled={exporting || loading || quotes.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">{PRICE_GUIDE_VERSION}. Business name, address, contact details and quote terms are pulled live from Company Safe.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : quotes.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No quotes yet. Create your first quote above.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => {
            const lines = parseLineItems(q.line_items);
            const total = lines.length ? lines.reduce((sum, l) => sum + lineAmount(l), 0) : (Number(q.total) || 0);
            return (
              <Card key={q.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{q.quote_number} · {q.client_name || 'No client set'}</p>
                      <p className="text-sm text-muted-foreground">
                        {[q.issue_date ? format(new Date(q.issue_date), 'd MMM yyyy') : '', q.expiry_date ? `Valid until ${format(new Date(q.expiry_date), 'd MMM yyyy')}` : '', q.participant_name, lines.length ? `${lines.length} line${lines.length === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ')}
                      </p>
                      {q.sent_to && <p className="text-xs text-muted-foreground">Sent to {q.sent_to}{q.sent_at ? ` on ${format(new Date(q.sent_at), 'd MMM yyyy')}` : ''}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{money(total)}</p>
                      <Badge className={statusTone(q.status)}>{q.status}</Badge>
                      <Select value={q.status} onValueChange={async (v) => { await base44.entities.Quote.update(q.id, { status: v }); await load(); }}>
                        <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPreviewing(q)}><Eye className="h-3 w-3" />Preview</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => downloadQuotePdf(q, business)}><Download className="h-3 w-3" />Download PDF</Button>
                    {q.pdf_file_uri && (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={async () => {
                        try {
                          const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: q.pdf_file_uri });
                          window.open(signed_url, '_blank');
                        } catch (error) {
                          toast({ title: 'Could not open copy', description: error.message, variant: 'destructive' });
                        }
                      }}><FileText className="h-3 w-3" />Stored copy</Button>
                    )}
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => printQuotePdf(q, business)}><Eye className="h-3 w-3" />Print</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" disabled={sending === q.id} onClick={() => sendQuote(q)}>
                      {sending === q.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}Send quote
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEdit(q)}><Pencil className="h-3 w-3" />Edit</Button>
                    <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={async () => { await base44.entities.Quote.delete(q.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <QuoteBuilder open={builderOpen} onOpenChange={setBuilderOpen} editing={editing} business={business} onSaved={load} />

      <Dialog open={Boolean(previewing)} onOpenChange={(v) => !v && setPreviewing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader><DialogTitle>Quote preview — {previewing?.quote_number}</DialogTitle></DialogHeader>
          {previewing && (
            <div className="space-y-3">
              <QuotePreview quote={previewing} business={business} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadQuotePdf(previewing, business)}><Download className="mr-2 h-4 w-4" />Download PDF</Button>
                <Button size="sm" onClick={() => printQuotePdf(previewing, business)}><Eye className="mr-2 h-4 w-4" />Print</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}