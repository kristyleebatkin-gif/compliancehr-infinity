import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StaffHome from '@/pages/StaffHome';
import MyDocuments from '@/pages/MyDocuments';
import NameTags from '@/pages/NameTags';
import { UserRound, Save, CheckCircle2 } from 'lucide-react';

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
  const [form, setForm] = useState({});
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
  const setField = (key, value) => { setForm((f) => ({ ...f, [key]: value })); setSaved(false); };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const entity = isParticipant ? base44.entities.ParticipantProfile : base44.entities.StaffProfile;
      await entity.update(profile.id, form);
      setSaved(true);
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-6">
      <PageHeader icon={UserRound} title={isParticipant ? 'My participant profile' : 'My employee profile'} subtitle={isParticipant ? 'Your profile, work, documents and support in one place.' : 'Your profile, work, documents and name tag in one place.'} showAlerts={false} showCompliance={false} showAudit={false} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="work">My Work</TabsTrigger>
          <TabsTrigger value="documents">My Documents</TabsTrigger>
          {!isParticipant && <TabsTrigger value="name-tags">Name Tags</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-6">
          {!profile ? (
            <EmptyState icon={UserRound} title="Profile not set up yet" message={isParticipant ? 'Your support team will set up your profile, then you can view and edit it here.' : 'Ask HR to create your staff profile, then you can view and edit it here.'} />
          ) : (
            <>
              <Card className="border-border/60">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold font-editorial">{profile.full_name}</div>
                      <div className="text-sm text-foreground/60">{profile.email}</div>
                    </div>
                    <Badge variant="outline">{profile.status || 'Active'}</Badge>
                  </div>
                  <div className="grid gap-2 rounded-xl bg-muted/40 p-3 text-sm text-foreground/70">
                    {isParticipant ? (
                      <>
                        {profile.ndis_number && <div>NDIS number: <span className="font-medium">{profile.ndis_number}</span></div>}
                        {profile.support_type && <div>Support provided: <span className="font-medium">{profile.support_type}</span></div>}
                        {profile.support_coordinator && <div>Support coordination: <span className="font-medium">{profile.support_coordinator}</span></div>}
                      </>
                    ) : (
                      <>
                        {profile.position && <div>Position: <span className="font-medium">{profile.position}</span></div>}
                        {profile.role && <div>Role: <span className="font-medium">{profile.role}</span></div>}
                        {profile.employee_number && <div>Employee number: <span className="font-medium">{profile.employee_number}</span></div>}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-foreground/50">Only you and management can see this page. Fields below are yours to keep up to date.</p>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardContent className="p-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
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
            </>
          )}
        </TabsContent>

        <TabsContent value="work" className="mt-4">
          <StaffHome />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <MyDocuments />
        </TabsContent>

        {!isParticipant && (
          <TabsContent value="name-tags" className="mt-4">
            <NameTags />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}