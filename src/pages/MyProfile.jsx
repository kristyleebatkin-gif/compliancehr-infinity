import React, { useState, useEffect, useCallback, useRef } from 'react';
import useSubjectPastels from '@/components/profile/useSubjectPastels';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { syncEmployeeRecord } from '@/lib/employeeRecordBridge';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import SoftwareAndSafeBanner from '@/components/safe/SoftwareAndSafeBanner';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import PersonalProfileForm from '@/components/profile/PersonalProfileForm';
import OurProfileWorkspace from '@/components/profile/OurProfileWorkspace';
import OurProfileData from '@/components/profile/OurProfileData';
import PersonalProfileHeader from '@/components/profile/PersonalProfileHeader';
import loadPersonalProfile from '@/lib/loadPersonalProfile';
import { useAuth } from '@/lib/AuthContext';
import { loadProfileWithTimeout } from '@/lib/profileLoading';
import ProfileLoadError from '@/components/profile/ProfileLoadError';
import '@/components/profile/myProfilePastels.css';

import StaffHome from '@/pages/StaffHome';
import MyDocuments from '@/pages/MyDocuments';
import NameTags from '@/pages/NameTags';
import MyWorkArea9Panel from '@/components/profile/MyWorkArea9Panel';

import { useQueryClient } from '@tanstack/react-query';
import { logUserAction } from '@/lib/actionLog';
import { UserRound, BriefcaseBusiness } from 'lucide-react';

const STAFF_FIELDS = [
  ['position', 'Profession / Position Title', 'input', 'Profession, Role & Qualifications'],
  ['position_level', 'Classification / Level', 'input', 'Profession, Role & Qualifications'],
  ['skills', 'Skills & Qualifications', 'textarea', 'Profession, Role & Qualifications'],
  ['phone', 'Phone', 'input', 'Personal Contact & Address'],
  ['address', 'Home Address', 'input', 'Personal Contact & Address'],
  ['emergency_contact', 'Emergency Contact Name', 'input', 'Emergency Contact Information'],
  ['emergency_contact_phone', 'Emergency Contact Phone', 'input', 'Emergency Contact Information'],
  ['car_rego', 'Car Registration (Rego)', 'input', 'Payroll, Banking & Vehicle'],
  ['banking_details', 'Banking Details (BSB, Account, Name)', 'textarea', 'Payroll, Banking & Vehicle'],
  ['superannuation_details', 'Superannuation Details', 'textarea', 'Payroll, Banking & Vehicle'],
  ['about_me', 'About Me', 'textarea', 'About Me & Personal Summary'],
];

const PARTICIPANT_FIELDS = [
  ['support_type', 'Type of Support Provided', 'input', 'NDIS Plan & Support Details'],
  ['ndis_number', 'NDIS Number', 'input', 'NDIS Plan & Support Details'],
  ['plan_manager', 'Plan Manager', 'input', 'NDIS Plan & Support Details'],
  ['support_coordinator', 'Support Coordinator', 'input', 'NDIS Plan & Support Details'],
  ['phone', 'Phone', 'input', 'Participant Contact & Address'],
  ['address', 'Home Address', 'input', 'Participant Contact & Address'],
  ['emergency_contact', 'Emergency Contact Name', 'input', 'Emergency Contact & Advocate'],
  ['emergency_contact_phone', 'Emergency Contact Phone', 'input', 'Emergency Contact & Advocate'],
  ['advocate_representative', 'Advocate / Representative', 'input', 'Emergency Contact & Advocate'],
  ['routine', 'Daily Routine & Support Preferences', 'textarea', 'Preferences, Routine & About Me'],
  ['likes', 'Likes & Interests', 'textarea', 'Preferences, Routine & About Me'],
  ['dislikes', 'Dislikes & Triggers to Avoid', 'textarea', 'Preferences, Routine & About Me'],
  ['about_me', 'About Me', 'textarea', 'Preferences, Routine & About Me'],
];

