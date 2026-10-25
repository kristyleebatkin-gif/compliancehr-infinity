import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, HeartHandshake, Pencil, Eye, Mail, MessageSquare, Download, FileCheck2, UserPlus, Loader2 } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import { useRole } from '@/lib/useRole';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import VolunteerApplications from '@/components/volunteers/VolunteerApplications';
import VolunteerForm from '@/components/volunteers/VolunteerForm';
import VolunteerDetail from '@/components/volunteers/VolunteerDetail';
import VolunteerRegisterCard from '@/components/volunteers/VolunteerRegisterCard';
import '@/components/volunteers/volunteerWorkspace.css';

export default function Volunteers({ embedded = false } = {}) {
  const { toast } = useToast();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [exporting, setExporting] = useState(false);
  const { role } = useRole();
  const isVolunteer = role === 'Volunteer';
  const canManage = ['admin', 'Provider Administrator', 'Administration', 'Compliance Manager', 'Team Leader'].includes(role);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [query, setQuery] = useState('');
  const shown = volunteers.filter((v) => !query.trim() || [v.full_name, v.role, v.email, v.supervisor, v.status].some((f) => (f || '').toLowerCase().includes(query.trim().toLowerCase())));

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.trim().includes('@')) {
      toast({ title: 'Enter a valid email address', variant: 'destructive' });
      return;
    }
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), 'Volunteer');
      toast({ title: 'Invitation sent', description: `${inviteEmail.trim()} will only see their own volunteering records.` });
      setInviteOpen(false);
      setInviteEmail('');
    } catch (e) {
      toast({ title: 'Invite failed', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Volunteer.filter({}, { sort: '-created_date', limit: 200 });
      setVolunteers(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportRegister = async () => {
    setExporting(true);
    try {
      downloadCsv('Volunteer-Register.csv', [
        { key: 'full_name', label: 'Full Name' }, { key: 'role', label: 'Volunteer Role' },
        { key: 'status', label: 'Status' }, { key: 'start_date', label: 'Start Date' },
        { key: 'supervisor', label: 'Supervisor' }, { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' }, { key: 'address', label: 'Address' },
        { key: 'date_of_birth', label: 'Date of Birth' }, { key: 'availability', label: 'Availability' },
        { key: 'weekly_hours', label: 'Weekly Hours' }, { key: 'induction_date', label: 'Induction Date' },
        { key: 'emergency_contact', label: 'Emergency Contact' }, { key: 'emergency_contact_phone', label: 'Emergency Contact Phone' },
        { key: 'ndis_worker_screening', label: 'NDIS Worker Screening' }, { key: 'blue_card_number', label: 'Blue Card' },
        { key: 'police_check_date', label: 'Police Check Date' }, { key: 'reference_checks', label: 'Reference Checks' },
        { key: 'intake_form_name', label: 'Intake Form Stored' }, { key: 'notes', label: 'Notes' },
      ], volunteers);
      toast({ title: 'Volunteer register exported' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="volunteer-workspace space-y-4">
      <ModuleShell
        embedded={embedded}
        title="Volunteering & Student Placement"
        subtitle="Volunteer register with full staff intake requirements, training records and compliance documents."
        icon={HeartHandshake}
        moduleKey="volunteering-placements"
        insightModule={isVolunteer ? undefined : 'volunteers'}
        search={<ModuleSearchBar value={query} onChange={setQuery} placeholder="Search volunteers…" />}
        actions={!isVolunteer && canManage && <>
          <Button size="sm" className="volunteer-add" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" />Add volunteer</Button>
          <Button size="sm" variant="outline" className="volunteer-invite" onClick={() => setInviteOpen(true)}><UserPlus className="h-4 w-4" />Invite volunteer</Button>
          <Button size="sm" variant="outline" className="volunteer-export" onClick={exportRegister} disabled={exporting || loading || volunteers.length === 0}><Download className="h-4 w-4" />Export register</Button>
        </>}
        small={[
          ['Volunteers', volunteers.length],
          ['Active', volunteers.filter((v) => v.status === 'Active').length],
          ['Intake form pending', volunteers.filter((v) => !v.intake_form_uri).length],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{loading ? '…' : value}</p>
          </div>
        ))}
      >
      {canManage && <VolunteerApplications />}

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : volunteers.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No volunteers on the register yet. Add your first volunteer above.</CardContent></Card>
      ) : (
        <>
        <div className="grid gap-2 sm:grid-cols-2 lg:hidden">
          {shown.map(v => <VolunteerRegisterCard key={v.id} volunteer={v} canManage={canManage} onView={() => setViewing(v)} onEdit={() => { setEditing(v); setFormOpen(true); }} onDelete={async () => { await base44.entities.Volunteer.delete(v.id); await load(); }} />)}
        </div>
        <Card className="hidden lg:block">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-1.5 font-semibold">Volunteer</th>
                  <th className="px-2 py-1.5 font-semibold">Role &amp; supervisor</th>
                  <th className="px-2 py-1.5 font-semibold">Status</th>
                  <th className="px-2 py-1.5 font-semibold">Contact</th>
                  <th className="px-2 py-1.5 font-semibold">Availability</th>
                  <th className="px-2 py-1.5 font-semibold">Intake form</th>
                  <th className="px-2 py-1.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((v) => (
                  <tr key={v.id} className="border-b border-border/50 last:border-0">
                    <td className="px-2 py-1.5">
                      <p className="font-medium">{v.full_name}</p>
                      <p className="text-xs text-muted-foreground">{v.start_date ? `Started ${format(new Date(v.start_date), 'd MMM yyyy')}` : 'No start date'}</p>
                    </td>
                    <td className="px-2 py-1.5 text-xs">{v.role || '—'}<br /><span className="text-muted-foreground">{v.supervisor ? `Supervisor: ${v.supervisor}` : ''}</span></td>
                    <td className="px-2 py-1.5"><Badge className={statusTone(v.status)}>{v.status}</Badge></td>
                    <td className="px-2 py-1.5">
                      <div className="flex gap-1">
                        {v.email && <a href={`mailto:${v.email}`} className="rounded-md border border-input p-1.5 hover:bg-accent" title={`Email ${v.full_name}`}><Mail className="h-3.5 w-3.5" /></a>}
                        {v.phone && <a href={`sms:${v.phone}`} className="rounded-md border border-input p-1.5 hover:bg-accent" title="Text (SMS)"><MessageSquare className="h-3.5 w-3.5" /></a>}
                        {!v.email && !v.phone && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-xs">{v.availability || (v.weekly_hours != null ? `${v.weekly_hours} hrs/week` : '—')}</td>
                    <td className="px-2 py-1.5">
                      {v.intake_form_uri ? <Badge variant="secondary" className="text-[10px]"><FileCheck2 className="mr-1 h-3 w-3" />Stored</Badge> : <span className="text-xs text-muted-foreground">Pending</span>}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setViewing(v)}><Eye className="h-3 w-3" />Details</Button>
                        {canManage && <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setEditing(v); setFormOpen(true); }}><Pencil className="h-3 w-3" />Edit</Button>}
                        {canManage && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.Volunteer.delete(v.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        </>
      )}
      </ModuleShell>

      <VolunteerForm open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={load} />
      <VolunteerDetail open={Boolean(viewing)} onOpenChange={(v) => !v && setViewing(null)} volunteer={viewing} onSaved={load} />

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a volunteer</DialogTitle>
            <DialogDescription>
              They get an email with a link to set a password. After signing in, they will only see their own volunteering records and non-private information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="volunteer-invite-email">Email address</Label>
            <Input
              id="volunteer-invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={inviting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>Cancel</Button>
            <Button onClick={sendInvite} disabled={inviting}>
              {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}