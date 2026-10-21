import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProfileSummaryPanels from '@/components/profile/ProfileSummaryPanels';
import ProfilePhotoControl from '@/components/profile/ProfilePhotoControl';
import { profilePalette, hexToRgb } from '@/lib/profileColours';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';
import { downloadStaffBadgePdf } from '@/lib/staffBadgePdf';
import { logUserAction } from '@/lib/actionLog';
import { BadgeCheck, Download, Loader2, Save } from 'lucide-react';

/**
 * Colour-coded profile front page shared by staff and participants:
 * photo, ID numbers, contact numbers, start/end dates, About Me,
 * name tag (staff) and the details-check change log.
 */
export default function ProfileHeader({ profile, kind, onUpdated, compact = false }) {
  const { toast } = useToast();

  const [branding, setBranding] = useState(getCompanyBranding());

  const [makingTag, setMakingTag] = useState(false);

  const { primary, accent } = profilePalette(profile.full_name);
  const isStaff = kind === 'staff';

  useEffect(() => {
    loadCompanyBranding().then(setBranding).catch(() => {});
  }, []);
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

  const title = isStaff ? (profile.position || profile.role || 'Staff member') : (profile.support_type || 'Participant');

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className={compact ? 'relative gradient-brand px-4 py-3 text-white' : 'relative gradient-brand px-6 py-6 text-white'}>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 88% 8%, rgba(255,255,255,0.28), transparent 42%), radial-gradient(circle at 6% 95%, rgba(255,255,255,0.18), transparent 38%)' }} />
        <div className={compact ? 'relative flex flex-wrap items-center gap-3' : 'relative flex flex-wrap items-center gap-5'}>
          <ProfilePhotoControl profile={profile} kind={kind} onUpdated={onUpdated} />
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

      <ProfileSummaryPanels profile={profile} kind={kind} branding={branding} onUpdated={onUpdated} />
    </div>
  );
}