import React, { useState, useEffect, useCallback } from 'react';
import DocumentVaultEntry from '@/components/documents/DocumentVaultEntry';
export default function DocumentsPage(props) { return <DocumentVaultEntry Vault={Documents} {...props} />; }
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { openDocumentInViewer } from '@/lib/openDocument';
import { logUserAction } from '@/lib/actionLog';
import ModuleShell from '@/components/module/ModuleShell';
import RegisterInsights from '@/components/RegisterInsights';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Pencil, FolderOpen, Eye, CalendarDays, Sparkles, UploadCloud, ShieldCheck, Lock } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import CompanySafe from '@/pages/CompanySafe';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import DataControlPanel from '@/components/documents/DataControlPanel';
import StaffDocumentToolbar from '@/components/documents/StaffDocumentToolbar';
import DocumentsDashboard from '@/components/documents/DocumentsDashboard';
import { format, differenceInCalendarDays } from 'date-fns';
import VaultUploads from '@/components/documents/VaultUploads';
import '@/components/documents/vaultWorkspace.css';
import { isVaultManager, isVaultProvider } from '@/components/documents/vaultAccess';


import ParticipantVault from '@/components/documents/ParticipantVault';
import EmployeeDocumentDialog from '@/components/documents/EmployeeDocumentDialog';
import DocumentAcknowledgements from '@/components/documents/DocumentAcknowledgements';
import BulkEditBar from '@/components/documents/BulkEditBar';
import ExpiryCalendar from '@/components/documents/ExpiryCalendar';
import SmartMailroomHub from '@/components/documents/SmartMailroomHub';
import EnterpriseStandardQualityGateSuite from '@/components/compliance/EnterpriseStandardQualityGateSuite';
import UniversalDataStorageRetentionExportSuite from '@/components/compliance/UniversalDataStorageRetentionExportSuite';
import FiveLayerEnterpriseAcceptanceSuite from '@/components/compliance/FiveLayerEnterpriseAcceptanceSuite';
import UniversalRegisterManagementHubSuite from '@/components/operations/UniversalRegisterManagementHubSuite';
import CanonicalRegisterDeduplicationBar from '@/components/operations/CanonicalRegisterDeduplicationBar';
import AlliedHealthAndNursingOsSuite from '@/components/enterprise/AlliedHealthAndNursingOsSuite';
import UniversalRecordIntelligenceRoutingSuite from '@/components/operations/UniversalRecordIntelligenceRoutingSuite';
import Standard2026PrintableTemplatesSuite from '@/components/compliance/Standard2026PrintableTemplatesSuite';
import ReviewFormTemplates from '@/components/compliance/ReviewFormTemplates';
import DocumentRenewalCalendar from '@/components/compliance/DocumentRenewalCalendar';
import BusinessDocumentsLibrary from '@/components/documents/BusinessDocumentsLibrary';
import ReviewSchedulesPanel from '@/components/documents/ReviewSchedulesPanel';
import StandardsEvidenceGapStrip from '@/components/documents/StandardsEvidenceGapStrip';

const DOC_TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Other'];
const CATEGORIES = ['Mandatory', 'Compliance', 'Clinical', 'Professional Development', 'Induction'];

const expiryTone = (expiry) => {
  if (!expiry) return 'bg-muted text-foreground/60';
  const days = differenceInCalendarDays(new Date(expiry), new Date());
  if (days < 0) return 'bg-danger/10 text-danger';
  if (days <= 30) return 'bg-warning/10 text-warning';
  return 'bg-safe/10 text-safe';
};

