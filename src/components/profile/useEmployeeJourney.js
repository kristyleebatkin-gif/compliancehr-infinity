import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { preparePersonalProfileAccess } from '@/lib/personalProfileAccess';

export const journeyMilestone = (type = 'Training') => ({ id: crypto.randomUUID(), type, title: '', planned_date: '', completed_date: '', next_due_date: '', responsible: '', notes: '', report: '', documents: [] });
/* Workplace cycle every staff journey documents: intake, induction, buddy
   shift, training, more buddy shift — then the cycle repeats with more steps. */
export const JOURNEY_CYCLE = ['Intake', 'Induction', 'Buddy shift', 'Training', 'More buddy shift'];

export default function useEmployeeJourney(profile, onUpdated) {
  const { user } = useRole();
  const [entry, setEntry] = useState(null), [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  const ownProfile = !!profile.email && profile.email.toLowerCase() === user?.email?.toLowerCase();
  const [dirty, setDirty] = useState(false);
  const canEdit = ['admin', 'Provider Administrator', 'Human Resources Manager', 'Administration'].includes(user?.role) || ownProfile;
  const canEditDates = ['admin', 'Provider Administrator', 'Human Resources Manager'].includes(user?.role) || (!!profile.email && profile.email.toLowerCase() === user?.email?.toLowerCase());
  const load = useCallback(async () => {
    setLoading(true); setError(''); setValue(null); setSaved(false); setDirty(false);
    try {
      if (ownProfile) await preparePersonalProfileAccess();
      const page = await base44.entities.StaffFormEntry.filter({ staff_id: profile.id, form_type: 'Employee Journey' }, { sort: '-updated_date', limit: 1 });
      const record = page.items[0] || null;
      const data = record?.answers ? JSON.parse(record.answers) : {};
      setEntry(record);
      const milestones = data.milestones?.length ? [...data.milestones] : JOURNEY_CYCLE.map((type) => journeyMilestone(type));
      const seen = new Set(milestones.map((item) => item.type));
      for (const type of JOURNEY_CYCLE) if (!seen.has(type)) milestones.push(journeyMilestone(type));
      setValue({ start_date: profile.start_date || '', induction_date: profile.induction_date || '', milestones });
    } catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }, [profile.id, ownProfile]);
  useEffect(() => { load(); }, [load]);
  const change = (next) => { setValue(next); setSaved(false); setDirty(true); };
  const save = async (event) => {
    event.preventDefault(); if (!canEdit) return; setSaving(true); setError(''); setSaved(false);
    try {
      const answers = JSON.stringify({ milestones: value.milestones });
      if (answers.length > 90000) throw new Error('Please shorten the journey notes before saving.');
      let updated = profile;
      if (canEditDates && (value.start_date !== (profile.start_date || '') || value.induction_date !== (profile.induction_date || ''))) updated = { ...profile, ...await base44.entities.StaffProfile.update(profile.id, { start_date: value.start_date || null, induction_date: value.induction_date || null }) };
      const payload = { staff_name: profile.full_name, form_code: 'EMPLOYEE-JOURNEY', answers, completed_by: user.full_name || user.email, completed_date: new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' }) };
      const record = entry ? await base44.entities.StaffFormEntry.update(entry.id, payload) : await base44.entities.StaffFormEntry.create({ ...payload, staff_id: profile.id, form_type: 'Employee Journey' });
      setEntry({ ...entry, ...payload, ...record }); setSaved(true); setDirty(false);
      if (updated !== profile) await onUpdated?.(updated);
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  return { entry, value, loading, saving, error, saved, dirty, canEdit, canEditDates, change, save, retry: load };
}