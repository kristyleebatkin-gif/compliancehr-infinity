import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { businessDateTime } from '@/lib/intakeCases';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
};

export default function ProfileAboutMeEditor({ profile, kind, onUpdated, compact = false }) {
  const { user } = useAuth();
  const [value, setValue] = useState(profile.about_me || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setValue(profile.about_me || '');
  }, [profile.id, profile.about_me]);
  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const { date, time } = businessDateTime();
      const changes = {
        about_me: value,
        change_log: [
          `${date} ${time} | About Me updated by ${user?.full_name || user?.email || 'Self-service'}`,
          profile.change_log,
        ]
          .filter(Boolean)
          .join('\n'),
      };
      const updated = await base44.entities[
        kind === 'staff' ? 'StaffProfile' : 'ParticipantProfile'
      ].update(profile.id, changes);
      await onUpdated?.({ ...profile, ...changes, ...updated });
      setSaved(true);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <section
      data-profile-tone="about"
      className={`min-w-0 rounded-xl shadow-2xs ${
        compact ? 'profile-uniform-box p-2.5' : 'p-3'
      }`}
      style={GRADIENT_BORDER_STYLE}
    >
      <label
        htmlFor={`about-${kind}-${profile.id}`}
        className="mb-2 flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-extrabold text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
      >
        <Sparkles className="h-4 w-4 text-[#0072FF]" />
        <span className="font-extrabold text-[#0A2B6D]">About Me</span>
      </label>
      <Textarea
        id={`about-${kind}-${profile.id}`}
        rows={compact ? 2 : 3}
        value={value}
        disabled={saving}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
        className="text-xs font-semibold text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
        placeholder="Interests, story and anything to share."
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        {saved && (
          <span role="status" className="text-xs font-bold text-[#0A2B6D]">
            Saved
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          className="rounded-full font-extrabold text-[#0A2B6D]"
          style={GRADIENT_BORDER_STYLE}
          disabled={saving || value === (profile.about_me || '')}
          onClick={save}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0072FF]" />
          ) : (
            <Save className="h-3.5 w-3.5 text-[#0072FF]" />
          )}
          Save About Me
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}