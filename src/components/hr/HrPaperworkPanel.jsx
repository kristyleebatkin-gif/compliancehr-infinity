import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, FileText, Download, PenLine } from 'lucide-react';
import { downloadContractPdf, downloadPositionDescriptionPdf } from '@/lib/hrPaperworkPdf';
import { downloadCsv } from '@/lib/csvExport';
import HrPaperworkDialog from '@/components/hr/HrPaperworkDialog';
import { toast } from '@/components/ui/use-toast';

const fmt = (d) => (d ? String(d).slice(0, 10) : '');
const today = () => new Date().toISOString().slice(0, 10);

const statusTone = (s) => (['Signed', 'Acknowledged', 'Active'].includes(s) ? 'bg-safe/10 text-safe' : ['Ended', 'Superseded'].includes(s) ? 'bg-muted text-muted-foreground' : 'bg-warning/10 text-warning');

export default function HrPaperworkPanel() {
  const [contracts, setContracts] = useState([]);
  const [pds, setPds] = useState([]);
  const [staff, setStaff] = useState([]);
  const [business, setBusiness] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, p, s, b, me] = await Promise.all([
      base44.entities.EmployeeEmploymentContract.filter({ archived: { $ne: true } }, { sort: '-created_date', limit: 200 }),
      base44.entities.EmployeePositionDescription.filter({ archived: { $ne: true } }, { sort: '-created_date', limit: 200 }),
      base44.entities.StaffProfile.filter({ status: { $ne: 'Inactive' } }, { sort: 'full_name', limit: 300 }),
      base44.entities.BusinessDetails.list({ limit: 1 }),
      base44.auth.me(),
    ]);
    setContracts(c.items || []);
    setPds(p.items || []);
    setStaff(s.items || []);
    setBusiness((b.items || [])[0] || {});
    setUser(me);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markSigned = async (contract) => {
    try {
      await base44.functions.invoke('hrPaperwork', {
        action: 'update', kind: 'contract', id: contract.id,
        data: { contract_status: 'Signed', employee_signed_date: today(), employer_signed_date: today() },
      });
      toast({ title: `Contract marked as signed for ${contract.employee_name}` });
      load();
    } catch (e) {
      toast({ title: 'Could not update contract', variant: 'destructive' });
    }
  };

  const markAcknowledged = async (pd) => {
    try {
      await base44.functions.invoke('hrPaperwork', {
        action: 'update', kind: 'position', id: pd.id,
        data: { status: 'Acknowledged', acknowledged_date: today() },
      });
      toast({ title: `Position description acknowledged for ${pd.employee_name}` });
      load();
    } catch (e) {
      toast({ title: 'Could not update position description', variant: 'destructive' });
    }
  };

  const businessInfo = () => ({
    business_name: business.business_name || 'ComplianceHR',
    abn: business.abn,
    address_line: business.address_line,
    suburb: business.suburb,
    state: business.state,
    postcode: business.postcode,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setDialogOpen(true)}><FileSignature className="mr-2 h-4 w-4" />Prepare new document</Button>
        <Button size="sm" variant="outline" onClick={() => {
          const rows = [
            ...contracts.map((c) => ({ document_type: 'Employment Contract', employee_name: c.employee_name, position_title: c.position_title, employment_type: c.employment_type, commencement_date: c.commencement_date, status: c.contract_status })),
            ...pds.map((p) => ({ document_type: 'Position Description', employee_name: p.employee_name, position_title: p.position_title, employment_type: p.employment_type, commencement_date: '', status: p.status })),
          ];
          downloadCsv('hr-paperwork-register.csv', [
            { label: 'Document Type', key: 'document_type' }, { label: 'Employee', key: 'employee_name' },
            { label: 'Position', key: 'position_title' }, { label: 'Employment Type', key: 'employment_type' },
            { label: 'Commencement', key: 'commencement_date' }, { label: 'Status', key: 'status' },
          ], rows);
        }}>Export register CSV</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b p-4">
                <FileSignature className="h-4 w-4 text-brand" />
                <p className="font-semibold">Employment contracts</p>
                <span className="text-xs text-muted-foreground">({contracts.length})</span>
              </div>
              {contracts.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No contracts prepared yet. Use "Prepare new document" to create the first one.</p>
              ) : (
                <div className="divide-y">
                  {contracts.map((c) => (
                    <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{c.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{c.position_title} - {c.employment_type} - commenced {fmt(c.commencement_date)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusTone(c.contract_status)}`}>{c.contract_status}</span>
                        <Button size="sm" variant="outline" onClick={() => downloadContractPdf(c, businessInfo(), user?.full_name)}><Download className="mr-1 h-3.5 w-3.5" />PDF</Button>
                        {c.contract_status !== 'Signed' && (
                          <Button size="sm" variant="outline" onClick={() => markSigned(c)}><PenLine className="mr-1 h-3.5 w-3.5" />Record signed</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b p-4">
                <FileText className="h-4 w-4 text-brand" />
                <p className="font-semibold">Position descriptions</p>
                <span className="text-xs text-muted-foreground">({pds.length})</span>
              </div>
              {pds.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No position descriptions prepared yet.</p>
              ) : (
                <div className="divide-y">
                  {pds.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{p.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{p.position_title} - {p.employment_type || ''}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusTone(p.status)}`}>{p.status}</span>
                        <Button size="sm" variant="outline" onClick={() => downloadPositionDescriptionPdf(p, businessInfo(), user?.full_name)}><Download className="mr-1 h-3.5 w-3.5" />PDF</Button>
                        {p.status !== 'Acknowledged' && (
                          <Button size="sm" variant="outline" onClick={() => markAcknowledged(p)}><PenLine className="mr-1 h-3.5 w-3.5" />Record acknowledged</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <HrPaperworkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staff={staff}
        business={businessInfo()}
        userName={user?.full_name || ''}
        onSaved={load}
      />
    </div>
  );
}