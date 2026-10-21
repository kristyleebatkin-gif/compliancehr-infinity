import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import PersonalProfileForm from '@/components/profile/PersonalProfileForm';
import OurProfileWorkspace from '@/components/profile/OurProfileWorkspace';
import OurProfileData from '@/components/profile/OurProfileData';
import PersonalProfileHeader from '@/components/profile/PersonalProfileHeader';
import { preparePersonalProfileAccess } from '@/lib/personalProfileAccess';
import { loadProfileWithTimeout } from '@/lib/profileLoading';
import ProfileLoadError from '@/components/profile/ProfileLoadError';

import StaffHome from '@/pages/StaffHome';
import MyDocuments from '@/pages/MyDocuments';
import NameTags from '@/pages/NameTags';

import { logUserAction } from '@/lib/actionLog';
import { UserRound, BriefcaseBusiness } from 'lucide-react';

const STAFF_FIELDS = [
  ['phone', 'Phone', 'input'],
  ['address', 'Address', 'input'],
  ['emergency_contact', 'Emergency Contact', 'input'],
  ['emergency_contact_phone', 'Emergency Contact Phone', 'input'],
  ['car_rego', 'Car Registration (Rego)', 'input'],
  ['banking_details', 'Banking Details (BSB, Account, Name)', 'textarea'],
  ['superannuation_details', 'Superannuation Details', 'textarea'],
  ['about_me', 'About Me', 'textarea'],
  ['skills', 'Skills & Qualifications', 'textarea'],
];

const PARTICIPANT_FIELDS = [
  ['phone', 'Phone', 'input'],
  ['address', 'Address', 'input'],
  ['emergency_contact', 'Emergency Contact', 'input'],
  ['emergency_contact_phone', 'Emergency Contact Phone', 'input'],
  ['about_me', 'About Me', 'textarea'],
  ['likes', 'Likes', 'textarea'],
  ['dislikes', 'Dislikes', 'textarea'],
];