function Documents({ profile, profileKind, embedded = false } = {}) {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const focus = searchParams.get('focus');
  const requestedTab = searchParams.get('tab');
  const documentType = searchParams.get('document_type') || '';
  const [docs, setDocs] = useState([]);
  const [myDocs, setMyDocs] = useState([]);
  const [me, setMe] = useState(null);
  const isParticipant = profile ? profileKind === 'participant' : me?.role === 'Participant';
  const [myProfile, setMyProfile] = useState(null);
  const [staff, setStaff] = useState([]);
  const [certs, setCerts] = useState([]);
  const [pdocs, setPdocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [selected, setSelected] = useState([]);
  const [applying, setApplying] = useState(false);
  const [tab, setTab] = useState(() => requestedTab || 'documents');

  useEffect(() => {
    if (requestedTab) setTab(requestedTab);
  }, [requestedTab]);
  const [onlyGaps, setOnlyGaps] = useState(false);
  const canViewUploads = isVaultManager(me?.role);
  const canViewDataControl = isVaultProvider(me?.role);
  const canManageAll = canViewUploads || ['Compliance Manager', 'Compliance Administrator', 'Administration', 'Team Leader', 'Human Resources Manager', 'Quality & Improvement Manager'].includes(me?.role);
  const canEditDoc = (d) => canManageAll || (['Support Worker', 'Employee'].includes(me?.role) && d.employee_name === me?.full_name);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const meUser = await base44.auth.me();
      setMe(meUser);
      if (profile) {
        if (profileKind === 'participant') {
          const page = await base44.entities.ParticipantDocument.filter({ participant_id: profile.id, ...(documentType ? { document_type: documentType } : {}) }, { sort: '-created_date', limit: 50 });
          setMyDocs(page.items || []);
          setMyProfile(profile);
        } else {
          const [page, certPage] = await Promise.all([
            base44.entities.EmployeeDocument.filter({ employee_name: profile.full_name, status: { $ne: 'Archived' } }, { sort: 'expiry_date', limit: 50 }),
            base44.entities.Certificate.filter({ staff_name: profile.full_name, status: { $ne: 'Revoked' } }, { sort: 'expiry_date', limit: 50 }),
          ]);
          setDocs(page.items || []);
          setCerts(certPage.items || []);
          setStaff([profile.full_name]);
        }
        return;
      }
      if (meUser.role === 'Participant') {
        const [page, profilePage] = await Promise.allSettled([
          base44.entities.ParticipantDocument.filter({ participant_user_id: meUser.id }, { sort: '-created_date', limit: 50 }),
          base44.entities.ParticipantProfile.filter({ email: meUser.email }, { limit: 1 }),
        ]);
        setMyDocs(page.status === 'fulfilled' ? page.value.items || [] : []);
        setMyProfile(profilePage.status === 'fulfilled' ? (profilePage.value.items || [])[0] || null : null);
        return;
      }
      if (['Support Worker', 'Employee', 'user'].includes(meUser.role)) {
        // Support & employee staff manage their own documents only
        const page = await base44.entities.EmployeeDocument.filter(
          {
            $or: [
              ...(meUser.full_name ? [{ employee_name: meUser.full_name }] : []),
              ...(meUser.email ? [{ employee_email: meUser.email }] : []),
            ],
            status: { $ne: 'Archived' },
          },
          { sort: 'expiry_date', limit: 50 },
        );
        setDocs(page.items || []);
        return;
      }
      const results = await Promise.allSettled([
        base44.entities.EmployeeDocument.filter({ status: { $ne: 'Archived' } }, { sort: 'expiry_date', limit: 50 }),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 100, fields: ['full_name'] }),
        base44.entities.Certificate.filter({ status: { $ne: 'Revoked' } }, { sort: 'expiry_date', limit: 100, fields: ['module_title', 'staff_name', 'expiry_date', 'status'] }),
        base44.entities.ParticipantDocument.filter({}, { sort: '-created_date', limit: 100 }),
      ]);
      setDocs(results[0].status === 'fulfilled' ? results[0].value.items : []);
      setStaff(results[1].status === 'fulfilled' ? results[1].value.items.map((i) => i.full_name) : []);
      setCerts(results[2].status === 'fulfilled' ? results[2].value.items : []);
      setPdocs(results[3].status === 'fulfilled' ? results[3].value.items || [] : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.full_name, profileKind, documentType]);

  useEffect(() => { load(); }, [load]);

  // Real-time document & certificate updates
  useEffect(() => {
    const unsubEmp = base44.entities.EmployeeDocument.subscribe(() => { load(); });
    const unsubPart = base44.entities.ParticipantDocument.subscribe(() => { load(); });
    const unsubCert = base44.entities.Certificate.subscribe(() => { load(); });
    return () => {
      unsubEmp();
      unsubPart();
      unsubCert();
    };
  }, [load]);

  // Scroll to the section a module's Docs button asked for (e.g. ?focus=employee)
  useEffect(() => {
    if (!focus) return;
    // Legacy vault sections now live in their own modules; map them to today's sections.
    const anchors = { employee: 'staff-docs', business: 'vault-subject-business', policies: 'vault-subject-policies', registers: 'vault-subject-registers', company: 'vault-subject-business-doc', participant: 'vault-dashboard' };
    const timer = setTimeout(() => {
      document.getElementById(anchors[focus] || `vault-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
    return () => clearTimeout(timer);
  }, [focus, loading]);

  const remove = async (doc) => {
    if (!canEditDoc(doc)) return;
    if (!confirm('Delete this document?')) return;
    await logUserAction('Document Deleted', 'Employee Document', { record_id: doc.id, record_title: doc.title || doc.document_type || 'Document', person: { profile_type: 'employee', profile_name: doc.employee_name } });
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
      await Promise.all(targets.map((t) => logUserAction('Document Updated', 'Employee Document', { record_id: t.id, record_title: t.title || t.document_type || 'Document', details: `Status set to ${status} (bulk update)`, person: { profile_type: 'employee', profile_name: t.employee_name } })));
      await base44.entities.EmployeeDocument.bulkUpdate(targets.map((t) => ({ id: t.id, status })));
      setSelected([]);
      await load();
    } finally {
      setApplying(false);
    }
  };

  const viewDoc = async (doc) => {
    await openDocumentInViewer(doc);
  };

  const exportAll = async () => {
    const rows = await fetchAllRecords(base44.entities.EmployeeDocument, profile ? { employee_name: profile.full_name } : {}, '-created_date');
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
    <div className="vault-workspace compact-module mx-auto min-w-0 max-w-[1440px] space-y-3">
      {!embedded && <ModuleShell
        icon={FolderOpen}
        title="Document Vault"
        subtitle="Every Document, Real-Time 90/60/30/14-Day Expiry Tracking, Smart Mailroom & Data Control"
        moduleKey="documents"
        insightModule={!profile && !isParticipant ? 'documents' : undefined}
      />}

      {isParticipant ? (
        <div className="space-y-4">
          {myProfile && <p className="text-sm font-semibold">{myProfile.full_name} · {documentType || 'All participant documents, plans & registers'}</p>}
          <ParticipantVault docs={myDocs} loading={loading} viewDoc={viewDoc} me={me} profile={myProfile} onDone={load} />
        </div>
      ) : (
        <>
      {embedded && !profile && <RegisterInsights module="documents" recordsClassName="vault-record-count" />}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="vault-document-tabs">
          <TabsTrigger value="documents" data-hint="Employee, Participant, Business & Compliance Files">
            <FolderOpen className="h-3.5 w-3.5" />
            Every Document
          </TabsTrigger>
          {!profile && (
            <TabsTrigger value="registers-hub" data-hint="45 Auto-Updated Master Registers, Allied Health Catalogue & Health">
              <Sparkles className="h-3.5 w-3.5" />
              45 Master Registers &amp; Catalogue
            </TabsTrigger>
          )}
          {!profile && (
            <TabsTrigger value="universal-storage" data-hint="6-Destination Storage, Retention, Traceability & 4-Format Export">
              <FolderOpen className="h-3.5 w-3.5" />
              Universal Storage &amp; Export
            </TabsTrigger>
          )}
          {!profile && (
            <TabsTrigger value="record-intelligence" data-hint="Automated Classification, Cross-Module Linking & Routing">
              <Sparkles className="h-3.5 w-3.5" />
              Record Intelligence &amp; Routing
            </TabsTrigger>
          )}
          {!profile && (
            <TabsTrigger value="smart-mailroom" data-hint="AI Auto-Classify & Route Uploads">
              <Sparkles className="h-3.5 w-3.5" />
              Smart Mailroom
            </TabsTrigger>
          )}
          <TabsTrigger value="expiry-calendar" data-hint="90 / 60 / 30 / 14-Day Renewal Schedule">
            <CalendarDays className="h-3.5 w-3.5" />
            Expiry &amp; Renewal Calendar
          </TabsTrigger>
          {!profile && canViewUploads && (
            <TabsTrigger value="vault-uploads" data-hint="Bulk Upload, Form Templates & Official Libraries">
              <UploadCloud className="h-3.5 w-3.5" />
              Vault Uploads &amp; Templates
            </TabsTrigger>
          )}
          {!profile && canViewDataControl && (
            <TabsTrigger value="data-control" data-hint="Access Logs, Audits & Breach Register">
              <ShieldCheck className="h-3.5 w-3.5" />
              Data Control &amp; Breaches
            </TabsTrigger>
          )}
          {!profile && (
            <TabsTrigger value="controlled-forms-vault" data-hint="15 Vault Categories, 11-Section Forms & 2026 Printable Templates">
              <FolderOpen className="h-3.5 w-3.5" />
              15-Category Vault &amp; 2026 Templates
            </TabsTrigger>
          )}
          {!profile && (
            <TabsTrigger value="company-safe" data-hint="Business Identity, Credentials & Company Safe">
              <Lock className="h-3.5 w-3.5" />
              Company Safe
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="documents" className="mt-3 space-y-3">
          {!profile && (
            <StandardsEvidenceGapStrip
              onlyGaps={onlyGaps}
              onToggleOnlyGaps={() => setOnlyGaps((v) => !v)}
            />
          )}
          {!profile && <DocumentsDashboard role={me?.role} focus={focus} />}
      <div id="staff-docs" className="scroll-mt-24">
        <StaffDocumentToolbar profile={profile} staff={staff} scanning={scanning} scanMsg={scanMsg} onScan={runScan} onExport={exportAll} onAdd={() => { setEditing(null); setOpen(true); }} onDone={load} />
      </div>
        <EmployeeDocumentDialog
          open={open}
          onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}
          staff={staff}
          me={me}
          canPickEmployee={canManageAll && !profile}
          employeeName={profile?.full_name}
          initial={editing}
          onDone={load}
        />

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
          {docs
            .filter((d) => {
              if (!onlyGaps) return true;
              const days = d.expiry_date ? differenceInCalendarDays(new Date(d.expiry_date), new Date()) : 999;
              return d.status === 'Expired' || d.status === 'Expiring Soon' || days <= 30;
            })
            .map((d) => {
            const expired = d.expiry_date && differenceInCalendarDays(new Date(d.expiry_date), new Date()) < 0;
            return (
            <Card key={d.id} className={expired ? 'border-destructive/40' : 'border-border/60'}>
              <CardContent className="px-3 py-2">
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
                      <button
                        type="button"
                        onClick={() => viewDoc(d)}
                        className="truncate text-left font-semibold text-[#0A2B6D] hover:text-[#0072FF] hover:underline"
                      >
                        {d.title}
                      </button>
                      <p className="text-sm text-muted-foreground">{d.employee_name || 'Unassigned'} · {d.document_type}</p>
                    </div>
                  </div>
                  <Badge className={expiryTone(d.expiry_date)}>{d.status}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className={expired ? 'font-semibold text-destructive' : ''}>{d.expiry_date ? `Expires ${format(new Date(d.expiry_date), 'd MMM yyyy')}` : 'No expiry'}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" title="Open document" onClick={() => viewDoc(d)}>
                      <Eye className="mr-1 h-3.5 w-3.5" /> Open
                    </Button>
                    {canEditDoc(d) && (
                      <Button variant="ghost" size="icon" title="Edit document" onClick={() => { setEditing(d); setOpen(true); }}><Pencil className="h-4 w-4 text-foreground/60" /></Button>
                    )}
                    {canEditDoc(d) && <Button variant="ghost" size="icon" onClick={() => remove(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </div>
                </div>
                <div className="mt-2"><DocumentAcknowledgements entity="EmployeeDocument" documentId={d.id} title={d.title} /></div>
              </CardContent>
            </Card>
            );
          })}
        </div>
        </>
      )}

          {!profile && pdocs.length > 0 && (
            <div id="participant-docs" className="scroll-mt-24 space-y-2 rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[#0A2B6D]">Participant Documents in Vault ({pdocs.length})</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {pdocs.slice(0, 18).map((pd) => (
                  <Card key={pd.id} className="border-border/60">
                    <CardContent className="px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => viewDoc(pd)}
                            className="truncate text-left font-semibold text-[#0A2B6D] hover:text-[#0072FF] hover:underline"
                          >
                            {pd.title || pd.document_type}
                          </button>
                          <p className="text-xs text-muted-foreground">{pd.participant_name || 'Participant'} · {pd.document_type}</p>
                        </div>
                        <Badge className={expiryTone(pd.expiry_date || pd.review_date)}>{pd.status || 'Received'}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{pd.review_date ? `Review ${format(new Date(pd.review_date), 'd MMM yyyy')}` : pd.uploaded_date || ''}</span>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => viewDoc(pd)}>
                          <Eye className="mr-1 h-3.5 w-3.5" /> Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!profile && (
            <div className="space-y-4 pt-2">
              <BusinessDocumentsLibrary />
              <ReviewSchedulesPanel />
            </div>
          )}
        </TabsContent>

        {!profile && (
          <TabsContent value="registers-hub" className="mt-3 space-y-4">
            <CanonicalRegisterDeduplicationBar />
            <AlliedHealthAndNursingOsSuite />
            <UniversalRegisterManagementHubSuite />
          </TabsContent>
        )}
        {!profile && (
          <TabsContent value="universal-storage" className="mt-3 space-y-4">
            <UniversalDataStorageRetentionExportSuite />
            <FiveLayerEnterpriseAcceptanceSuite />
          </TabsContent>
        )}
        {!profile && (
          <TabsContent value="record-intelligence" className="mt-3 space-y-4">
            <UniversalRecordIntelligenceRoutingSuite />
          </TabsContent>
        )}
        {!profile && (
          <TabsContent value="smart-mailroom" className="mt-3">
            <SmartMailroomHub onFiled={load} />
          </TabsContent>
        )}

        <TabsContent value="expiry-calendar" className="mt-4 space-y-4">
          <ExpiryCalendar docs={docs} pdocs={pdocs} certs={certs} viewDoc={viewDoc} editable={canManageAll} onReschedule={load} />
          {!profile && <DocumentRenewalCalendar />}
        </TabsContent>

        {!profile && canViewUploads && (
          <TabsContent value="vault-uploads" className="mt-3 space-y-4">
            <div id="vault-vault" className="scroll-mt-24">
              <VaultUploads />
            </div>
            <ReviewFormTemplates />
          </TabsContent>
        )}

        {!profile && canViewDataControl && (
          <TabsContent value="data-control" className="mt-3">
            <DataControlPanel />
          </TabsContent>
        )}

        {!profile && (
          <TabsContent value="controlled-forms-vault" className="mt-3 space-y-4">
            <EnterpriseStandardQualityGateSuite />
            <Standard2026PrintableTemplatesSuite />
          </TabsContent>
        )}
        {!profile && (
          <TabsContent value="company-safe" className="mt-3">
            <CompanySafe embedded />
          </TabsContent>
        )}
      </Tabs>
        </>
      )}
    </div>
  );
}