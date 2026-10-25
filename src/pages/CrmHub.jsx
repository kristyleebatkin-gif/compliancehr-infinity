import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, Plus, Trash2, Flame, Trophy, Bell, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { downloadCsv } from '@/lib/csvExport';

const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
const STAGE_TONES = {
  New: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  Contacted: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  'Proposal Sent': 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  Negotiation: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Won: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Lost: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
};
const STAGE_BORDERS = {
  New: 'border-l-sky-500', Contacted: 'border-l-blue-500', 'Proposal Sent': 'border-l-violet-500',
  Negotiation: 'border-l-amber-500', Won: 'border-l-emerald-500', Lost: 'border-l-rose-400',
};
const OPEN_STAGES = STAGES.slice(0, 4);
const today = () => new Date().toISOString().slice(0, 10);
const money = (v) => `$${Number(v || 0).toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;

export default function CrmHub({ embedded = false } = {}) {
  const { toast } = useToast();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allocating, setAllocating] = useState(null); // lead id with the allocate panel open
  const [allocForm, setAllocForm] = useState({ name: '', email: '', due_date: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const [page, userPage] = await Promise.all([
      base44.entities.Lead.filter({}, { sort: '-created_date', limit: 200 }),
      base44.entities.User.list(),
    ]);
    setLeads(page.items || []);
    setUsers(userPage.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setSaving(true);
    await base44.entities.Lead.create({
      business_name: f.get('business_name'),
      contact_name: f.get('contact_name'),
      email: f.get('email'),
      phone: f.get('phone'),
      source: f.get('source'),
      service_interest: f.get('service_interest'),
      value: Number(f.get('value') || 0),
      stage: 'New',
      follow_up_date: f.get('follow_up_date'),
      owner: f.get('owner'),
      notes: f.get('notes'),
    });
    setSaving(false);
    setShowForm(false);
    load();
  };

  // Attach a follow-up to a lead: creates a task for the allocated person,
  // alerts them in-app and by email, and records the allocation on the lead.
  const allocateFollowUp = async (lead) => {
    if (!allocForm.name) { toast({ title: 'Choose who to allocate' }); return; }
    const due = allocForm.due_date || lead.follow_up_date || today();
    const task = await base44.entities.TodoTask.create({
      title: `Follow up lead: ${lead.business_name}`,
      task_type: 'Lead Follow-up',
      module: 'CRM & Leads',
      assigned_to: allocForm.name,
      assigned_email: allocForm.email || '',
      due_date: due,
      status: 'Open',
      priority: 'Medium',
      linked_entity_type: 'Lead',
      linked_entity_id: lead.id,
      notes: `Follow up the enquiry from ${lead.contact_name || lead.business_name}${lead.phone ? ` on ${lead.phone}` : ''}${lead.email ? `, ${lead.email}` : ''}. Stage: ${lead.stage}.`,
    });
    await base44.entities.Lead.update(lead.id, { follow_up_allocated_to: allocForm.name, follow_up_task_id: task?.id || '' });
    await base44.entities.Notification.create({
      type: 'Lead Follow-up',
      recipient: allocForm.name,
      message: `Lead follow-up allocated: ${lead.business_name} (due ${due})`,
      read: false,
      linked_entity_type: 'Lead',
      linked_entity_id: lead.id,
    }).catch(() => {});
    if (allocForm.email) {
      await base44.functions.invoke('sendAppEmail', {
        to: allocForm.email,
        subject: `Lead follow-up allocated: ${lead.business_name}`,
        body: `Hi ${allocForm.name},\n\nYou have been allocated a follow-up for the lead "${lead.business_name}"${lead.contact_name ? ` (contact: ${lead.contact_name})` : ''}, due ${due}.\n\nOpen the Tasks module to track it, and update your progress as you go.\n\nThank you.`,
      }).catch(() => {});
    }
    setAllocating(null);
    setAllocForm({ name: '', email: '', due_date: '' });
    toast({ title: 'Follow-up allocated', description: 'Task created, person alerted, and the lead updated.' });
    load();
  };

  const setStage = async (lead, stage) => {
    const patch = { stage };
    if (stage === 'Won') patch.won_date = today();
    await base44.entities.Lead.update(lead.id, patch);
    load();
  };

  const pipelineValue = leads.filter((l) => OPEN_STAGES.includes(l.stage)).reduce((t, l) => t + Number(l.value || 0), 0);
  const wonValue = leads.filter((l) => l.stage === 'Won').reduce((t, l) => t + Number(l.value || 0), 0);
  const wonCount = leads.filter((l) => l.stage === 'Won').length;
  const closedCount = leads.filter((l) => ['Won', 'Lost'].includes(l.stage)).length;
  const followUpsDue = leads.filter((l) => OPEN_STAGES.includes(l.stage) && l.follow_up_date && l.follow_up_date <= today());

  const exportLeads = () => downloadCsv('crm-leads.csv', [
    { label: 'Business', key: 'business_name' }, { label: 'Contact', key: 'contact_name' }, { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' }, { label: 'Source', key: 'source' }, { label: 'Value', key: 'value' },
    { label: 'Stage', key: 'stage' }, { label: 'Follow up', key: 'follow_up_date' }, { label: 'Owner', key: 'owner' },
  ], leads);

  return (
    <div className="space-y-4">
      <ModuleShell
        embedded={embedded}
        title="CRM & Leads"
        subtitle="Track every enquiry through the sales pipeline: enquiries, proposals, wins and follow-ups."
        icon={Briefcase}
        moduleKey="crm"
        actions={<>
          <Button size="sm" variant="outline" className="border-border bg-white text-black" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" />Add lead</Button>
          <Button size="sm" variant="outline" className="border-border bg-white text-black" onClick={exportLeads}>Export CSV</Button>
        </>}
        small={[
          ['Open pipeline value', money(pipelineValue)],
          ['Won revenue', money(wonValue)],
          ['Win rate', closedCount > 0 ? `${Math.round((wonCount / closedCount) * 100)}%` : 'n/a'],
          ['Follow-ups due', followUpsDue.length],
        ].map(([label, value]) => (
          <div key={label}><p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value}</p></div>
        ))}
      />

      {followUpsDue.length > 0 && (
        <Card className="border-warning/40 bg-warning/5"><CardContent className="p-4">
          <p className="flex items-center gap-2 text-sm font-bold"><Flame className="h-4 w-4 text-warning" />Follow-ups due today ({followUpsDue.length})</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {followUpsDue.map((l) => (
              <span key={l.id} className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium">
                {l.business_name} - {l.follow_up_date.slice(0, 10)} - {l.phone || l.email || 'no contact details'}
              </span>
            ))}
          </div>
        </CardContent></Card>
      )}

      {showForm && (
        <Card><CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={save}>
            <div className="grid gap-1.5"><Label>Business / participant name *</Label><Input name="business_name" required /></div>
            <div className="grid gap-1.5"><Label>Contact person</Label><Input name="contact_name" /></div>
            <div className="grid gap-1.5"><Label>Email</Label><Input name="email" type="email" /></div>
            <div className="grid gap-1.5"><Label>Phone</Label><Input name="phone" /></div>
            <div className="grid gap-1.5"><Label>Source</Label>
              <select name="source" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                {['Website', 'Word of Mouth', 'Referral', 'NDIS Plan Manager', 'Google', 'Social Media', 'Event', 'Other'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5"><Label>Estimated value ($)</Label><Input name="value" type="number" min="0" step="0.01" /></div>
            <div className="grid gap-1.5"><Label>Services interested in</Label><Input name="service_interest" /></div>
            <div className="grid gap-1.5"><Label>Follow up date</Label><Input name="follow_up_date" type="date" /></div>
            <div className="grid gap-1.5"><Label>Owner</Label><Input name="owner" /></div>
            <div className="grid gap-1.5"><Label>Notes</Label><Input name="notes" /></div>
            <div className="flex gap-2 md:col-span-2">
              <Button size="sm" type="submit" disabled={saving}>Save lead</Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </CardContent></Card>
      )}

      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading pipeline...</CardContent></Card>
      ) : leads.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No leads yet. Add your first enquiry to start the pipeline.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage);
            return (
              <div key={stage} className="space-y-2">
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 font-semibold ${STAGE_TONES[stage]}`}>
                  <p className="text-xs font-bold uppercase tracking-wide">{stage}</p>
                  <span className="text-xs">{stageLeads.length}</span>
                </div>
                {stageLeads.map((l) => (
                  <React.Fragment key={l.id}>
                  <Card className={`border-l-4 shadow-sm transition hover:shadow-md ${STAGE_BORDERS[l.stage]}`}><CardContent className="space-y-2 p-3">
                    <p className="text-sm font-semibold">{l.business_name}</p>
                    <p className="text-xs text-muted-foreground">{l.contact_name || l.email || l.phone || ''}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-safe">{l.value ? money(l.value) : ''}</span>
                      {l.follow_up_date && <span className="text-[11px] text-muted-foreground">Follow up {l.follow_up_date.slice(0, 10)}</span>}
                    </div>
                    {l.follow_up_allocated_to && (
                      <p className="text-[11px] font-semibold text-brand">Follow-up: {l.follow_up_allocated_to}</p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <select
                        className="h-7 flex-1 rounded-md border border-input bg-transparent px-1.5 text-xs"
                        value={l.stage}
                        onChange={(e) => setStage(l, e.target.value)}
                      >
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setAllocating(allocating === l.id ? null : l.id); setAllocForm({ name: l.follow_up_allocated_to || '', email: '', due_date: l.follow_up_date || '' }); }}>
                        <UserPlus className="h-3.5 w-3.5 text-brand" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-danger" onClick={async () => { await base44.entities.Lead.delete(l.id); load(); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent></Card>
                  {allocating === l.id && (
                    <Card className="border-brand/40 bg-brand/5"><CardContent className="space-y-2 p-3">
                      <p className="flex items-center gap-1.5 text-xs font-bold"><Bell className="h-3.5 w-3.5 text-brand" />Allocate follow-up</p>
                      <select
                        className="h-8 w-full rounded-md border border-input bg-card px-2 text-xs"
                        value={allocForm.name}
                        onChange={(e) => { const u = users.find((x) => x.full_name === e.target.value); setAllocForm({ ...allocForm, name: e.target.value, email: u?.email || '' }); }}
                      >
                        <option value="">Choose a person...</option>
                        {users.map((u) => <option key={u.id} value={u.full_name}>{u.full_name || u.email}</option>)}
                      </select>
                      <Input className="h-8 text-xs" type="date" value={allocForm.due_date} onChange={(e) => setAllocForm({ ...allocForm, due_date: e.target.value })} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => allocateFollowUp(l)}>Allocate &amp; alert</Button>
                        <Button size="sm" variant="outline" onClick={() => setAllocating(null)}>Cancel</Button>
                      </div>
                    </CardContent></Card>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}