export default function MyProfile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [participantProfile, setParticipantProfile] = useState(null);
  const [form, setForm] = useState({});
  const [participantForm, setParticipantForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tab = searchParams.get('tab') || 'details';
  const setTab = (value) => setSearchParams(value === 'details' ? {} : { tab: value }, { replace: true });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { user, prof, pProf } = await loadProfileWithTimeout(async () => {
        await preparePersonalProfileAccess();
        const user = await base44.auth.me();
        if (!user?.email) throw new Error('Your account could not be loaded. Please sign in again.');
        const participant = user.role === 'Participant';
        const entity = participant ? base44.entities.ParticipantProfile : base44.entities.StaffProfile;
        const [page, participantPage] = await Promise.all([
          entity.filter({ email: user.email }, { limit: 1 }),
          participant ? Promise.resolve({ items: [] }) : base44.entities.ParticipantProfile.filter({ email: user.email }, { limit: 1 }),
        ]);
        return { user, prof: page.items?.[0] || null, pProf: participantPage.items?.[0] || null };
      });
      setMe(user);
      setProfile(prof);
      setParticipantProfile(pProf);
      const initial = {};
      (user.role === 'Participant' ? PARTICIPANT_FIELDS : STAFF_FIELDS).forEach(([key]) => { initial[key] = prof?.[key] || ''; });
      setForm(initial);
      const pInitial = {};
      PARTICIPANT_FIELDS.forEach(([key]) => { pInitial[key] = pProf?.[key] || ''; });
      setParticipantForm(pInitial);
    } catch (error) {
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isParticipant = me?.role === 'Participant';
  const fields = isParticipant ? PARTICIPANT_FIELDS : STAFF_FIELDS;
  const canEditParticipant = isParticipant || ['admin', 'Provider Administrator', 'Administration', 'Team Leader'].includes(me?.role);
  const setField = (key, value) => { setForm((f) => ({ ...f, [key]: value })); setSaved(false); };
  const setParticipantField = (key, value) => { setParticipantForm((f) => ({ ...f, [key]: value })); setSaved(false); };

  // Self-service save: writes the edited fields straight to the profile record
  // and appends a timestamped change-log line so managers' records stay in sync.
  const saveProfile = async (entityName, record, formData) => {
    setSaving(true);
    try {
      const labels = entityName === 'ParticipantProfile' ? PARTICIPANT_FIELDS : STAFF_FIELDS;
      const changed = labels
        .filter(([key]) => (formData[key] || '') !== (record[key] || ''))
        .map(([, label]) => label);
      const entry = changed.length
        ? `${format(new Date(), 'd MMM yyyy HH:mm')} - ${(me?.full_name || me?.email || 'Self-service')} (self-service) updated: ${changed.join(', ')}`
        : null;
      const change_log = entry ? [record.change_log, entry].filter(Boolean).join('\n') : record.change_log;
      await base44.entities[entityName].update(record.id, { ...formData, change_log });
      if (entry) {
        await logUserAction('Profile Updated', entityName, {
          record_id: record.id,
          record_title: record.full_name,
          details: `Self-service edit: ${changed.join(', ')}`,
          person: { profile_type: entityName === 'ParticipantProfile' ? 'participant' : 'employee', profile_id: record.id },
        });
      }
      setSaved(true);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    if (!profile) return;
    return saveProfile(isParticipant ? 'ParticipantProfile' : 'StaffProfile', profile, form);
  };

  const saveParticipant = () => {
    if (!participantProfile) return;
    return saveProfile('ParticipantProfile', participantProfile, participantForm);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-3 md:p-5">
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-3 md:p-5 space-y-4">
      <PageHeader
        icon={UserRound}
        title={tab === 'participant-details' ? 'My participant profile' : isParticipant ? 'My participant profile' : 'My employee profile'}
        subtitle={tab === 'participant-details' ? 'Your participant profile, documents and support in one place.' : isParticipant ? 'Your profile, work, documents and support in one place.' : 'Your profile, work, documents and name tag in one place.'}
        showAlerts={false} showCompliance={false} showAudit={false}
      />

      {!isParticipant && participantProfile && <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'participant-details' ? 'outline' : 'secondary'} onClick={() => setTab('details')}>My employee profile</Button>
        <Button variant={tab === 'participant-details' ? 'secondary' : 'outline'} onClick={() => setTab('participant-details')}>My participant profile</Button>
      </div>}
      {loadError ? <ProfileLoadError error={loadError} onRetry={load} /> : !(tab === 'participant-details' ? participantProfile : profile) ? <EmptyState icon={UserRound} title="Profile not set up yet" message={isParticipant ? 'Your support team will set up your profile, then you can view and edit it here.' : 'Ask HR to create your staff profile, then you can view and edit it here.'} /> : (() => {
        const secondary = tab === 'participant-details' && participantProfile;
        const person = secondary || profile;
        const kind = secondary || isParticipant ? 'participant' : 'staff';
        return <OurProfileWorkspace key={person.id} profile={person} kind={kind} onUpdated={load} ourView={false} personal
          header={<PersonalProfileHeader profile={person} kind={kind} showIdentity={kind !== 'staff'} />}
          details={<OurProfileData profile={person} kind={kind} initialTab={tab === 'forms' ? 'forms' : 'details'} detailsContent={<PersonalProfileForm fields={secondary ? PARTICIPANT_FIELDS : fields} form={secondary ? participantForm : form} onChange={secondary ? setParticipantField : setField} onSave={secondary ? saveParticipant : save} saving={saving} saved={saved} readOnly={!!secondary && !canEditParticipant} />} />}
          moduleOverrides={{ documents: <MyDocuments embedded />, 'name-tag': <NameTags embedded /> }}
          extraModules={[{ key: 'work', label: 'My Work', Icon: BriefcaseBusiness, content: <StaffHome embedded /> }]}
        />;
      })()}
    </div>
  );
}