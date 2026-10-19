import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, FolderOpen, RefreshCw, Eye, Database, Download, CalendarDays } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import DataControlPanel from '@/components/documents/DataControlPanel';
import { format, differenceInCalendarDays } from 'date-fns';
import AttachedFormsLibrary from '@/components/documents/AttachedFormsLibrary';
import BulkUploadDocuments from '@/components/documents/BulkUploadDocuments';
import BusinessDocumentsLibrary from '@/components/documents/BusinessDocumentsLibrary';
import VaultUploads from '@/components/documents/VaultUploads';
import ParticipantVault from '@/components/documents/ParticipantVault';
import EmployeeDocumentDialog from '@/components/documents/EmployeeDocumentDialog';
import BulkEditBar from '@/components/documents/BulkEditBar';
import ExpiryCalendar from '@/components/documents/ExpiryCalendar';
import { PARTICIPANT_FILE_SECTIONS, PARTICIPANT_FORM_META, PARTICIPANT_FORM_DEFINITIONS, PARTICIPANT_FORM_FILES } from '@/lib/participantDocuments';

const DOC_TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Other'];
const CATEGORIES = ['Mandatory', 'Compliance', 'Clinical', 'Professional Development', 'Induction'];

const expiryTone = (expiry) => {
  if (!expiry) return 'bg-muted text-foreground/60';
  const days = differenceInCalendarDays(new Date(expiry), new Date());
  if (days < 0) return 'bg-danger/10 text-danger';
  if (days <= 30) return 'bg-warning/10 text-warning';
  return 'bg-safe/10 text-safe';
};

