import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PenLine, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

const fmt = (d) => (d ? String(d).slice(0, 10) : '');

// Digital contract signing: the employee types their full name as a digital
// signature, and the contract moves to Signed with the signature and date recorded.
export default function ContractSignDialog({ contract, business, userName, open, onOpenChange, onSigned }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [signing, setSigning] = useState(false);

  const sign = async () => {
    if (!contract) return;
    setSigning(true);
    try {
      const signedAt = format(new Date(), "yyyy-MM-dd'T'HH:mm");
      await base44.functions.invoke('hrPaperwork', {
        action: 'update', kind: 'contract', id: contract.id,
        data: {
          contract_status: 'Signed',
          employee_signed_date: signedAt.slice(0, 10),
          signature: `Digitally signed by ${name.trim()}`,
        },
      });
      await base44.entities.CommunicationEntry.create({
        entry_kind: 'Employee Log',
        person_type: 'Employee',
        person_name: contract.employee_name,
        entry_date: signedAt.slice(0, 10),
        entry_time: signedAt.slice(11),
        subject: `Employment contract signed - ${contract.employee_name}`,
        body: `${contract.employee_name} digitally signed their ${contract.position_title} ${contract.employment_type || ''} employment contract. Signed by ${name.trim()}.`,
        sender_name: userName || 'HR Hub',
      });
      toast({ title: 'Contract signed', description: `Signature recorded for ${contract.employee_name}.` });
      setName('');
      setConfirming(false);
      onOpenChange(false);
      onSigned?.();
    } catch (e) {
      toast({ title: 'Could not record signature', description: e?.message, variant: 'destructive' });
    } finally {
      setSigning(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!signing) { setName(''); setConfirming(false); onOpenChange(next); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Digitally sign contract</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <p className="font-semibold">{contract.employee_name}</p>
            <p className="text-xs text-muted-foreground">
              {contract.position_title} · {contract.employment_type || ''} · commenced {fmt(contract.commencement_date)}
              {business?.business_name ? ` · ${business.business_name}` : ''}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            By typing your full legal name below and confirming, you electronically sign this employment contract. Your typed name, the date and the signing event are recorded and logged.
          </p>
          <div className="grid gap-1.5">
            <Label>Full legal name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type your full name to sign" />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={confirming} onChange={(e) => setConfirming(e.target.checked)} className="mt-0.5" />
            I confirm I have read the contract and agree to its terms.
          </label>
          <Button onClick={sign} disabled={signing || !name.trim() || name.trim().split(/\s+/).length < 2 || !confirming}>
            {signing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenLine className="mr-2 h-4 w-4" />}Sign contract
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}