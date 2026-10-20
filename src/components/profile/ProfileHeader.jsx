import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { profilePalette, hexToRgb } from '@/lib/profileColours';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';
import { downloadStaffBadgePdf } from '@/lib/staffBadgePdf';
import { businessDateTime } from '@/lib/intakeCases';
import { logUserAction } from '@/lib/actionLog';
import { BadgeCheck, Camera, Download, History, Loader2, Save, Sparkles, UserRound } from 'lucide-react';

/**
 * Colour-coded profile front page shared by staff and participants:
 * photo, ID numbers, contact numbers, start/end dates, About Me,
 * name tag (staff) and the details-check change log.
 */
export default function ProfileHeader({ profile, kind, onUpdated, compact = false }) {
  const { toast } = useToast();
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [branding, setBranding] = useState(getCompanyBranding());
  const [aboutMe, setAboutMe] = useState(profile.about_me || '');
  const [savingAbout, setSavingAbout] = useState(false);
  const [makingTag, setMakingTag] = useState(false);

  const { primary, accent } = profilePalette(profile.full_name);
  const isStaff = kind === 'staff';

  useEffect(() => {
    loadCompanyBranding().then(setBranding).catch(() => {});
  }, []);
  useEffect(() => { setAboutMe(profile.about_me || ''); }, [profile.id]);
  useEffect(() => {
    let active = true;
    if (profile.profile_photo_uri) {
      base44.integrations.Core.CreateFileSignedUrl({ file_uri: profile.profile_photo_uri })
        .then(({ signed_url }) => { if (active) setPhotoUrl(signed_url); })
        .catch(() => {});
    } else {
      setPhotoUrl('');
    }
    return () => { active = false; };
  }, [profile.profile_photo_uri]);

  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { date, time } = businessDateTime();
      const user = await base44.auth.me();
      await base44.entities[isStaff ? 'StaffProfile' : 'ParticipantProfile'].update(profile.id, {
        profile_photo_uri: file_uri,
        change_log: [`${date} ${time} | Profile photo updated by ${user?.full_name || user?.email || 'app'}`, profile.change_log].filter(Boolean).join('\n'),
      });
      onUpdated();
    } catch (error) {
      toast({ title: 'Photo upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const saveAboutMe = async () => {
    setSavingAbout(true);
    try {
      const { date, time } = businessDateTime();
      const user = await base44.auth.me();
      await base44.entities[isStaff ? 'StaffProfile' : 'ParticipantProfile'].update(profile.id, {
        about_me: aboutMe,
        change_log: [`${date} ${time} | About Me updated by ${user?.full_name || user?.email || 'app'}`, profile.change_log].filter(Boolean).join('\n'),
      });
      toast({ title: 'About Me saved' });
      onUpdated();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSavingAbout(false);
    }
  };

  const generateEmployeeId = async () => {
    const number = `EMP-${String(Math.floor(1000 + Math.random() * 9000))}`;
    await base44.entities.StaffProfile.update(profile.id, { employee_number: number });
    toast({ title: `Employee ID ${number} generated` });
    onUpdated();
  };

  // Staff make their own name tag: generated with company branding, then saved
  // privately as a Staff Badge in their own documents.
  const makeNameTag = async () => {
    setMakingTag(true);
    try {
      const { staffBadgeBlob } = await import('@/lib/staffBadgePdf');
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
        notes: 'Made by the employee from My Profile.',
      });
      logUserAction('Document Uploaded', 'Employee Document', { record_id: saved?.id, record_title: `Staff Badge - ${profile.full_name}`, details: 'Name tag saved to My Documents', person: { profile_type: 'employee', profile_id: profile.id, profile_name: profile.full_name } });
      toast({ title: 'Name tag saved to your documents' });
    } catch (error) {
      toast({ title: 'Could not make name tag', description: error.message, variant: 'destructive' });
    } finally {
      setMakingTag(false);
    }
  };

  const changeLogLines = String(profile.change_log || '').split('\n').filter(Boolean);
  const title = isStaff ? (profile.position || profile.role || 'Staff member') : (profile.support_type || 'Participant');

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className={compact ? 'relative px-4 py-3 text-white' : 'relative px-6 py-6 text-white'} style={{ background: `linear-gradient(120deg, ${primary} 0%, ${accent} 100%)` }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 88% 8%, rgba(255,255,255,0.28), transparent 42%), radial-gradient(circle at 6% 95%, rgba(255,255,255,0.18), transparent 38%)' }} />
        <div className={compact ? 'relative flex flex-wrap items-center gap-3' : 'relative flex flex-wrap items-center gap-5'}>
          <label className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-white/70 ring-4 ring-white/25 bg-white/15">
            {photoUrl
              ? <img src={photoUrl} alt={profile.full_name} className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center"><UserRound className="h-9 w-9 text-white/80" /></div>}
            {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Loader2 className="h-5 w-5 animate-spin text-white" /></div>}
            <div className="absolute inset-x-0 bottom-0 hidden items-center justify-center bg-black/45 py-0.5 group-hover:flex">
              <Camera className="h-3 w-3 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { uploadPhoto(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <Badge className="border-0 bg-white/20 text-white">{profile.status}</Badge>
            </div>
            <p className="text-sm text-white/85">{title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
              {isStaff && (profile.employee_number
                ? <span className="rounded-full bg-white/20 px-2.5 py-1"><BadgeCheck className="mr-1 inline h-3 w-3" />Employee ID {profile.employee_number}</span>
                : <Button size="sm" className="h-6 rounded-full px-2.5 text-[11px]" onClick={generateEmployeeId}><BadgeCheck className="h-3 w-3" />Generate employee ID</Button>)}
              {!isStaff && profile.ndis_number && <span className="rounded-full bg-white/20 px-2.5 py-1">NDIS {profile.ndis_number}</span>}
              {!isStaff && profile.ndis_reference_number && <span className="rounded-full bg-white/20 px-2.5 py-1">Ref {profile.ndis_reference_number}</span>}
              {profile.phone && <span className="rounded-full bg-white/20 px-2.5 py-1">{profile.phone}</span>}
              {profile.email && <span className="rounded-full bg-white/20 px-2.5 py-1">{profile.email}</span>}
              {isStaff && profile.start_date && <span className="rounded-full bg-white/20 px-2.5 py-1">Start {profile.start_date}</span>}
              {isStaff && profile.end_date && <span className="rounded-full bg-white/20 px-2.5 py-1">End {profile.end_date}</span>}
            </div>
          </div>
          {isStaff && (
            <div className="w-[230px] shrink-0 overflow-hidden rounded-xl bg-white text-slate-900 shadow-lg">
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: primary }}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded bg-white">
                  {branding.logoDataUrl || branding.logoUrl
                    ? <img src={branding.logoDataUrl || branding.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                    : <span className="text-[7px] font-bold text-slate-500">LOGO</span>}
                </div>
                <p className="truncate text-[11px] font-bold text-white">{branding.companyName || 'ComplianceHR'}</p>
              </div>
              <div className="px-3 py-2">
                <p className="truncate text-sm font-bold">{profile.full_name}</p>
                <p className="truncate text-[10px] text-slate-500">{profile.position || 'Support Worker'}</p>
                <p className="mt-1 text-[9px] text-slate-500">Employee No. {profile.employee_number || '-'}</p>
              </div>
            </div>
          )}
        </div>
        {isStaff && (
          <div className={compact ? 'mt-2 flex flex-wrap gap-2' : 'mt-4 flex flex-wrap gap-2'}>
            <Button size="sm" variant="secondary" className="bg-white/90 text-slate-900 hover:bg-white" onClick={() => downloadStaffBadgePdf({ staffName: profile.full_name, position: profile.position, employeeNumber: profile.employee_number, colour: hexToRgb(primary) })}>
              <Download className="h-3.5 w-3.5" />Download name tag
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/90 text-slate-900 hover:bg-white" disabled={makingTag} onClick={makeNameTag}>
              {makingTag ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Make name tag
            </Button>
          </div>
        )}
      </div>

      <div className={compact ? 'grid gap-3 p-3 md:grid-cols-2' : 'grid gap-5 p-6 md:grid-cols-2'}>
        <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" />About Me</div>
          <Textarea rows={4} value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} placeholder="A little about this person - interests, story, anything they want to share." />
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="outline" disabled={savingAbout || aboutMe === (profile.about_me || '')} onClick={saveAboutMe}>
              {savingAbout ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Save About Me
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4 text-primary" />Details check &amp; change log</div>
          {changeLogLines.length === 0 ? (
            <p className="text-xs text-muted-foreground">No changes logged yet. Every three months the person is prompted to check their details, and each change is logged here with the date, time and action.</p>
          ) : (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border/60 bg-muted/40 p-3">
              {changeLogLines.map((line, i) => <li key={i} className="text-[11px] text-muted-foreground">{line}</li>)}
            </ul>
          )}
          {profile.last_details_check_date && <p className="mt-1 text-[11px] text-muted-foreground">Last details check requested: {profile.last_details_check_date}</p>}
        </div>
      </div>
    </div>
  );
}