export default function MyProfile() {
  const { user: account } = useAuth();
  const queryClient = useQueryClient();
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
  const pageRef = useRef(null);
  useSubjectPastels(pageRef, loading);

  const tab = searchParams.get('tab') || 'details';
  const setTab = (value) => setSearchParams(value === 'details' ? {} : { tab: value }, { replace: true });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { user, prof, pProf } = await loadProfileWithTimeout(() => loadPersonalProfile(account));
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
  }, [account?.id, account?.email, account?.role, account?.full_name]);

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
      if (entityName === 'StaffProfile') await syncEmployeeRecord('StaffProfile', record.id, labels.filter(([key]) => (formData[key] || '') !== (record[key] || '')).map(([key]) => key));
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
      queryClient.invalidateQueries();
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
    <div ref={pageRef} className="my-profile-pastels mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 space-y-5">
      <PageHeader
        className="my-profile-heading"
        icon={UserRound}
        title={tab === 'participant-details' ? 'My participant profile' : isParticipant ? 'My participant profile' : 'My employee profile'}
        subtitle={tab === 'participant-details' ? 'Your participant profile, documents and support in one place.' : isParticipant ? 'Your profile, work, documents and support in one place.' : 'Your profile, work, documents and name tag in one place.'}
        showAlerts={false}
      />
      <MyWorkArea9Panel />
      {!isParticipant && participantProfile && <nav data-dashboard-tabs="" aria-label="My profile views" className="flex flex-wrap gap-2">
        <Button data-dashboard-tab="" data-dashboard-tone="blue" aria-pressed={tab !== 'participant-details'} variant={tab === 'participant-details' ? 'outline' : 'secondary'} onClick={() => setTab('details')}>My Employee Profile &amp; Profession</Button>
        <Button data-dashboard-tab="" data-dashboard-tone="pink" aria-pressed={tab === 'participant-details'} variant={tab === 'participant-details' ? 'secondary' : 'outline'} onClick={() => setTab('participant-details')}>My Participant Profile &amp; NDIS Plan</Button>
      </nav>}
      {loadError ? <ProfileLoadError error={loadError} onRetry={load} /> : !(tab === 'participant-details' ? participantProfile : profile) ? <EmptyState icon={UserRound} title="Profile not set up yet" message={isParticipant ? 'Your support team will set up your profile, then you can view and edit it here.' : 'Ask HR to create your staff profile, then you can view and edit it here.'} /> : (() => {
        const secondary = tab === 'participant-details' && participantProfile;
        const person = secondary || profile;
        const kind = (secondary || isParticipant) ? 'participant' : 'staff';
        const formBlock = (
          <PersonalProfileForm
            kind={kind}
            fields={secondary ? PARTICIPANT_FIELDS : fields}
            form={secondary ? participantForm : form}
            onChange={secondary ? setParticipantField : setField}
            onSave={secondary ? saveParticipant : save}
            saving={saving}
            saved={saved}
            readOnly={!!secondary && !canEditParticipant}
          />
        );
        return <OurProfileWorkspace key={person.id} profile={person} kind={kind} onUpdated={load} ourView={false} personal
          header={<PersonalProfileHeader profile={person} kind={kind} showIdentity={true} topFormSection={formBlock} onUpdated={(updated) => {
            if (secondary) { setParticipantProfile(updated); setParticipantForm((current) => ({ ...current, about_me: updated.about_me || '' })); }
            else { setProfile(updated); setForm((current) => ({ ...current, about_me: updated.about_me || '' })); }
            load();
          }} />}
          details={<OurProfileData personal profile={person} kind={kind} initialTab={tab === 'forms' ? 'forms' : 'details'} detailsContent={formBlock} />}
          moduleOverrides={{ documents: <MyDocuments embedded />, 'name-tag': <NameTags embedded /> }}
          extraModules={[{ key: 'work', label: 'My Work', Icon: BriefcaseBusiness, content: <StaffHome embedded /> }]}
        />;
      })()}
      <SoftwareAndSafeBanner compact />
    </div>
  );
}