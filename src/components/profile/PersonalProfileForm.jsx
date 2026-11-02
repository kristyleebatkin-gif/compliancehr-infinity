import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, CheckCircle2, Briefcase, Heart, ShieldCheck } from 'lucide-react';

const APP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
  color: '#0A2B6D',
};

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
      <p
        className="rounded-xl p-3 text-xs font-bold text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
      >
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
      {/* Main Header Inside White Section: App Design Coloured Gradient Border + White Background + Dark Blue Writing */}
      <div
        className="rounded-2xl p-[2px] shadow-2xs"
        style={{ background: APP_BORDER_GRADIENT }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-white px-3.5 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={GRADIENT_BORDER_STYLE}
            >
              {isStaff ? (
                <Briefcase className="h-4 w-4 text-[#0072FF]" />
              ) : (
                <Heart className="h-4 w-4 text-[#FF2E9A]" />
              )}
            </span>
            <div className="flex flex-col items-start gap-1">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]"
                style={GRADIENT_BORDER_STYLE}
              >
                <span style={{ color: '#5A00D6' }}>◉</span>
                {isStaff
                  ? 'Employee Profession & Sectioned Profile Editor'
                  : 'Participant NDIS Profile & Sectioned Details Editor'}
              </span>
              <h3
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs sm:text-sm font-extrabold text-[#0A2B6D]"
                style={GRADIENT_BORDER_STYLE}
              >
                <span style={{ color: '#0072FF' }}>◉</span>
                <span>
                  {isStaff
                    ? 'Update My Profession, Contact, Emergency & Payroll Sections'
                    : 'Update My Participant Profile, NDIS Support, Emergency & Preferences Sections'}
                </span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]"
                style={GRADIENT_BORDER_STYLE}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0072FF]" /> Updated in Profile Sections
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onSave}
              disabled={saving}
              className="rounded-full px-3.5 text-xs font-extrabold text-[#0A2B6D]"
              style={GRADIENT_BORDER_STYLE}
            >
              <Save className="h-3.5 w-3.5 text-[#0072FF]" />
              <span style={{ color: '#0A2B6D' }}>
                {saving ? 'Saving to sections…' : 'Save All Profile Sections'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Each Profile Section Boxed with an App Design Coloured Gradient Border, and Each Heading/Word/Item Boxed Inside on White */}
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
                {/* Section Header on White with App Design Coloured Gradient Border Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 pt-2.5 pb-1">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]"
                    style={GRADIENT_BORDER_STYLE}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" style={{ color: secColor }} />
                    <span style={{ color: '#0A2B6D' }}>Section: {sectionName}</span>
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]"
                    style={GRADIENT_BORDER_STYLE}
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
                        className={`profile-item-box rounded-xl p-2.5 ${
                          inputKind === 'textarea' ? 'sm:col-span-2' : ''
                        }`}
                        style={GRADIENT_BORDER_STYLE}
                      >
                        <Label
                          htmlFor={`personal-${key}`}
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-[#0A2B6D]"
                          style={GRADIENT_BORDER_STYLE}
                        >
                          <span style={{ color: fldColor }}>◉</span> {label}
                        </Label>
                        {inputKind === 'textarea' ? (
                          <Textarea
                            id={`personal-${key}`}
                            rows={2}
                            className="mt-1.5 text-xs font-semibold text-[#0A2B6D]"
                            style={GRADIENT_BORDER_STYLE}
                            value={form[key] || ''}
                            onChange={(e) => onChange(key, e.target.value)}
                          />
                        ) : (
                          <Input
                            id={`personal-${key}`}
                            className="mt-1.5 h-8 text-xs font-semibold text-[#0A2B6D]"
                            style={GRADIENT_BORDER_STYLE}
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