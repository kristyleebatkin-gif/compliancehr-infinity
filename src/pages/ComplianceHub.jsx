import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ShieldCheck, Scale, FileText, ExternalLink, Download, FilePlus, History } from 'lucide-react';
import { NewVersionDialog, PolicyHistoryDialog } from '@/components/compliance/PolicyVersions';
import ReviewFormTemplates from '@/components/compliance/ReviewFormTemplates';
import BulkEditBar from '@/components/documents/BulkEditBar';
import EmptyState from '@/components/EmptyState';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';

const exportPoliciesCsv = (policies) => downloadCsv('compliance-policy-register.csv', [
  { key: 'document_name', label: 'Document Name' },
  { key: 'category', label: 'Category' },
  { key: 'version', label: 'Version' },
  { key: 'status', label: 'Status' },
  { key: 'review_date', label: 'Review Date' },
  { key: 'approved_by', label: 'Approved By' },
  { key: 'description', label: 'Description' },
  { key: 'created_date', label: 'Created' },
], policies);

const exportRequirementsCsv = (requirements) => downloadCsv('legal-requirements-register.csv', [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'authority', label: 'Authority' },
  { key: 'status', label: 'Status' },
  { key: 'next_review', label: 'Next Review' },
  { key: 'purpose', label: 'Purpose / Obligation' },
  { key: 'official_url', label: 'Official URL' },
  { key: 'created_date', label: 'Created' },
], requirements);
import { format } from 'date-fns';
import Checklists from '@/pages/Checklists';
import ComplianceReadiness from '@/components/compliance/ComplianceReadiness';
import AuditsTab from '@/components/compliance/AuditsTab';
import MasterChecklist from '@/components/compliance/MasterChecklist';
import KitDrillChecklists from '@/components/compliance/KitDrillChecklists';
import VisitorSignInOut from '@/components/compliance/VisitorSignInOut';
import AuditReportList from '@/components/compliance/AuditReportList';
import SafetyTrendChart from '@/components/compliance/SafetyTrendChart';
import AuditPackButton from '@/components/compliance/AuditPackButton';
import BoardReportButton from '@/components/compliance/BoardReportButton';
import AuditArchiveButton from '@/components/compliance/AuditArchiveButton';
import ComplianceScore from '@/components/compliance/ComplianceScore';
import ControlEvidenceMap from '@/components/compliance/ControlEvidenceMap';
import ComplianceIssuesTab from '@/components/compliance/ComplianceIssuesTab';
import RiskStatusDashboard from '@/components/compliance/RiskStatusDashboard';
import PolicyAcknowledgements from '@/components/compliance/PolicyAcknowledgements';
import InternalAuditRegister from '@/components/compliance/InternalAuditRegister';
import ParticipantReviewRegister from '@/components/compliance/ParticipantReviewRegister';
import ConsentRegister from '@/components/compliance/ConsentRegister';
import CertificationCalendar from '@/components/compliance/CertificationCalendar';
import RiskHeatmap from '@/components/compliance/RiskHeatmap';
import StaffComplianceChart from '@/components/compliance/StaffComplianceChart';
import ComplianceGlobalSearch from '@/components/compliance/ComplianceGlobalSearch';
import ComplianceTaskActions from '@/components/compliance/ComplianceTaskActions';
import TaskKanban from '@/components/compliance/TaskKanban';
import StaffOnboardingTracker from '@/components/compliance/StaffOnboardingTracker';
import StaffBulkActions from '@/components/compliance/StaffBulkActions';
import ComplianceActivityFeed from '@/components/compliance/ComplianceActivityFeed';

const POLICY_CATEGORIES = ['Rights & Responsibilities', 'Privacy', 'Complaints', 'Incident Management', 'Risk Management', 'Medication', 'Human Resources', 'Emergency Management', 'Governance', 'Quality', 'Financial'];
const POLICY_STATUSES = ['Draft', 'Active', 'Under Review', 'Expired', 'Archived'];
const REQ_STATUSES = ['Current', 'Review Required', 'Superseded', 'Archived'];


