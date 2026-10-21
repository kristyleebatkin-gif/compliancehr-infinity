import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { EMPLOYEE_FORM_DEFINITIONS } from '@/lib/employeeFormDefinitions';
import { legacyFormFields } from '@/lib/formQuestionModel';
import StaffProfileQuestionField from '@/components/profile/StaffProfileQuestionField';
import useStaffProfileQuestions from '@/components/profile/useStaffProfileQuestions';
export default function StaffProfileQuestionForm({ profile, title }) {
  const { answers, loading, ready, saving, error, saved, change, save, retry } = useStaffProfileQuestions(profile, title);
  const fields = EMPLOYEE_FORM_DEFINITIONS[title].fields;
  return <details className="min-w-0 rounded-xl border border-border bg-card p-2">
    <summary className="cursor-pointer text-xs font-semibold">{title}</summary>
    <div className="mt-2">
    {loading ? <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading answers…</p> : <>
      {error && <p role="alert" className="mb-2 text-xs text-destructive">{error}{!ready && <Button variant="outline" size="sm" onClick={retry}>Retry</Button>}</p>}
      {ready && <form onSubmit={save}>
        <fieldset disabled={saving} className="grid min-w-0 gap-x-2 gap-y-2 sm:grid-cols-2">{[...fields, ...legacyFormFields(fields, answers)].map((field) => <StaffProfileQuestionField key={field.label} field={field} dateInputs answers={answers} onChange={change} />)}</fieldset>
        <div className="mt-2 flex flex-wrap items-center justify-end gap-2">{saved && <span role="status" className="text-xs text-safe">Answers saved</span>}<Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-[11px]" disabled={saving}>{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Save answers</Button></div>
      </form>}
    </>}
    </div>
  </details>;
}