export default function Documents() {
  const { search } = useLocation();
  const focus = new URLSearchParams(search).get('focus');
  const [docs, setDocs] = useState([]);
  const [myDocs, setMyDocs] = useState([]);
  const [me, setMe] = useState(null);
  const isParticipant = me?.role === 'Participant';
  const [myProfile, setMyProfile] = useState(null);
  const [staff, setStaff] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [selected, setSelected] = useState([]);
  const [applying, setApplying] = useState(false);
  const canManageAll = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager'].includes(me?.role);
  const canEditDoc = (d) => canManageAll || (me?.role === 'Support Worker' && d.employee_name === me?.full_name);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const meUser = await base44.auth.me();
      setMe(meUser);
      if (meUser.role === 'Participant') {
        const [page, profilePage] = await Promise.allSettled([
          base44.entities.ParticipantDocument.filter({ participant_user_id: meUser.id }, { sort: '-created_date', limit: 50 }),
          base44.entities.ParticipantProfile.filter({ email: meUser.email }, { limit: 1 }),
        ]);
        setMyDocs(page.status === 'fulfilled' ? page.value.items || [] : []);
        setMyProfile(profilePage.status === 'fulfilled' ? (profilePage.value.items || [])[0] || null : null);
        return;
      }
      if (meUser.role === 'Support Worker') {
        // Support staff manage their own documents only
        const page = await base44.entities.EmployeeDocument.filter(
          { employee_name: meUser.full_name, status: { $ne: 'Archived' } },
          { sort: 'expiry_date', limit: 50 },
        );
        setDocs(page.items || []);
        return;
      }
      const results = await Promise.allSettled([
        base44.entities.EmployeeDocument.filter({ status: { $ne: 'Archived' } }, { sort: 'expiry_date', limit: 50 }),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 100, fields: ['full_name'] }),
        base44.entities.Certificate.filter({ status: { $ne: 'Revoked' } }, { sort: 'expiry_date', limit: 100, fields: ['module_title', 'staff_name', 'expiry_date', 'status'] }),
      ]);
      setDocs(results[0].status === 'fulfilled' ? results[0].value.items : []);
      setStaff(results[1].status === 'fulfilled' ? results[1].value.items.map((i) => i.full_name) : []);
      setCerts(results[2].status === 'fulfilled' ? results[2].value.items : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Scroll to the section a module's Docs button asked for (e.g. ?focus=employee)
  useEffect(() => {
    if (!focus) return;
    const timer = setTimeout(() => {
      document.getElementById(`vault-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
    return () => clearTimeout(timer);
  }, [focus, loading]);

  const remove = async (doc) => {
    if (!canEditDoc(doc)) return;
    if (!confirm('Delete this document?')) return;
    await base44.entities.EmployeeDocument.delete(doc.id);
    await load();
  };

  const toggleSelect = (id, checked) => {
    setSelected((s) => (checked ? [...s, id] : s.filter((x) => x !== id)));
  };

  // Bulk status change: one update per selected record, applied in a single batch.
  const bulkApply = async (status) => {
    const targets = docs.filter((d) => selected.includes(d.id) && canEditDoc(d));
    if (!targets.length) return;
    setApplying(true);
    try {
      await base44.entities.EmployeeDocument.bulkUpdate(targets.map((t) => ({ id: t.id, status })));
      setSelected([]);
      await load();
    } finally {
      setApplying(false);
    }
  };

  const viewDoc = async (doc) => {
    try {
      if (doc.file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
        window.open(signed_url, '_blank');
      } else if (safeUrl(doc.file_url)) {
        window.open(safeUrl(doc.file_url), '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportAll = async () => {
    const rows = await fetchAllRecords(base44.entities.EmployeeDocument, {}, '-created_date');
    downloadCsv('document-vault-full-register.csv', [
      { key: 'title', label: 'Title' }, { key: 'employee_name', label: 'Employee' }, { key: 'document_type', label: 'Type' },
      { key: 'issue_date', label: 'Issue Date' }, { key: 'expiry_date', label: 'Expiry Date' },
      { key: 'status', label: 'Status' }, { key: 'notes', label: 'Notes' },
    ], rows.map((d) => ({ ...d, notes: d.notes || '' })));
  };

  const runScan = async () => {
    setScanning(true);
    setScanMsg('');
    try {
      const res = await base44.functions.invoke('complianceExpiryScan', {});
      const { documents, certificates } = res.data || {};
      setScanMsg(`Scan complete: ${documents.updated + certificates.updated} records updated`);
      await load();
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={FolderOpen} title="Document Vault" subtitle="Every Document, Expiry Tracking and Data Control." showAlerts={false} />

      {isParticipant ? (
        <ParticipantVault docs={myDocs} loading={loading} viewDoc={viewDoc} me={me} profile={myProfile} onDone={load} />
      ) : (
        <>
      <RegisterInsights module="documents" />
      <DataControlPanel />

      <Tabs defaultValue="documents">
        <TabsList className="flex-wrap">
          <TabsTrigger value="documents"><FolderOpen className="mr-1.5 inline h-3.5 w-3.5" />Every Document</TabsTrigger>
          <TabsTrigger value="expiry-calendar"><CalendarDays className="mr-1.5 inline h-3.5 w-3.5" />Expiry Calendar</TabsTrigger>
          <TabsTrigger value="data-control"><Database className="mr-1.5 inline h-3.5 w-3.5" />Data Control</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-4 space-y-6">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-brand/25 bg-gradient-brand-soft px-4 py-3">
        <span className="text-sm font-bold font-editorial text-foreground/80">Every document on file</span>
        <span className="flex-1" />
        <div className="flex items-center gap-2">
          {scanMsg && <span className="text-sm text-muted-foreground">{scanMsg}</span>}
          <Button variant="outline" onClick={runScan} disabled={scanning}>
            <RefreshCw className={`mr-2 h-4 w-4 ${scanning ? 'animate-spin' : ''}`} /> Scan expiries
          </Button>
          <Button variant="outline" onClick={exportAll}>
            <Download className="mr-2 h-4 w-4" /> Bulk export all documents
          </Button>
        </div>
        <BulkUploadDocuments staff={staff} onDone={load} />
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add document</Button>
        <EmployeeDocumentDialog
          open={open}
          onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}
          staff={staff}
          me={me}
          canPickEmployee={canManageAll}
          initial={editing}
          onDone={load}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : docs.length === 0 ? (
        <EmptyState icon={FolderOpen} modulePath="/documents" title="No documents on file yet" message="Upload or register your first document to start the vault." />
      ) : (
        <>
        {selected.length > 0 && (
          <BulkEditBar
            count={selected.length}
            applying={applying}
            onApply={(v) => bulkApply(v.status)}
            onClear={() => setSelected([])}
            options={[
              { value: 'Current', label: 'Approve (mark Current)' },
              { value: 'Expiring Soon', label: 'Mark Expiring Soon' },
              { value: 'Expired', label: 'Mark Expired' },
              { value: 'Archived', label: 'Archive' },
            ]}
          />
        )}
        {docs.some((d) => canEditDoc(d)) && (
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-foreground/70">
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer rounded border-border accent-[hsl(var(--primary))]"
              checked={selected.length > 0 && selected.length === docs.filter((d) => canEditDoc(d)).length}
              onChange={(e) => setSelected(e.target.checked ? docs.filter((d) => canEditDoc(d)).map((d) => d.id) : [])}
            />
            Select all
          </label>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((d) => {
            const expired = d.expiry_date && differenceInCalendarDays(new Date(d.expiry_date), new Date()) < 0;
            return (
            <Card key={d.id} className={expired ? 'border-destructive/40' : 'border-border/60'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    {canEditDoc(d) && (
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-[hsl(var(--primary))]"
                        checked={selected.includes(d.id)}
                        onChange={(e) => toggleSelect(d.id, e.target.checked)}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{d.title}</p>
                      <p className="text-sm text-muted-foreground">{d.employee_name || 'Unassigned'} · {d.document_type}</p>
                    </div>
                  </div>
                  <Badge className={expiryTone(d.expiry_date)}>{d.status}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className={expired ? 'font-semibold text-destructive' : ''}>{d.expiry_date ? `Expires ${format(new Date(d.expiry_date), 'd MMM yyyy')}` : 'No expiry'}</span>
                  <div className="flex items-center gap-1">
                    {canEditDoc(d) && (
                      <Button variant="ghost" size="icon" title="Edit document" onClick={() => { setEditing(d); setOpen(true); }}><Pencil className="h-4 w-4 text-foreground/60" /></Button>
                    )}
                    {(d.file_uri || d.file_url) && (
                      <Button variant="ghost" size="icon" title="View document" onClick={() => viewDoc(d)}><Eye className="h-4 w-4 text-foreground/60" /></Button>
                    )}
                    {canEditDoc(d) && <Button variant="ghost" size="icon" onClick={() => remove(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
        </>
      )}

      <div className="flex items-center gap-2.5 pt-2">
        <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg shadow-sm"><FolderOpen className="h-4 w-4 text-white" /></span>
        <span className="text-sm font-bold font-editorial text-foreground/80">Forms &amp; document libraries</span>
        <span className="h-1 w-8 rounded-full bg-brand" />
      </div>
      <div id="vault-participant" className="scroll-mt-24">
      <AttachedFormsLibrary
        title="Participant Forms Library"
        subtitle="Official participant service forms - download templates or upload completed records"
        libraryKey="Participant"
        sections={PARTICIPANT_FILE_SECTIONS}
        formFiles={PARTICIPANT_FORM_FILES}
        formCodes={Object.fromEntries(Object.entries(PARTICIPANT_FORM_META).map(([key, meta]) => [key, meta.code]))}
        definitions={PARTICIPANT_FORM_DEFINITIONS}
      />
      </div>
      <div id="vault-business" className="scroll-mt-24">
      <BusinessDocumentsLibrary />
      </div>
      <div id="vault-vault" className="scroll-mt-24">
      <VaultUploads />
      </div>
        </TabsContent>

        <TabsContent value="expiry-calendar" className="mt-4">
          <ExpiryCalendar docs={docs} certs={certs} viewDoc={viewDoc} editable={canManageAll} onReschedule={load} />
        </TabsContent>

        <TabsContent value="data-control" className="mt-4">
          <DataControlPanel />
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  );
}