export default function ComplianceHub() {
  const [policies, setPolicies] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pOpen, setPOpen] = useState(false);
  const [rOpen, setROpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pForm, setPForm] = useState({ document_name: '', category: 'Governance', version: '', review_date: '', status: 'Active', approved_by: '', description: '', content: '' });
  const [newVersionPolicy, setNewVersionPolicy] = useState(null);
  const [historyPolicy, setHistoryPolicy] = useState(null);
  const [rForm, setRForm] = useState({ title: '', category: '', jurisdiction: 'Australia', authority: '', purpose: '', status: 'Current', next_review: '', official_url: '' });
  const [selPolicies, setSelPolicies] = useState([]);
  const [applyingPolicies, setApplyingPolicies] = useState(false);

  const togglePolicy = (id, checked) => {
    setSelPolicies((s) => (checked ? [...s, id] : s.filter((x) => x !== id)));
  };

  // Bulk policy update: status on every selected policy, plus one shared version if entered.
  const bulkApplyPolicies = async ({ status, version }) => {
    const targets = policies.filter((p) => selPolicies.includes(p.id));
    if (!targets.length) return;
    setApplyingPolicies(true);
    try {
      await base44.entities.Policy.bulkUpdate(targets.map((t) => ({ id: t.id, status, ...(version ? { version } : {}) })));
      setSelPolicies([]);
      await load();
    } finally {
      setApplyingPolicies(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([
        base44.entities.Policy.filter({}, { sort: '-created_date', limit: 50 }),
        base44.entities.LegalRequirement.filter({}, { sort: '-created_date', limit: 50 }),
      ]);
      setPolicies(p.items);
      setRequirements(r.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const savePolicy = async () => {
    if (!pForm.document_name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Policy.create(pForm);
      setPForm({ document_name: '', category: 'Governance', version: '', review_date: '', status: 'Active', approved_by: '', description: '', content: '' });
      setPOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const saveRequirement = async () => {
    if (!rForm.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.LegalRequirement.create(rForm);
      setRForm({ title: '', category: '', jurisdiction: 'Australia', authority: '', purpose: '', status: 'Current', next_review: '', official_url: '' });
      setROpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entity, id) => {
    await entity.delete(id);
    await load();
  };

  const exportCorrectiveRegister = async () => {
    const rows = await fetchAllRecords(base44.entities.QualityItem, {}, '-created_date');
    downloadCsv('corrective-action-register.csv', [
      { key: 'title', label: 'Action' }, { key: 'type', label: 'Type' }, { key: 'source', label: 'Source' },
      { key: 'status', label: 'Status' }, { key: 'priority', label: 'Priority' }, { key: 'raised_by', label: 'Raised By' },
      { key: 'raised_date', label: 'Raised Date' }, { key: 'nominated_to', label: 'Nominated To' },
      { key: 'target_date', label: 'Target Date' }, { key: 'outcome', label: 'Outcome' },
    ], rows);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title="Compliance & Report Centre"
        subtitle="Policies, legal obligations and their review cycles."
        showAlerts={false}
        action={(
          <>
            <AuditPackButton />
            <BoardReportButton />
            <AuditArchiveButton />
            <Button variant="outline" onClick={exportCorrectiveRegister}>
              <Download className="mr-2 h-4 w-4" /> Corrective Action Register (CSV)
            </Button>
          </>
        )}
      />

      <ComplianceGlobalSearch />

      <RegisterInsights module="compliance" />

      <Tabs defaultValue="quick-tasks">
        <TabsList className="flex-wrap">
          <TabsTrigger value="quick-tasks">Quick Tasks</TabsTrigger>
          <TabsTrigger value="task-kanban">Task Kanban</TabsTrigger>
          <TabsTrigger value="issues">Compliance Issues</TabsTrigger>
          <TabsTrigger value="readiness">Readiness Dashboard</TabsTrigger>
          <TabsTrigger value="trend-charts">Trend Charts</TabsTrigger>
          <TabsTrigger value="risk-status">Risk &amp; Status Dashboard</TabsTrigger>
          <TabsTrigger value="master-checklist">Master Checklist</TabsTrigger>
          <TabsTrigger value="kits-drills">Kits &amp; Drills Checklists</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="visitors">Visitor Sign In/Out</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="requirements">Legal Requirements</TabsTrigger>
          <TabsTrigger value="checklists">Working Checklists</TabsTrigger>
          <TabsTrigger value="audit-report-list">Internal Audit Report List</TabsTrigger>
          <TabsTrigger value="standards-map">NDIS Standards Map</TabsTrigger>
          <TabsTrigger value="internal-audits">Internal Audit Register</TabsTrigger>
          <TabsTrigger value="participant-reviews">Participant Reviews</TabsTrigger>
          <TabsTrigger value="consents">Consent Register</TabsTrigger>
          <TabsTrigger value="form-templates">Form Templates</TabsTrigger>
          <TabsTrigger value="cert-renewals">Certification Renewals</TabsTrigger>
          <TabsTrigger value="staff-compliance">Staff Compliance</TabsTrigger>
          <TabsTrigger value="risk-heatmap">Risk Heatmap</TabsTrigger>
          <TabsTrigger value="onboarding-progress">Onboarding Progress</TabsTrigger>
          <TabsTrigger value="staff-bulk-actions">Staff Bulk Actions</TabsTrigger>
          <TabsTrigger value="activity-feed">Activity Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="mt-4">
          <ComplianceIssuesTab />
        </TabsContent>

        <TabsContent value="readiness" className="mt-4 space-y-4">
          <ComplianceScore />
          <ComplianceReadiness />
        </TabsContent>

        <TabsContent value="trend-charts" className="mt-4">
          <SafetyTrendChart />
        </TabsContent>

        <TabsContent value="quick-tasks" className="mt-4">
          <ComplianceTaskActions />
        </TabsContent>

        <TabsContent value="task-kanban" className="mt-4">
          <TaskKanban />
        </TabsContent>

        <TabsContent value="risk-status" className="mt-4">
          <RiskStatusDashboard />
        </TabsContent>

        <TabsContent value="master-checklist" className="mt-4">
          <MasterChecklist />
        </TabsContent>

        <TabsContent value="kits-drills" className="mt-4">
          <KitDrillChecklists />
        </TabsContent>

        <TabsContent value="audits" className="mt-4">
          <AuditsTab />
        </TabsContent>

        <TabsContent value="visitors" className="mt-4">
          <VisitorSignInOut />
        </TabsContent>

        <TabsContent value="policies" className="mt-4 space-y-4">
          <PolicyAcknowledgements policies={policies} />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => exportPoliciesCsv(policies)}><Download className="mr-2 h-4 w-4" /> Export Register (CSV)</Button>
            <Dialog open={pOpen} onOpenChange={setPOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add policy</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New policy</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-1.5"><Label>Document name *</Label><Input value={pForm.document_name} onChange={(e) => setPForm({ ...pForm, document_name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Category</Label>
                      <Select value={pForm.category} onValueChange={(v) => setPForm({ ...pForm, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{POLICY_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5"><Label>Status</Label>
                      <Select value={pForm.status} onValueChange={(v) => setPForm({ ...pForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{POLICY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Version</Label><Input value={pForm.version} onChange={(e) => setPForm({ ...pForm, version: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Review date</Label><Input type="date" value={pForm.review_date} onChange={(e) => setPForm({ ...pForm, review_date: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-1.5"><Label>Approved by</Label><Input value={pForm.approved_by} onChange={(e) => setPForm({ ...pForm, approved_by: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Description</Label><Input value={pForm.description} onChange={(e) => setPForm({ ...pForm, description: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Policy content</Label><Textarea rows={6} value={pForm.content} onChange={(e) => setPForm({ ...pForm, content: e.target.value })} placeholder="The full policy text — versions of this content are diffable later" /></div>
                  <Button onClick={savePolicy} disabled={saving || !pForm.document_name.trim()}>Save policy</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : policies.length === 0 ? (
            <EmptyState icon={FileText} modulePath="/compliance" title="No policies yet" message="Add your first policy to the register." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {selPolicies.length > 0 && (
                <div className="md:col-span-2">
                  <BulkEditBar
                    count={selPolicies.length}
                    applying={applyingPolicies}
                    onApply={bulkApplyPolicies}
                    onClear={() => setSelPolicies([])}
                    options={POLICY_STATUSES.map((s) => ({ value: s, label: s }))}
                    showVersion
                  />
                </div>
              )}
              {policies.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-[hsl(var(--primary))]"
                          checked={selPolicies.includes(p.id)}
                          onChange={(e) => togglePolicy(p.id, e.target.checked)}
                        />
                        <div className="rounded-lg bg-muted p-2"><FileText className="h-5 w-5 text-muted-foreground" /></div>
                        <div>
                          <p className="font-semibold">{p.document_name}</p>
                          <p className="text-sm text-muted-foreground">{p.category}{p.version ? ` · v${p.version}` : ''}</p>
                        </div>
                      </div>
                      <Badge className={statusTone(p.status)}>{p.status}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{p.review_date ? `Review due ${format(new Date(p.review_date), 'd MMM yyyy')}` : 'No review date set'}</span>
                      <span className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setNewVersionPolicy(p)}><FilePlus className="mr-1 h-3.5 w-3.5" /> New version</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setHistoryPolicy(p)}><History className="mr-1 h-3.5 w-3.5" /> History &amp; diff</Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(base44.entities.Policy, p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requirements" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => exportRequirementsCsv(requirements)}><Download className="mr-2 h-4 w-4" /> Export Register (CSV)</Button>
            <Dialog open={rOpen} onOpenChange={setROpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add requirement</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New legal requirement</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-1.5"><Label>Title *</Label><Input value={rForm.title} onChange={(e) => setRForm({ ...rForm, title: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Category</Label><Input value={rForm.category} onChange={(e) => setRForm({ ...rForm, category: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Jurisdiction</Label><Input value={rForm.jurisdiction} onChange={(e) => setRForm({ ...rForm, jurisdiction: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Authority</Label><Input value={rForm.authority} onChange={(e) => setRForm({ ...rForm, authority: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Status</Label>
                      <Select value={rForm.status} onValueChange={(v) => setRForm({ ...rForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{REQ_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-1.5"><Label>Purpose / obligation</Label><Input value={rForm.purpose} onChange={(e) => setRForm({ ...rForm, purpose: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Next review</Label><Input type="date" value={rForm.next_review} onChange={(e) => setRForm({ ...rForm, next_review: e.target.value })} /></div>
                    <div className="grid gap-1.5"><Label>Official URL</Label><Input value={rForm.official_url} onChange={(e) => setRForm({ ...rForm, official_url: e.target.value })} /></div>
                  </div>
                  <Button onClick={saveRequirement} disabled={saving || !rForm.title.trim()}>Save requirement</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : requirements.length === 0 ? (
            <EmptyState icon={Scale} modulePath="/compliance" title="No legal requirements tracked yet" message="Track your first legal obligation to keep the register current." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {requirements.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted p-2"><Scale className="h-5 w-5 text-muted-foreground" /></div>
                        <div>
                          <p className="font-semibold">{r.title}</p>
                          <p className="text-sm text-muted-foreground">{[r.category, r.jurisdiction, r.authority].filter(Boolean).join(' · ')}</p>
                        </div>
                      </div>
                      <Badge className={statusTone(r.status)}>{r.status}</Badge>
                    </div>
                    {r.purpose && <p className="mt-2 text-sm text-muted-foreground">{r.purpose}</p>}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{r.next_review ? `Next review ${format(new Date(r.next_review), 'd MMM yyyy')}` : ''}</span>
                      <span className="flex items-center gap-1">
                        {safeUrl(r.official_url) && <a href={safeUrl(r.official_url)} target="_blank" rel="noreferrer" className="inline-flex"><ExternalLink className="h-4 w-4" /></a>}
                        <Button variant="ghost" size="icon" onClick={() => remove(base44.entities.LegalRequirement, r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="standards-map" className="mt-4">
          <ControlEvidenceMap />
        </TabsContent>

        <TabsContent value="audit-report-list" className="mt-4">
          <AuditReportList />
        </TabsContent>

        <TabsContent value="internal-audits" className="mt-4">
          <InternalAuditRegister />
        </TabsContent>

        <TabsContent value="participant-reviews" className="mt-4">
          <ParticipantReviewRegister />
        </TabsContent>

        <TabsContent value="consents" className="mt-4">
          <ConsentRegister />
        </TabsContent>

        <TabsContent value="form-templates" className="mt-4">
          <ReviewFormTemplates />
        </TabsContent>

        <TabsContent value="checklists" className="mt-4">
          <Checklists />
        </TabsContent>

        <TabsContent value="cert-renewals" className="mt-4">
          <CertificationCalendar />
        </TabsContent>

        <TabsContent value="staff-compliance" className="mt-4">
          <StaffComplianceChart />
        </TabsContent>

        <TabsContent value="risk-heatmap" className="mt-4">
          <RiskHeatmap />
        </TabsContent>

        <TabsContent value="onboarding-progress" className="mt-4">
          <StaffOnboardingTracker />
        </TabsContent>

        <TabsContent value="staff-bulk-actions" className="mt-4">
          <StaffBulkActions />
        </TabsContent>

        <TabsContent value="activity-feed" className="mt-4">
          <ComplianceActivityFeed />
        </TabsContent>
      </Tabs>

      <NewVersionDialog policy={newVersionPolicy} open={!!newVersionPolicy} onOpenChange={(o) => { if (!o) setNewVersionPolicy(null); }} onChanged={load} />
      <PolicyHistoryDialog policy={historyPolicy} open={!!historyPolicy} onOpenChange={(o) => { if (!o) setHistoryPolicy(null); }} />
    </div>
  );
}