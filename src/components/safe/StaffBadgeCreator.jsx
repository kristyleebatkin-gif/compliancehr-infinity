import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, Save } from 'lucide-react';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';
import { downloadStaffBadgePdf, staffBadgeBlob } from '@/lib/staffBadgePdf';
import { routeDocument } from '@/lib/documentRouting';

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
        file_name: `Staff Badge - ${selected.full_name}.pdf`,
        file_uri,
        uploaded_date: new Date().toISOString().slice(0, 10),
        uploaded_by: user?.full_name || user?.email || '',
      });
      routeDocument(record, { person_name: selected.full_name, person_type: 'Employee' });
      toast({ title: 'Badge stored in the company safe' });
    } catch (error) {
      toast({ title: 'Could not store badge', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 text-sm font-semibold">Staff badge creator</div>
      <p className="mb-4 text-xs text-muted-foreground">Badges use the business name and logo stored in the company safe.</p>
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

        <div className="w-[260px] shrink-0 overflow-hidden rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2.5 bg-primary px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
              {branding.logoDataUrl || branding.logoUrl
                ? <img src={branding.logoDataUrl || branding.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                : <Badge variant="outline" className="text-[8px]">Logo</Badge>}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary-foreground">{branding.companyName || 'ComplianceHR'}</p>
              <p className="truncate text-[8px] text-primary-foreground/70">{branding.slogan || ''}</p>
            </div>
          </div>
          <div className="bg-white p-4">
            <p className="truncate text-base font-bold text-foreground">{selected?.full_name || 'Staff member'}</p>
            <p className="text-xs text-muted-foreground">{selected?.position || 'Support Worker'}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">Employee No. {selected?.employee_number || '-'}</p>
            <div className="mt-2 h-0.5 w-10 rounded bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}