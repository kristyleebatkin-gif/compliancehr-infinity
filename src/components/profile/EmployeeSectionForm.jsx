import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRole } from '@/lib/useRole';
import { EMPLOYEE_PROFILE_FORMS } from '@/lib/employeeProfileSectionDefinitions';
import { legacyFormFields, answerText } from '@/lib/formQuestionModel';
import useStaffProfileQuestions from '@/components/profile/useStaffProfileQuestions';
import StaffProfileQuestionField from '@/components/profile/StaffProfileQuestionField';
import EmployeeFormTable from '@/components/profile/EmployeeFormTable';
import JourneyDocuments from '@/components/profile/JourneyDocuments';
import profileRecordExport from '@/lib/profileRecordExport';

export default function EmployeeSectionForm({ profile, title }) {
  const definition = EMPLOYEE_PROFILE_FORMS[title];
  const state = useStaffProfileQuestions(profile, title, definition);
  const { user } = useRole();
  const [busy, setBusy] = useState(false), [exporting, setExporting] = useState(false), [error, setError] = useState(''), [dirty, setDirty] = useState(false);
  const editable = ['admin', 'Provider Administrator', 'Human Resources Manager', 'Administration'].includes(user?.role) || (!!profile.email && profile.email.toLowerCase() === user?.email?.toLowerCase());
  useEffect(() => { if (state.saved) setDirty(false); }, [state.saved]);
  const change = (key, value) => { state.change(key, value); setDirty(true); };
  const visibleAnswers = Object.fromEntries(Object.entries(state.answers).filter(([key]) => !key.startsWith('__')));
  const fields = [...definition.fields, ...legacyFormFields(definition.fields, visibleAnswers)];
  const download = async (format) => {
    setExporting(true); setError('');
    try {
      const rows = fields.map((field) => ({ field: field.label, value: answerText(state.answers[field.label]) }));
      for (const [index, row] of (state.answers.__rows || []).entries()) definition.columns.forEach((column, cell) => rows.push({ field: `Entry ${index + 1}: ${column}`, value: row[cell] }));
      rows.push({ field: 'Supporting documents', value: (state.answers.__documents || []).map((file) => file.name).join('; ') }, { field: 'Saved by', value: state.entry?.completed_by }, { field: 'Saved date', value: state.entry?.completed_date });
      await profileRecordExport(title, profile, rows, format);
    } catch (failure) { setError(failure.message); }
    finally { setExporting(false); }
  };
  if (state.loading) return <p role="status" className="text-xs">Loading saved form…</p>;
  if (!state.ready) return <p role="alert" className="text-xs text-destructive">{state.error}<Button type="button" size="sm" variant="outline" onClick={state.retry}>Retry</Button></p>;
  return <form onSubmit={state.save} className="min-w-0 space-y-2">
    <fieldset disabled={!editable || state.saving || busy || exporting} className="grid min-w-0 gap-2 sm:grid-cols-2">{fields.map((field) => <StaffProfileQuestionField key={field.label} field={field} dateInputs answers={state.answers} onChange={change} />)}</fieldset>
    {definition.columns && <fieldset disabled={state.saving || busy || exporting}><EmployeeFormTable columns={definition.columns} rows={state.answers.__rows || []} onChange={(rows) => change('__rows', rows)} readOnly={!editable} /></fieldset>}
    <fieldset disabled={state.saving || exporting}><JourneyDocuments documents={state.answers.__documents || []} onChange={(documents) => change('__documents', documents)} readOnly={!editable} onBusy={setBusy} /></fieldset>
    <div className="flex flex-wrap items-center gap-1">{editable && <Button type="submit" variant="outline" size="sm" disabled={state.saving || busy || exporting}>{state.saving ? 'Saving…' : 'Save form'}</Button>}{['pdf', 'csv'].map((format) => <Button type="button" key={format} variant="outline" size="sm" disabled={!state.entry || dirty || busy || state.saving || exporting} onClick={() => download(format)}>Export {format.toUpperCase()}</Button>)}{state.saved && <span role="status" className="text-xs text-safe">Saved</span>}</div>
    {dirty && <p className="text-[11px] text-muted-foreground">Unsaved changes. Save before exporting.</p>}
    {state.entry && <p className="text-[11px] text-muted-foreground">Saved by {state.entry.completed_by || 'Not recorded'} · {state.entry.completed_date || 'Not recorded'}</p>}
    {(state.error || error) && <p role="alert" className="text-xs text-destructive">{state.error || error}</p>}
  </form>;
}