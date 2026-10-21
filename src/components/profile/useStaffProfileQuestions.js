import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { EMPLOYEE_FORM_DEFINITIONS } from '@/lib/employeeFormDefinitions';
import { preparePersonalProfileAccess } from '@/lib/personalProfileAccess';
export default function useStaffProfileQuestions(profile, title, definitionOverride) {
  const definition = definitionOverride || EMPLOYEE_FORM_DEFINITIONS[title];
  const [answers, setAnswers] = useState({}), [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [error, setError] = useState(''), [saved, setSaved] = useState(false), [ready, setReady] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(''); setReady(false);
    try {
      if (definitionOverride) {
        const user = await base44.auth.me();
        if (profile.email && profile.email.toLowerCase() === user.email?.toLowerCase()) await preparePersonalProfileAccess();
      }
      const [entries, submissions] = await Promise.all([
        base44.entities.StaffFormEntry.filter({ staff_id: profile.id, form_type: title }, { sort: '-updated_date', limit: 1 }),
        base44.entities.FormSubmission.filter({ employee_id: profile.id, form_title: title, online_document: true }, { sort: '-updated_date', limit: 1 }),
      ]);
      const existing = entries.items[0] || null;
      const defaults = { 'Employee full name': profile.full_name || '', 'Date of birth': profile.date_of_birth || '', 'Residential address': profile.address || '', Phone: profile.phone || '', Email: profile.email || '', 'Emergency contact 1 name': profile.emergency_contact || '', 'Emergency contact 1 phone': profile.emergency_contact_phone || '', 'Employee ID number': profile.employee_number || '', Position: profile.position || '', 'Position title': profile.position || '', 'Employee role': profile.role || '', 'Commencement date': profile.start_date || '', 'Supervisor name': profile.supervisor || '', 'Rego number': profile.car_rego || '', 'Qualifications and certificates': profile.skills || '' };
      const onlineAnswers = submissions.items[0]?.data ? JSON.parse(submissions.items[0].data).answers || {} : {};
      const known = Object.fromEntries(definition.fields.filter((field) => defaults[field.label] !== undefined).map((field) => [field.label, defaults[field.label]]));
      setAnswers({ ...known, ...onlineAnswers, ...(existing?.answers ? JSON.parse(existing.answers) : {}) });
      setEntry(existing); setReady(true);
    } catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }, [profile.id, title, definition]);
  useEffect(() => { load(); }, [load]);
  const change = (label, value) => { setAnswers((current) => ({ ...current, [label]: value })); setSaved(false); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setSaved(false);
    try {
      const user = await base44.auth.me();
      const payload = { staff_name: profile.full_name, form_code: definition.code || (title === 'Staff Information Form' ? 'CM-FORM-004' : title === 'Staff Onboarding Form' ? 'CM-FORM-005' : title), answers: JSON.stringify(answers), completed_by: user.full_name || user.email, completed_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' }) };
      if (payload.answers.length > 100000) throw new Error('Please shorten long answers before saving.');
      const record = entry ? await base44.entities.StaffFormEntry.update(entry.id, payload) : await base44.entities.StaffFormEntry.create({ ...payload, staff_id: profile.id, form_type: title });
      setEntry({ ...entry, ...payload, ...record }); setSaved(true);
      if (["Driver's Licence Details", 'Car Registration Details', 'Medicare Card Details'].includes(title) && profile.email?.toLowerCase() === user.email?.toLowerCase()) await base44.functions.invoke('profileIdentityExpiryReminders', {});
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  return { answers, entry, loading, ready, saving, error, saved, change, save, retry: load };
}