import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, ShieldCheck, Scale, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Checklists from '@/pages/Checklists';
import ComplianceReadiness from '@/components/compliance/ComplianceReadiness';
import AuditsTab from '@/components/compliance/AuditsTab';
import MasterChecklist from '@/components/compliance/MasterChecklist';
import KitDrillChecklists from '@/components/compliance/KitDrillChecklists';
import VisitorSignInOut from '@/components/compliance/VisitorSignInOut';
import AuditReportList from '@/components/compliance/AuditReportList';
import SafetyTrendChart from '@/components/compliance/SafetyTrendChart';

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
  const [pForm, setPForm] = useState({ document_name: '', category: 'Governance', version: '', review_date: '', status: 'Active', approved_by: '', description: '' });
  const [rForm, setRForm] = useState({ title: '', category: '', jurisdiction: 'Australia', authority: '', purpose: '', status: 'Current', next_review: '', official_url: '' });

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
      setPForm({ document_name: '', category: 'Governance', version: '', review_date: '', status: 'Active', approved_by: '', description: '' });
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

  return (
    <div className="space-y-6">
      <PageHeader icon={ShieldCheck} title="Compliance & Report Centre" subtitle="Policies, legal obligations and their review cycles." showAlerts={false} />

      <Tabs defaultValue="readiness">
        <TabsList className="flex-wrap">
          <TabsTrigger value="readiness">Readiness Dashboard</TabsTrigger>
          <TabsTrigger value="trend-charts">Trend Charts</TabsTrigger>
          <TabsTrigger value="master-checklist">Master Checklist</TabsTrigger>
          <TabsTrigger value="kits-drills">Kits &amp; Drills Checklists</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="visitors">Visitor Sign In/Out</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="requirements">Legal Requirements</TabsTrigger>
          <TabsTrigger value="checklists">Working Checklists</TabsTrigger>
          <TabsTrigger value="audit-report-list">Internal Audit Report List</TabsTrigger>
        </TabsList>

        <TabsContent value="readiness" className="mt-4">
          <ComplianceReadiness />
        </TabsContent>

        <TabsContent value="trend-charts" className="mt-4">
          <SafetyTrendChart />
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
          <div className="flex">
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
                  <Button onClick={savePolicy} disabled={saving || !pForm.document_name.trim()}>Save policy</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : policies.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No policies yet. Add your first one above.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {policies.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
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
                      <Button variant="ghost" size="icon" onClick={() => remove(base44.entities.Policy, p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requirements" className="mt-4 space-y-4">
          <div className="flex">
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
            <Card><CardContent className="p-10 text-center text-muted-foreground">No legal requirements tracked yet.</CardContent></Card>
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
                        {r.official_url && <a href={r.official_url} target="_blank" rel="noreferrer" className="inline-flex"><ExternalLink className="h-4 w-4" /></a>}
                        <Button variant="ghost" size="icon" onClick={() => remove(base44.entities.LegalRequirement, r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit-report-list" className="mt-4">
          <AuditReportList />
        </TabsContent>

        <TabsContent value="checklists" className="mt-4">
          <Checklists />
        </TabsContent>
      </Tabs>
    </div>
  );
}