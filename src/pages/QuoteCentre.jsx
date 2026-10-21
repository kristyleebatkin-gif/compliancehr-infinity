import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import RegisterInsights from '@/components/RegisterInsights';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ClipboardList, Download, FileDown, Eye, Loader2, Mail, Plus, Trash2, Pencil, FileText, Search, Copy, BadgeCheck, TrendingUp, CalendarClock } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { Input } from '@/components/ui/input';
import { format, addDays } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import { lineAmount, parseLineItems, PRICE_GUIDE_VERSION } from '@/lib/ndisPriceGuide';
import { downloadQuotePdf, downloadQuoteTemplatePdf, printQuotePdf, quotePdfBase64, quotePdfFilename } from '@/lib/quotePdf';
import QuoteBuilder from '@/components/quotes/QuoteBuilder';
import QuotePreview from '@/components/quotes/QuotePreview';
import ModuleShell from '@/components/module/ModuleShell';
import FinanceMetricCards from '@/components/finance/FinanceMetricCards';
import ModuleAlertsButton from '@/components/ModuleAlertsButton';
import { loadCompanyBranding } from '@/lib/companyBranding';

const money = (v) => (v == null ? '-' : `$${Number(v).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
const STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'];
const todayStr = format(new Date(), 'yyyy-MM-dd');
const soonStr = format(addDays(new Date(), 14), 'yyyy-MM-dd');

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [quotePage, businessPage] = await Promise.all([
        base44.entities.Quote.filter({}, { sort: '-created_date', limit: 200 }),
        base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }),
        loadCompanyBranding(),
      ]);
      setQuotes(quotePage.items);
      setBusiness(businessPage.items?.[0] || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = async () => {
    const page = await base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 });
    setBusiness(page.items?.[0] || {});
    setEditing(null);
    setBuilderOpen(true);
  };
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
  const responded = quotes.filter((q) => ['Accepted', 'Declined'].includes(q.status)).length;
  const winRate = responded ? Math.round((quotes.filter((q) => q.status === 'Accepted').length / responded) * 100) : 0;
  const expiringSoon = quotes.filter((q) => q.expiry_date && ['Draft', 'Sent'].includes(q.status) && q.expiry_date >= todayStr && q.expiry_date <= soonStr).length;

  const visibleQuotes = quotes.filter((q) =>
    (statusFilter === 'All' || q.status === statusFilter) &&
    (!search.trim() || [q.quote_number, q.client_name, q.participant_name, q.ndis_number].some((v) => (v || '').toLowerCase().includes(search.trim().toLowerCase())))
  );

  const duplicateQuote = async (q) => {
    try {
      const count = await base44.entities.Quote.count({});
      const { id, created_date, updated_date, created_by_id, ...rest } = q;
      await base44.entities.Quote.create({
        ...rest,
        quote_number: `Q-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`,
        issue_date: format(new Date(), 'yyyy-MM-dd'),
        expiry_date: format(addDays(new Date(), Number(business.quote_validity_days) || 30), 'yyyy-MM-dd'),
        status: 'Draft',
        sent_at: '',
        sent_to: '',
        pdf_file_uri: '',
        pdf_file_name: '',
        pdf_generated_date: '',
      });
      await load();
      toast({ title: 'Quote duplicated', description: 'A fresh draft was created. Edit it and send when ready.' });
    } catch (error) {
      toast({ title: 'Could not duplicate', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="finance-workspace quotes-workspace space-y-4">
      <ModuleShell title="Quote Centre" subtitle="NDIS support quotations with price guide items, business details and terms from Company Safe." icon={ClipboardList} moduleKey="quotes" insightModule="quotes" actions={<ModuleAlertsButton />} />
      <FinanceMetricCards entries={[
        { label: 'Quotes', value: String(quotes.length), Icon: ClipboardList, tone: 'primary' },
        { label: 'Quoted value', value: money(totalValue), Icon: FileText, tone: 'evidence' },
        { label: 'Accepted', value: money(acceptedValue), Icon: BadgeCheck, tone: 'safe' },
        { label: 'Win rate', value: `${winRate}%`, Icon: TrendingUp, tone: 'pink' },
        { label: 'Expiring soon', value: String(expiringSoon), Icon: CalendarClock, tone: 'warning' },
      ]} />

      <div className="quote-actions flex flex-wrap items-center gap-2">
        <Button className="border border-brand/30 bg-brand/10 text-brand hover:bg-brand/15" onClick={openNew}><Plus className="mr-2 h-4 w-4" />New quote</Button>
        <Button variant="outline" disabled={loading} onClick={() => downloadQuoteTemplatePdf(business)}><FileDown className="mr-2 h-4 w-4" />Quote template</Button>
        <Button variant="outline" onClick={exportRegister} disabled={exporting || loading || quotes.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>
        <p className="text-[11px] text-muted-foreground">{PRICE_GUIDE_VERSION}. Business name, address, contact details and quote terms are pulled live from Company Safe.</p>
      </div>

      <div className="quote-filters module-filter-bar flex flex-wrap items-center">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search quote number, client, participant or NDIS number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : quotes.length === 0 ? (
        <EmptyState icon={FileText} modulePath="/quotes" title="No quotes yet" message="Create your first quote to start winning work." />
      ) : visibleQuotes.length === 0 ? (
        <EmptyState icon={Search} modulePath="/quotes" title="No quotes match" message="Try a different search term or filter." />
      ) : (
        <div className="space-y-3">
          {visibleQuotes.map((q) => {
            const lines = parseLineItems(q.line_items);
            const total = lines.length ? lines.reduce((sum, l) => sum + lineAmount(l), 0) : (Number(q.total) || 0);
            return (
              <Card key={q.id} className={`quote-record ${q.status === 'Accepted' ? 'finance-tone-safe' : q.status === 'Sent' ? 'finance-tone-evidence' : q.status === 'Declined' || q.status === 'Expired' ? 'finance-tone-danger' : 'finance-tone-primary'}`}>
                <CardContent className="px-3 py-2">
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
                      {q.expiry_date && !['Accepted', 'Declined'].includes(q.status) && (q.expiry_date < todayStr ? (
                        <Badge className="bg-danger/10 text-danger text-[10px]">Expired</Badge>
                      ) : q.expiry_date <= soonStr ? (
                        <Badge className="bg-warning/10 text-warning text-[10px]">Expiring soon</Badge>
                      ) : null)}
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
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => duplicateQuote(q)}><Copy className="h-3 w-3" />Duplicate</Button>
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