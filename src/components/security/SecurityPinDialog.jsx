import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, KeyRound, Loader2 } from 'lucide-react';
import { sanitisePin } from '@/lib/workspacePin';

const PinField = ({ id, label, value, onChange, disabled }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-extrabold uppercase tracking-[0.1em]">{label}</Label>
    <Input
      id={id}
      type="password"
      inputMode="numeric"
      autoComplete="off"
      maxLength={8}
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(sanitisePin(event.target.value))}
      placeholder="••••"
      className="text-center text-lg font-extrabold tracking-[0.4em]"
    />
  </div>
);

export default function SecurityPinDialog({ open, onOpenChange, pin, workspaceLabel }) {
  const [currentPin, setCurrentPin] = useState('');
  const [nextPin, setNextPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    if (!open) return;
    setCurrentPin('');
    setNextPin('');
    setConfirmPin('');
    pin.clearMessages();
  }, [open]);

  const submit = async () => {
    const ok = await pin.change(currentPin, nextPin, confirmPin);
    if (ok) {
      setCurrentPin('');
      setNextPin('');
      setConfirmPin('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-extrabold">
            <KeyRound className="h-4 w-4" /> Dashboard security PIN
          </DialogTitle>
          <DialogDescription className="text-xs font-semibold">
            This PIN is asked for before {workspaceLabel} opens on a new session. It is stored as a hash against your account, not as readable digits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <PinField id="pin-current" label="Current PIN" value={currentPin} onChange={setCurrentPin} disabled={pin.busy} />
          <PinField id="pin-next" label="New PIN (4–8 digits)" value={nextPin} onChange={setNextPin} disabled={pin.busy} />
          <PinField id="pin-next-confirm" label="Confirm new PIN" value={confirmPin} onChange={setConfirmPin} disabled={pin.busy} />
          {pin.error && <p role="alert" className="text-xs font-bold text-destructive">{pin.error}</p>}
          {pin.notice && !pin.error && <p className="text-xs font-bold text-safe">{pin.notice}</p>}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => { pin.lock(); onOpenChange(false); }} className="gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Lock now
          </Button>
          <Button onClick={submit} disabled={pin.busy} className="gap-1.5">
            {pin.busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
            Update PIN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}