import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2, Save } from 'lucide-react';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';
import { downloadStaffBadgePdf, staffBadgeBlob } from '@/lib/staffBadgePdf';
import { routeDocument } from '@/lib/documentRouting';
import StaffBadgePreview from '@/components/safe/StaffBadgePreview';

export default function StaffBadgeCreator() {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [branding, setBranding] = useState(getCompanyBranding());
  const [saving, setSaving] = useState(false);

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
      await base44.entities.EmployeeDocument.create({
        title: `Staff Badge - ${selected.full_name}`,
        employee_name: selected.full_name,
        document_type: 'Staff Badge',
        status: 'Current',
        file_uri,
        notes: 'Generated in Company Safe - Staff Badge Creator.',
      });
      routeDocument(record, { person_name: selected.full_name, person_type: 'Employee' });
      toast({ title: 'Badge stored in the company safe', description: `Linked to ${selected.full_name} and shown on their profile.` });
    } catch (error) {
      toast({ title: 'Could not store badge', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 text-sm font-semibold">Staff badge creator</div>
      <p className="mb-4 text-xs text-muted-foreground">Badges use the business name, logo and slogan stored in the company safe.</p>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div className="grid max-w-sm gap-1.5">
            <Label>Staff member</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger><SelectValue placeholder={staffList.length ? 'Select staff' : 'No staff yet'} /></SelectTrigger>
              <SelectContent>
                {staffList.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={!selected} onClick={() => downloadStaffBadgePdf({ staffName: selected.full_name, position: selected.position, employeeNumber: selected.employee_number })}>
              <Download className="h-3.5 w-3.5" />Download badge PDF
            </Button>
            <Button size="sm" disabled={!selected || saving} onClick={saveToSafe}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Store in company safe
            </Button>
          </div>
        </div>

        <StaffBadgePreview branding={branding} staff={selected} />
      </div>
    </div>
  );
}