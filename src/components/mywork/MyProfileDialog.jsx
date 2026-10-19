import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { logUserAction } from '@/lib/actionLog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Field, TextInput, TextArea } from '@/components/Field';
import { Loader2 } from 'lucide-react';

const EDITABLE = ['phone', 'address', 'emergency_contact', 'emergency_contact_phone', 'banking_details', 'superannuation_details', 'about_me'];
const LABELS = {
  phone: 'Phone',
  address: 'Address',
  emergency_contact: 'Emergency contact (name)',
  emergency_contact_phone: 'Emergency contact phone',
  banking_details: 'Banking details (BSB, account, super fund)',
  superannuation_details: 'Superannuation details',
  about_me: 'About me',
};

// Lets a staff member view and update their own profile details (matched by
// email). Position, role and pay fields stay read-only for management.
export default function MyProfileDialog({ profile, open, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const copy = {};
      for (const key of EDITABLE) copy[key] = profile[key] || '';
      setForm(copy);
    }
  }, [profile, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.StaffProfile.update(profile.id, form);
      logUserAction('Profile Updated', 'StaffProfile', { record_id: profile.id, record_title: profile.full_name, details: 'Self-service edit', person: { profile_type: 'employee', profile_id: profile.id } });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>My profile</DialogTitle>
          <DialogDescription>Update your own contact and personal details. Management fields can only be changed by HR.</DialogDescription>
        </DialogHeader>
        {!profile ? (
          <div className="py-8 text-center text-sm text-foreground/50">
            Your profile hasn't been set up yet. Ask HR or your supervisor to create it, then it will appear here for you to update.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
              <div className="font-medium">{profile.full_name}</div>
              <div className="text-xs text-foreground/50">{profile.email}{profile.position ? ` · ${profile.position}` : ''}{profile.start_date ? ` · Started ${profile.start_date}` : ''}</div>
            </div>
            {EDITABLE.map((key) => (
              <Field key={key} label={LABELS[key]}>
                {key === 'about_me' || key === 'address'
                  ? <TextArea value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
                  : <TextInput value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />}
              </Field>
            ))}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save changes
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}