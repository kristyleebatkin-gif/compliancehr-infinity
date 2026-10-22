import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2, Mail, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { downloadStaffBadgePdf } from '@/lib/staffBadgePdf';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';
import { staffBadgeBlob } from '@/lib/staffBadgePdf';
import { routeDocument } from '@/lib/documentRouting';
import { logUserAction } from '@/lib/actionLog';
import StaffBadgePreview from '@/components/safe/StaffBadgePreview';

export default function StaffBadgeCreator() {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [branding, setBranding] = useState(getCompanyBranding());
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    (async () => {
      const [page, latestBranding] = await Promise.all([
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 200, fields: ['full_name', 'position', 'employee_number'] }),
        loadCompanyBranding().catch(() => getCompanyBranding()),
      ]);
      setStaffList(page.items || []);
      setBranding(latestBranding);
      const first = (page.items || [])[0];
      if (first) setStaffId(first.id);
    })();
  }, []);

  const selected = staffList.find((s) => s.id === staffId);

  const saveToSafe = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const blob = staffBadgeBlob({ staffName: selected.full_name, position: selected.position, employeeNumber: selected.employee_number });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: new File([blob], `Staff Badge - ${selected.full_name}.pdf`, { type: 'application/pdf' }) });
      const record = await base44.entities.FormsLibraryDocument.create({
        library: 'company-safe',
        document_type: 'Staff Badge',
        title: `Staff Badge - ${selected.full_name}`,
        person_name: selected.full_name,
        file_name: `Staff Badge - ${selected.full_name}.pdf`,
        file_uri,
        uploaded_date: new Date().toISOString().slice(0, 10),
        uploaded_by: user?.full_name || user?.email || '',
      });
      // Link the badge to the staff member so it shows on their profile.
      const saved = await base44.entities.EmployeeDocument.create({
        title: `Staff Badge - ${selected.full_name}`,
        employee_name: selected.full_name,
        employee_email: selected.email || '',
        document_type: 'Staff Badge',
        status: 'Current',
        file_uri,
        notes: 'Generated in Company Safe - Staff Badge Creator.',
      });
      logUserAction('Document Uploaded', 'Employee Document', { record_id: saved?.id, record_title: `Staff Badge - ${selected.full_name}`, details: 'Generated in Company Safe - Staff Badge Creator.', person: { profile_type: 'employee', profile_id: selected.id, profile_name: selected.full_name } });
      routeDocument(record, { person_name: selected.full_name, person_type: 'Employee' });
      toast({ title: 'Badge stored in the company safe', description: `Linked to ${selected.full_name} and shown on their profile.` });
    } catch (error) {
      toast({ title: 'Could not store badge', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const downloadTag = () => {
    if (!selected) return;
    downloadStaffBadgePdf({ staffName: selected.full_name, position: selected.position, employeeNumber: selected.employee_number });
  };

  const emailTag = async () => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      const res = await base44.functions.invoke('sendNameTagEmail', { staff_id: selected.id });
      if (res.data?.success) toast({ title: `Name tag emailed to ${res.data.sent_to}` });
      else toast({ title: 'Could not email name tag', description: res.data?.error, variant: 'destructive' });
    } catch (error) {
      toast({ title: 'Could not email name tag', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="overflow-hidden rounded-2xl border-2 bg-card shadow-panel"
      style={{
        borderColor: '#0d948866',
        background: 'linear-gradient(155deg, rgba(13,148,136,0.10) 0%, #ffffff 70%)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="comm-panel-bar flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-xs sm:text-sm font-extrabold text-white"
        style={{ background: 'linear-gradient(120deg, #2563eb 0%, #2563eb 40%, #7c3aed 50%, #ec4899 60%, #ec4899 100%)' }}
      >
        <span>Staff Badge Creator — Uses Saved Logo, Name &amp; Slogan</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
          {open ? <>Minimise <ChevronDown className="h-3.5 w-3.5" /></> : <>Open <ChevronRight className="h-3.5 w-3.5" /></>}
        </span>
      </button>
      {open && <div className="p-5">
      <p className="mb-3 text-xs font-bold text-foreground/80">Badges use the business name, logo and slogan stored in the company safe.</p>
      <div className="grid items-start gap-2 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="min-w-0 space-y-2">
          <div className="grid max-w-sm gap-1.5">
            <Label>Staff member</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger className="h-7 text-xs"><SelectValue placeholder={staffList.length ? 'Select staff' : 'No staff yet'} /></SelectTrigger>
              <SelectContent>
                {staffList.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="module-action-bar flex flex-wrap gap-1">
            <Button size="sm" disabled={!selected || saving} onClick={saveToSafe}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Save
            </Button>
            <Button size="sm" variant="outline" disabled={!selected} onClick={downloadTag}>
              <Download className="h-3.5 w-3.5" />Download
            </Button>
            <Button size="sm" variant="outline" disabled={!selected} onClick={emailTag}>
              <Mail className="h-3.5 w-3.5" />Email
            </Button>
          </div>
        </div>

        <div className="w-full max-w-[200px]"><StaffBadgePreview branding={branding} staff={selected} compact /></div>
      </div>
      </div>}
    </div>
  );
}