import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, CheckCircle2, Briefcase, Heart, ShieldCheck } from 'lucide-react';

const APP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const HEADING_TEXT_GRADIENT =
  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

const APP_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

export default function PersonalProfileForm({
  kind = 'staff',
  fields,
  form,
  onChange,
  onSave,
  saving,
  saved,
  readOnly = false,
}) {
  if (readOnly) {
    return (
      <p className="rounded-xl border-2 border-[#0072FF] bg-white p-3 text-xs font-bold text-[#0A2B6D]">
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
      {/* Main Header Inside White Section: App Design Coloured Border + White Background + Dark Blue -> App Colour Writing */}
      <div
        className="rounded-2xl p-[2px] shadow-2xs"
        style={{ background: APP_BORDER_GRADIENT }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-white px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-[#0072FF] bg-white">
              {isStaff ? (
                <Briefcase className="h-4 w-4 text-[#0072FF]" />
              ) : (
                <Heart className="h-4 w-4 text-[#FF2E9A]" />
              )}
            </span>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                {isStaff
                  ? 'Employee Profession & Sectioned Profile Editor'
                  : 'Participant NDIS Profile & Sectioned Details Editor'}
              </div>
              <h3
                className="text-xs sm:text-sm font-extrabold bg-clip-text text-transparent"
                style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
              >
                ◉{' '}
                {isStaff
                  ? 'Update My Profession, Contact, Emergency & Payroll Sections'
                  : 'Update My Participant Profile, NDIS Support, Emergency & Preferences Sections'}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#0072FF] bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0072FF]" /> Updated in Profile Sections
              </span>
            )}
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="rounded-full px-3.5 text-xs font-extrabold text-white"
              style={{ background: APP_BORDER_GRADIENT }}
            >
              <Save className="h-3.5 w-3.5 text-white" />
              {saving ? 'Saving to sections…' : 'Save All Profile Sections'}
            </Button>
          </div>
        </div>
      </div>

      {/* Each Profile Section Boxed with an App Design Coloured Border, and Each Item Boxed Inside on White */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Object.entries(grouped).map(([sectionName, sectionFields], sIdx) => {
          const secColor = APP_COLOURS[sIdx % APP_COLOURS.length];
          return (
            <div
              key={sectionName}
              className="profile-dark-blue-box flex flex-col justify-between overflow-hidden rounded-2xl p-[2px] shadow-sm"
              style={{ background: APP_BORDER_GRADIENT }}
            >
              <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-[14px] bg-white">
                {/* Section Header on White with App Design Coloured Border Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#5A00D6]/20 bg-white px-3 py-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-xs font-extrabold"
                    style={{ border: `2px solid ${secColor}` }}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" style={{ color: secColor }} />
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                    >
                      Section: {sectionName}
                    </span>
                  </span>
                  <span
                    className="rounded-full bg-white px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]"
                    style={{ border: `1.5px solid ${secColor}`, color: '#0A2B6D' }}
                  >
                    <span style={{ color: secColor }}>◉</span> Auto-Syncs to {sectionName}
                  </span>
                </div>

                <div className="grid gap-2 p-2.5 sm:grid-cols-2 bg-white">
                  {sectionFields.map(([key, label, inputKind], fIdx) => {
                    const fldColor = APP_COLOURS[(sIdx + fIdx) % APP_COLOURS.length];
                    return (
                      <div
                        key={key}
                        className={`profile-item-box rounded-xl bg-white p-2.5 ${
                          inputKind === 'textarea' ? 'sm:col-span-2' : ''
                        }`}
                        style={{ border: `2px solid ${fldColor}` }}
                      >
                        <Label
                          htmlFor={`personal-${key}`}
                          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          <span style={{ color: fldColor }}>◉</span> {label}
                        </Label>
                        {inputKind === 'textarea' ? (
                          <Textarea
                            id={`personal-${key}`}
                            rows={2}
                            className="mt-1 border-2 border-[#5A00D6]/40 bg-white text-xs font-semibold text-[#0A2B6D]"
                            value={form[key] || ''}
                            onChange={(e) => onChange(key, e.target.value)}
                          />
                        ) : (
                          <Input
                            id={`personal-${key}`}
                            className="mt-1 h-8 border-2 border-[#0072FF]/45 bg-white text-xs font-semibold text-[#0A2B6D]"
                            value={form[key] || ''}
                            onChange={(e) => onChange(key, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}