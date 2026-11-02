import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, ChevronDown } from 'lucide-react';
import { EMPLOYEE_FORM_DEFINITIONS } from '@/lib/employeeFormDefinitions';
import { legacyFormFields } from '@/lib/formQuestionModel';
import StaffProfileQuestionField from '@/components/profile/StaffProfileQuestionField';
import useStaffProfileQuestions from '@/components/profile/useStaffProfileQuestions';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
};

export default function StaffProfileQuestionForm({ profile, title }) {
  const { answers, loading, ready, saving, error, saved, change, save, retry } =
    useStaffProfileQuestions(profile, title);
  const fields = EMPLOYEE_FORM_DEFINITIONS[title].fields;
  return (
    <details
      data-profile-half
      className="min-w-0 rounded-xl p-2.5 shadow-2xs"
      style={GRADIENT_BORDER_STYLE}
    >
      <summary
        className="app-section-card-header flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
      >
        <span className="flex min-w-0 items-center gap-1.5 text-[#0A2B6D]">
          <span style={{ color: '#0072FF' }}>◉</span>
          <span className="font-extrabold text-[#0A2B6D]">{title}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
      </summary>
      <div className="mt-2">
        {loading ? (
          <p role="status" className="flex items-center gap-2 text-xs font-bold text-[#0A2B6D]">
            <Loader2 className="h-4 w-4 animate-spin text-[#0072FF]" />
            Loading answers…
          </p>
        ) : (
          <>
            {error && (
              <p role="alert" className="mb-2 text-xs text-destructive">
                {error}
                {!ready && (
                  <Button variant="outline" size="sm" onClick={retry}>
                    Retry
                  </Button>
                )}
              </p>
            )}
            {ready && (
              <form onSubmit={save}>
                <fieldset
                  disabled={saving}
                  className="grid min-w-0 gap-x-2 gap-y-2 sm:grid-cols-2"
                >
                  {[...fields, ...legacyFormFields(fields, answers)].map((field) => (
                    <StaffProfileQuestionField
                      key={field.label}
                      field={field}
                      dateInputs
                      answers={answers}
                      onChange={change}
                    />
                  ))}
                </fieldset>
                <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                  {saved && (
                    <span role="status" className="text-xs font-bold text-[#0A2B6D]">
                      Answers saved
                    </span>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full px-3 text-[11px] font-extrabold text-[#0A2B6D]"
                    style={GRADIENT_BORDER_STYLE}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0072FF]" />
                    ) : (
                      <Save className="h-3.5 w-3.5 text-[#0072FF]" />
                    )}
                    Save answers
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </details>
  );
}