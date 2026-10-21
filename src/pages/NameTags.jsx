import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { logUserAction } from '@/lib/actionLog';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import StaffBadgePreview from '@/components/safe/StaffBadgePreview';
import StaffBadgeCreator from '@/components/safe/StaffBadgeCreator';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';
import { downloadStaffBadgePdf, staffBadgeBlob } from '@/lib/staffBadgePdf';
import { profilePalette, hexToRgb } from '@/lib/profileColours';
import { safeUrl } from '@/lib/safeUrl';
import { IdCard, Download, Save, Mail, Loader2, Eye } from 'lucide-react';
import { format } from 'date-fns';

const fmt = (d) => d ? format(new Date(d), 'd MMM yyyy') : '';
const MANAGEMENT = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager'];

// Name Tags module: staff make, download and email their own branded name tag;
// management roles get the full badge creator for any staff member.
export default function NameTags({ embedded = false, profile: selectedProfile } = {}) {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [branding, setBranding] = useState(getCompanyBranding());
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [making, setMaking] = useState(false);
  const [emailing, setEmailing] = useState(false);

  const isManager = !selectedProfile && MANAGEMENT.includes(me?.role);

  const load = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      setMe(user);
      setBranding(await loadCompanyBranding().catch(() => getCompanyBranding()));
      if (!selectedProfile && MANAGEMENT.includes(user.role)) { setLoading(false); return; }
      const [profPage, savedPage] = await Promise.allSettled([
        selectedProfile ? Promise.resolve({ items: [selectedProfile] }) : base44.entities.StaffProfile.filter({ email: user.email }, { limit: 1 }),
        base44.entities.EmployeeDocument.filter(
          { employee_name: selectedProfile?.full_name || user.full_name, document_type: 'Staff Badge' },
          { sort: '-created_date', limit: 20 },
        ),
      ]);
      setProfile(profPage.status === 'fulfilled' ? (profPage.value.items || [])[0] || null : null);
      setSaved(savedPage.status === 'fulfilled' ? savedPage.value.items || [] : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedProfile?.id, selectedProfile?.full_name]);

  useEffect(() => { load(); }, [load]);

  const makeTag = async () => {
    if (!profile) return;
    setMaking(true);
    try {
      const { primary } = profilePalette(profile.full_name);
      const blob = staffBadgeBlob({ staffName: profile.full_name, position: profile.position, employeeNumber: profile.employee_number, colour: hexToRgb(primary) });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({
        file: new File([blob], `Staff Badge - ${profile.full_name}.pdf`, { type: 'application/pdf' }),
      });
      const saved = await base44.entities.EmployeeDocument.create({
        title: `Staff Badge - ${profile.full_name}`,
        employee_name: profile.full_name,
        document_type: 'Staff Badge',
        status: 'Current',
        file_uri,
        notes: 'Made by the employee in the Name Tags module.',
      });
      logUserAction('Document Uploaded', 'Employee Document', { record_id: saved?.id, record_title: `Staff Badge - ${profile.full_name}`, details: 'Name tag saved to My Documents', person: { profile_type: 'employee', profile_id: profile.id, profile_name: profile.full_name } });
      toast({ title: 'Name tag saved to My Documents' });
      load();
    } catch (error) {
      toast({ title: 'Could not make name tag', description: error.message, variant: 'destructive' });
    } finally {
      setMaking(false);
    }
  };

  const emailTag = async () => {
    if (!profile?.id) return;
    setEmailing(true);
    try {
      const res = await base44.functions.invoke('sendNameTagEmail', { staff_id: profile.id });
      if (res.data?.success) toast({ title: `Name tag emailed to ${res.data.sent_to}` });
      else toast({ title: 'Could not email name tag', description: res.data?.error, variant: 'destructive' });
    } catch (error) {
      toast({ title: 'Could not email name tag', description: error.message, variant: 'destructive' });
    } finally {
      setEmailing(false);
    }
  };

  const viewSaved = async (doc) => {
    try {
      if (doc.file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
        window.open(signed_url, '_blank');
      } else if (safeUrl(doc.file_url)) {
        window.open(safeUrl(doc.file_url), '_blank', 'noopener,noreferrer');
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {!embedded && <PageHeader icon={IdCard} title="Name Tags" subtitle="Make, download and email your branded staff name tag." showAlerts={false} />}

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : isManager ? (
        <StaffBadgeCreator />
      ) : (
        <div className="space-y-4">
          {profile ? (
            <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-border/60 bg-card p-6">
              <StaffBadgePreview branding={branding} staff={profile} />
              <div className="flex min-w-[220px] flex-1 flex-col gap-2">
                <h2 className="font-display text-lg font-bold">Make my name tag</h2>
                <p className="text-sm text-foreground/60">Generated with the company branding, your name, position and employee number.</p>
                <Button variant="outline" className="justify-start" onClick={() => downloadStaffBadgePdf({ staffName: profile.full_name, position: profile.position, employeeNumber: profile.employee_number, colour: hexToRgb(profilePalette(profile.full_name).primary) })}>
                  <Download className="h-4 w-4" />Download PDF
                </Button>
                <Button className="justify-start" disabled={making} onClick={makeTag}>
                  {making ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Make name tag
                </Button>
                <Button variant="outline" className="justify-start" disabled={emailing} onClick={emailTag}>
                  {emailing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}Email name tag
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState icon={IdCard} title="No staff profile yet" message="Ask HR to create your staff profile, then you can make your name tag here." />
          )}

          {saved.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">My saved name tags</h2>
              {saved.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                  <IdCard className="h-5 w-5 shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{d.title}</div>
                    <div className="text-xs text-foreground/50">Saved {fmt(d.created_date || new Date())}{d.notes ? ` · ${d.notes}` : ''}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => viewSaved(d)}><Eye className="h-3.5 w-3.5" />View</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {!loading && profile && <IntakeCaseWorkflow intakeType="Employee" profile={profile} profileView="documents" />}
    </div>
  );
}