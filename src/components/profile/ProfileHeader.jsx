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

const chip = 'rounded-full bg-primary/10 px-2.5 py-1 text-foreground';

/**
 * Colour-coded profile front page shared by staff and participants:
 * standard 3cm app header (photo, name, role) followed by ID numbers, contact numbers,
 * start/end dates, name tag (staff) and the profile summary panels.
 */
export default function ProfileHeader({ profile, kind, onUpdated }) {
  const { toast } = useToast();

  const [branding, setBranding] = useState(getCompanyBranding());

  const [makingTag, setMakingTag] = useState(false);

  const { primary } = profilePalette(profile.full_name);
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
        employee_email: profile.email || '',
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
      <div className="app-page-header relative flex items-center rounded-none px-4" style={{ background: 'var(--header-gradient)' }}>
        <div className="relative flex w-full min-w-0 items-center gap-3">
          <ProfilePhotoControl profile={profile} kind={kind} onUpdated={onUpdated} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1>{profile.full_name}</h1>
              <Badge className="border-0 bg-white/20 text-white">{profile.status}</Badge>
            </div>
            <p>{title}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 p-3 text-xs font-medium">
        {isStaff && (profile.employee_number
          ? <span className={chip}><BadgeCheck className="mr-1 inline h-3 w-3" />Employee ID {profile.employee_number}</span>
          : <Button size="sm" className="h-6 rounded-full px-2.5 text-[11px]" onClick={generateEmployeeId}><BadgeCheck className="h-3 w-3" />Generate employee ID</Button>)}
        {!isStaff && profile.ndis_number && <span className={chip}>NDIS {profile.ndis_number}</span>}
        {!isStaff && profile.ndis_reference_number && <span className={chip}>Ref {profile.ndis_reference_number}</span>}
        {profile.phone && <span className={chip}>{profile.phone}</span>}
        {profile.email && <span className={chip}>{profile.email}</span>}
        {isStaff && profile.start_date && <span className={chip}>Start {profile.start_date}</span>}
        {isStaff && profile.end_date && <span className={chip}>End {profile.end_date}</span>}
        {isStaff && (
          <>
            <Button size="sm" variant="outline" onClick={() => downloadStaffBadgePdf({ staffName: profile.full_name, position: profile.position, employeeNumber: profile.employee_number, colour: hexToRgb(primary) })}>
              <Download className="h-3.5 w-3.5" />Download name tag
            </Button>
            <Button size="sm" variant="outline" disabled={makingTag} onClick={makeNameTag}>
              {makingTag ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Make name tag
            </Button>
          </>
        )}
      </div>

      <ProfileSummaryPanels profile={profile} kind={kind} branding={branding} onUpdated={onUpdated} />
    </div>
  );
}