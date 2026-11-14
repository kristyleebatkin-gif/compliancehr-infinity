import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { changeStatus } from '@/lib/statusLog';
import { fetchAllRecords } from '@/lib/csvExport';
import { buildReferralDocument, downloadReferralDocument } from '@/lib/referralPdf';
import { Download, Send, UploadCloud, FileText, Pencil, Trash2, Loader2, Eye, ClipboardList } from 'lucide-react';
import ReferralSendDialog from './ReferralSendDialog';
import ReferralToIntakeDialog from './ReferralToIntakeDialog';

const STATUSES = ['Draft', 'Prepared', 'Sent', 'Accepted', 'In Progress', 'Declined', 'Completed'];

const urgencyTone = (u = '') => {
  if (u.includes('Crisis')) return 'bg-danger/10 text-danger';
  if (u.includes('Urgent')) return 'bg-warning/10 text-warning';
  return 'bg-success/10 text-success';
};

export default function ReferralLog({ onEdit }) {
  const { toast } = useToast();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sending, setSending] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [storingId, setStoringId] = useState(null);
  const [starting, setStarting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const rows = await fetchAllRecords(base44.entities.Referral, {}, '-created_date');
      setReferrals(rows);
    } catch (error) {
      console.error(error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeSt = async (r, status) => {
    if (r.status === status) return;
    await changeStatus({ entityType: 'Referral', entity: 'Referral', record: r, toStatus: status, ...(status === 'Completed' ? { dateField: 'completed_date' } : {}) });
    await load();
    toast({ title: `Referral moved to ${status}` });
  };

  const storeForm = async (r) => {
    setStoringId(r.id);
    try {
      const blob = buildReferralDocument(r).output('blob');
      const name = `Referral ${r.referral_id || r.client_name}.pdf`;
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: new File([blob], name, { type: 'application/pdf' }) });
      await base44.entities.Referral.update(r.id, { form_file_uri: file_uri, form_file_name: name });
      await load();
      toast({ title: 'Referral form stored with the record' });
    } catch (error) {
      toast({ title: 'Storage failed', description: error.message, variant: 'destructive' });
    } finally {
      setStoringId(null);
    }
  };

  const openStored = async (r) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: r.form_file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Unable to open form', description: error.message, variant: 'destructive' });
    }
  };

  const remove = async (r) => {
    await base44.entities.Referral.delete(r.id);
    await load();
    toast({ title: 'Referral deleted' });
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  if (loadError) {
    return <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Referral register unavailable; records could not be confirmed.<Button size="sm" variant="outline" onClick={load}>Retry</Button></div>;
  }

  return (
    <div className="space-y-3">
      {referrals.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No referrals logged yet - create one in the Referral Form tab.</CardContent></Card>
      ) : (
        referrals.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{r.client_name} <span className="text-xs font-normal text-muted-foreground">· {r.referral_id}</span></p>
                  <p className="text-xs text-muted-foreground">{r.service_type}{r.provider_name ? ` → ${r.provider_name}` : ''}{r.sent_to ? ` · sent to ${r.sent_to}` : ''}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge className={`text-[10px] ${urgencyTone(r.urgency)}`}>{r.urgency}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{r.status}</Badge>
                  {r.intake_case_number && <Badge variant="outline" className="text-[10px]">Intake {r.intake_case_number}</Badge>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
                <Select value={r.status} onValueChange={(v) => changeSt(r, v)}>
                  <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setViewing(r)}><Eye className="h-3 w-3" />View</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => downloadReferralDocument(r)}><Download className="h-3 w-3" />PDF</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => storeForm(r)} disabled={storingId === r.id}>
                  {storingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}{r.form_file_uri ? 'Re-store' : 'Store'}
                </Button>
                {r.form_file_uri && <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openStored(r)}><FileText className="h-3 w-3" />Open stored</Button>}
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSending(r)}><Send className="h-3 w-3" />Email</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setStarting(r)}>
                  <ClipboardList className="h-3 w-3" />{r.intake_case_number ? `Intake ${r.intake_case_number}` : 'Start intake'}
                </Button>
                <div className="ml-auto flex">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(r)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <ReferralSendDialog referral={sending} open={!!sending} onClose={() => setSending(null)} onSent={load} />

      <ReferralToIntakeDialog
        referral={starting}
        open={!!starting}
        onClose={() => setStarting(null)}
        onCreated={load}
      />

      <Dialog open={!!viewing} onOpenChange={(v) => { if (!v) setViewing(null); }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Referral {viewing?.referral_id}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="font-semibold">{viewing.client_name}</p>
                <p className="text-xs text-muted-foreground">{[viewing.phone, viewing.email].filter(Boolean).join(' · ') || 'No contact details'}</p>
                <p className="text-xs text-muted-foreground">{[viewing.address, viewing.postcode].filter(Boolean).join(' ')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[['Service type', viewing.service_type], ['Urgency', viewing.urgency], ['Status', viewing.status], ['Consent', viewing.consent], ['Sent to', viewing.sent_to], ['Sent at', viewing.sent_at], ['Outcome', viewing.outcome], ['Provider', viewing.provider_name]].map(([label, value]) => value ? (
                  <div key={label}><span className="font-semibold text-foreground/70">{label}:</span> {value}</div>
                ) : null)}
              </div>
              {viewing.reason && <div><p className="text-xs font-bold uppercase tracking-wide text-foreground/50">Reason for referral</p><p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{viewing.reason}</p></div>}
              {viewing.support_needs && <div><p className="text-xs font-bold uppercase tracking-wide text-foreground/50">Support needs</p><p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{viewing.support_needs}</p></div>}
              {viewing.referrer_name && <div><p className="text-xs font-bold uppercase tracking-wide text-foreground/50">Referrer</p><p className="mt-1 text-xs text-muted-foreground">{[viewing.referrer_name, viewing.referrer_role, viewing.referrer_phone, viewing.referrer_email].filter(Boolean).join(' · ')}</p></div>}
              {viewing.notes && <div><p className="text-xs font-bold uppercase tracking-wide text-foreground/50">Notes</p><p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{viewing.notes}</p></div>}
              <div><p className="text-xs font-bold uppercase tracking-wide text-foreground/50">Status history</p><p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{viewing.status_log || 'No status changes recorded yet.'}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}