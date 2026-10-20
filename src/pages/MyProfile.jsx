import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StaffHome from '@/pages/StaffHome';
import MyDocuments from '@/pages/MyDocuments';
import NameTags from '@/pages/NameTags';
import StaffFillableForms from '@/components/staff/StaffFillableForms';
import ParticipantFillableForms from '@/components/participants/ParticipantFillableForms';
import { logUserAction } from '@/lib/actionLog';
import MyProfileHero from '@/components/profile/MyProfileHero';
import { UserRound, Save, CheckCircle2, History } from 'lucide-react';

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tab = searchParams.get('tab') || 'details';
  const setTab = (value) => setSearchParams(value === 'details' ? {} : { tab: value }, { replace: true });

  const load = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      setMe(user);
      const isParticipant = user.role === 'Participant';
      if (!isParticipant) {
        try {
          const pPage = await base44.entities.ParticipantProfile.filter({ email: user.email }, { limit: 1 });
          const pProf = (pPage.items || [])[0] || null;
          setParticipantProfile(pProf);
          if (pProf) {
            const pInitial = {};
            PARTICIPANT_FIELDS.forEach(([key]) => { pInitial[key] = pProf[key] || ''; });
            setParticipantForm(pInitial);
          }
        } catch (e) { console.error(e); }
      }
      const entity = isParticipant ? base44.entities.ParticipantProfile : base44.entities.StaffProfile;
      const page = await entity.filter({ email: user.email }, { limit: 1 });
      const prof = (page.items || [])[0] || null;
      setProfile(prof);
      if (prof) {
        const fields = isParticipant ? PARTICIPANT_FIELDS : STAFF_FIELDS;
        const initial = {};
        fields.forEach(([key]) => { initial[key] = prof[key] || ''; });
        setForm(initial);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
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
    <div className="mx-auto max-w-5xl p-3 md:p-4 space-y-3.5">
      <PageHeader
        icon={UserRound}
        title={tab === 'participant-details' ? 'My participant profile' : isParticipant ? 'My participant profile' : 'My employee profile'}
        subtitle={tab === 'participant-details' ? 'Your participant profile, documents and support in one place.' : isParticipant ? 'Your profile, work, documents and support in one place.' : 'Your profile, work, documents and name tag in one place.'}
        showAlerts={false} showCompliance={false} showAudit={false}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="details">{isParticipant ? 'My participant profile' : 'My employee profile'}</TabsTrigger>
          {!isParticipant && participantProfile && <TabsTrigger value="participant-details">My participant profile</TabsTrigger>}
          {profile && <TabsTrigger value="forms">Fillable Forms</TabsTrigger>}
          <TabsTrigger value="work">My Work</TabsTrigger>
          <TabsTrigger value="documents">My Documents</TabsTrigger>
          {!isParticipant && <TabsTrigger value="name-tags">Name Tags</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="mt-3 space-y-4">
          {!profile ? (
            <EmptyState icon={UserRound} title="Profile not set up yet" message={isParticipant ? 'Your support team will set up your profile, then you can view and edit it here.' : 'Ask HR to create your staff profile, then you can view and edit it here.'} />
          ) : (
            <>
              <MyProfileHero
                record={profile}
                isParticipant={isParticipant}
                hint="Only you and management can see this page. Fields below are yours to keep up to date."
              />

              <Card className="border-border/60">
                <CardContent className="p-4 space-y-3.5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fields.map(([key, label, kind]) => (
                      <div key={key} className={kind === 'textarea' ? 'sm:col-span-2' : ''}>
                        <Label>{label}</Label>
                        {kind === 'textarea' ? (
                          <Textarea rows={3} value={form[key] || ''} onChange={(e) => setField(key, e.target.value)} />
                        ) : (
                          <Input value={form[key] || ''} onChange={(e) => setField(key, e.target.value)} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={save} disabled={saving} className="gap-2">
                      <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save changes'}
                    </Button>
                    {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-safe"><CheckCircle2 className="h-4 w-4" />Saved</span>}
                  </div>
                </CardContent>
              </Card>

              {profile.change_log && (
                <Card className="border-border/60">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4 text-brand" />Activity log</div>
                    <p className="text-xs text-foreground/50">Actions recorded on this profile, latest first.</p>
                    <div className="space-y-2 border-l-2 border-brand/20 pl-4">
                      {profile.change_log.split('\n').filter(Boolean).slice(-12).reverse().map((line, i) => (
                        <div key={i} className="relative rounded-lg bg-muted/30 px-3 py-2 text-xs text-foreground/70 before:absolute before:-left-[22px] before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-brand/40">{line}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {!isParticipant && participantProfile && (
          <TabsContent value="participant-details" className="mt-3 space-y-4">
            <MyProfileHero
              record={participantProfile}
              isParticipant
              hint={canEditParticipant ? undefined : 'Read-only view. Support team and management can make updates.'}
            />
            <ParticipantFillableForms participant={participantProfile} />
            {canEditParticipant && (
              <Card className="border-border/60">
                <CardContent className="p-4 space-y-3.5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PARTICIPANT_FIELDS.map(([key, label, kind]) => (
                      <div key={key} className={kind === 'textarea' ? 'sm:col-span-2' : ''}>
                        <Label>{label}</Label>
                        {kind === 'textarea' ? (
                          <Textarea rows={3} value={participantForm[key] || ''} onChange={(e) => setParticipantField(key, e.target.value)} />
                        ) : (
                          <Input value={participantForm[key] || ''} onChange={(e) => setParticipantField(key, e.target.value)} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={saveParticipant} disabled={saving} className="gap-2">
                      <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save changes'}
                    </Button>
                    {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-safe"><CheckCircle2 className="h-4 w-4" />Saved</span>}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        <TabsContent value="forms" className="mt-3">
          {isParticipant
            ? <ParticipantFillableForms participant={profile} />
            : <StaffFillableForms staff={profile} />}
        </TabsContent>

        <TabsContent value="work" className="mt-3">
          <StaffHome embedded />
        </TabsContent>

        <TabsContent value="documents" className="mt-3">
          <MyDocuments embedded />
        </TabsContent>

        {!isParticipant && (
          <TabsContent value="name-tags" className="mt-3">
            <NameTags embedded />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}