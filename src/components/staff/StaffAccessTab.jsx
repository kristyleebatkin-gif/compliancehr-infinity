import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { canAccessNav } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import ProfileAuditConsentCard from '@/components/profile/ProfileAuditConsentCard';
import { KeyRound, Loader2 } from 'lucide-react';

const PERMISSION_LABELS = {
  dashboard: 'Dashboard',
  participants: 'Participant profiles',
  'visual-boards': 'Visual boards',
  intake: 'Intake centre',
  staff: 'Staff profiles',
  training: 'Training hub',
  compliance: 'Compliance & report centre',
  incidents: 'Incident clinic',
  risks: 'Risk management',
  'audit-centre': 'Audit centre',
  documents: 'Document vault',
  'company-safe': 'Company safe',
  certificates: 'Certificates',
  surveys: 'Surveys',
  'audit-log': 'Audit log',
  feedback: 'Feedback & complaints',
  tasks: 'Tasks',
  quality: 'Quality & improvement',
  assets: 'Asset management',
  goals: 'Goal progress',
  shifts: 'Shift scheduling',
  rostering: 'Rostering',
  invoicing: 'Invoicing centre',
  communications: 'Communication centre',
  meetings: 'Meeting centre',
  'emergency-response': 'Emergency response',
  programs: 'Programs & events',
  'key-contacts': 'Key contacts',
  'volunteering-placements': 'Volunteering placements',
  receipts: 'Receipt hub',
  'insurance-finance': 'Insurance & finance',
  'equipment-manuals': 'Equipment manuals',
  'data-control': 'Data control',
};

const APP_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Support Worker', 'Participant', 'Auditor'];

export default function StaffAccessTab({ staff, onUpdated }) {
  const { toast } = useToast();
  const { isAdmin } = useRole();
  const [username, setUsername] = useState(staff.username || '');
  const [appRole, setAppRole] = useState(staff.app_role || 'user');
  const [saving, setSaving] = useState(false);


  useEffect(() => { setUsername(staff.username || ''); }, [staff.id, staff.username]);

  const saveAccess = async () => {
    setSaving(true);
    try {
      await base44.entities.StaffProfile.update(staff.id, { username, app_role: appRole });
      toast({ title: 'Access settings saved' });
      onUpdated();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };


  const permissions = Object.entries(PERMISSION_LABELS).filter(([navKey]) => canAccessNav(appRole, navKey));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><KeyRound className="h-4 w-4 text-brand" />Username &amp; login</div>
        {isAdmin ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1.5"><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. j.smith" /></div>
              <div className="grid gap-1.5"><Label>App role (permission level)</Label>
                <select value={appRole} onChange={(e) => setAppRole(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                  {APP_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Passwords are managed securely by the platform: users are invited from App Users and set or reset their own password from the login page. Passwords are never stored on the profile.</p>
            <div className="mt-3 flex justify-end">
              <Button onClick={saveAccess} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save access settings</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Username:</span>
              <Badge variant="outline">{staff.username || 'Not set'}</Badge>
              <span className="font-medium text-muted-foreground">App role:</span>
              <Badge className={statusTone('Current')}>{appRole}</Badge>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Only administrators can change access and permissions.</p>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-3 text-sm font-semibold">Permissions for {appRole}</div>
        <div className="flex flex-wrap gap-1.5">
          {permissions.map(([navKey, label]) => (
            <Badge key={navKey} variant="outline" className="text-[11px]">{label}</Badge>
          ))}
        </div>
      </div>

      <ProfileAuditConsentCard profile={staff} kind="staff" onUpdated={onUpdated} />
    </div>
  );
}