import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { businessDateTime } from '@/lib/intakeCases';

export default function ProfileAboutMeEditor({ profile, kind, onUpdated, compact = false }) {
  const { user } = useAuth();
  const [value, setValue] = useState(profile.about_me || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => { setValue(profile.about_me || ''); }, [profile.id, profile.about_me]);
  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const { date, time } = businessDateTime();
      const changes = { about_me: value, change_log: [`${date} ${time} | About Me updated by ${user?.full_name || user?.email || 'Self-service'}`, profile.change_log].filter(Boolean).join('\n') };
      const updated = await base44.entities[kind === 'staff' ? 'StaffProfile' : 'ParticipantProfile'].update(profile.id, changes);
      await onUpdated?.({ ...profile, ...changes, ...updated });
      setSaved(true);
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  return <section className={`min-w-0 rounded-xl border border-primary/25 bg-primary/5 ${compact ? 'p-2' : 'p-3'}`}>
    <label htmlFor={`about-${kind}-${profile.id}`} className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" />About Me</label>
    <Textarea id={`about-${kind}-${profile.id}`} rows={compact ? 2 : 3} value={value} disabled={saving} onChange={(event) => { setValue(event.target.value); setSaved(false); }} placeholder="Interests, story and anything to share." />
    <div className="mt-2 flex items-center justify-end gap-2">{saved && <span role="status" className="text-xs text-safe">Saved</span>}<Button size="sm" variant="outline" disabled={saving || value === (profile.about_me || '')} onClick={save}>{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Save About Me</Button></div>
    {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
  </section>;
}