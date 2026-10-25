import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, CheckCircle2, Briefcase, Heart, ShieldCheck } from 'lucide-react';

export default function PersonalProfileForm({ kind = 'staff', fields, form, onChange, onSave, saving, saved, readOnly = false }) {
  if (readOnly) {
    return (
      <p className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 text-xs font-bold text-[#0A2B6D]">
        Read-only view. Support team and management can make updates.
      </p>
    );
  }

  // Group fields into their accurate profile sections so every entry updates in the right section
  const grouped = fields.reduce((acc, item) => {
    const [key, label, inputKind, sectionTitle = 'Profile Details'] = item;
    if (!acc[sectionTitle]) acc[sectionTitle] = [];
    acc[sectionTitle].push([key, label, inputKind]);
    return acc;
  }, {});

  const isStaff = kind === 'staff';

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0A2B6D] border-b-4 border-b-[#FF2E9A] px-3.5 py-2 text-white shadow-sm"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="flex items-center gap-2">
          {isStaff ? <Briefcase className="h-4 w-4 text-white" /> : <Heart className="h-4 w-4 text-white" />}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">
              {isStaff ? 'Employee Profession & Sectioned Profile Editor' : 'Participant NDIS Profile & Sectioned Details Editor'}
            </div>
            <h3 className="text-sm font-extrabold text-white">
              {isStaff ? 'Update My Profession, Contact, Emergency & Payroll Sections' : 'Update My Participant Profile, NDIS Support, Emergency & Preferences Sections'}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0072FF]" /> Updated in Profile Sections
            </span>
          )}
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving}
            className="border-2 border-white bg-white text-[#0A2B6D] font-extrabold hover:bg-[#F5F0FF]"
          >
            <Save className="h-3.5 w-3.5 text-[#5A00D6]" />
            {saving ? 'Saving to sections…' : 'Save All Profile Sections'}
          </Button>
        </div>
      </div>

      {/* Each Profile Section Boxed in Dark Blue (#0A2B6D), with Each Item Boxed Inside */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Object.entries(grouped).map(([sectionName, sectionFields]) => (
          <div
            key={sectionName}
            className="profile-dark-blue-box flex flex-col justify-between overflow-hidden rounded-xl border-2 border-[#0A2B6D] bg-white shadow-sm"
          >
            <div
              className="flex items-center justify-between gap-2 border-b-2 border-[#0A2B6D] px-3 py-1.5 text-white"
              style={{ background: 'linear-gradient(120deg, #0A2B6D 0%, #5A00D6 70%, #0072FF 100%)' }}
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00C6FF]" />
                Section: {sectionName}
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0 text-[9.5px] font-bold text-white">
                Auto-Syncs to {sectionName}
              </span>
            </div>

            <div className="grid gap-2 p-2.5 sm:grid-cols-2 bg-[#F5F0FF]/35">
              {sectionFields.map(([key, label, inputKind]) => (
                <div
                  key={key}
                  className={`profile-item-box rounded-lg border-2 border-[#0A2B6D] bg-white p-2 ${
                    inputKind === 'textarea' ? 'sm:col-span-2' : ''
                  }`}
                >
                  <Label htmlFor={`personal-${key}`} className="text-[11px] font-extrabold text-[#0A2B6D]">
                    {label}
                  </Label>
                  {inputKind === 'textarea' ? (
                    <Textarea
                      id={`personal-${key}`}
                      rows={2}
                      className="mt-1 border-[#0A2B6D]/50 text-xs font-medium text-[#0A2B6D]"
                      value={form[key] || ''}
                      onChange={(e) => onChange(key, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={`personal-${key}`}
                      className="mt-1 h-8 border-[#0A2B6D]/50 text-xs font-medium text-[#0A2B6D]"
                      value={form[key] || ''}
                      onChange={(e) => onChange(key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}