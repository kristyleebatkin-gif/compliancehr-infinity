import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, Plus, Trash2, Flame, Trophy } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';

const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
const OPEN_STAGES = STAGES.slice(0, 4);
const today = () => new Date().toISOString().slice(0, 10);
const money = (v) => `$${Number(v || 0).toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;

export default function CrmHub() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const page = await base44.entities.Lead.filter({}, { sort: '-created_date', limit: 200 });
    setLeads(page.items || []);
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
    <div className="space-y-6">
      <PageHeader
        title="CRM & Leads"
        subtitle="Track every enquiry through the sales pipeline: enquiries, proposals, wins and follow-ups."
        icon={Briefcase}
        accent={['#16a34a', '#0d9488']}
        action={<div className="flex gap-2">
          <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />Add lead</Button>
          <Button size="sm" variant="outline" onClick={exportLeads}>Export CSV</Button>
        </div>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Open pipeline value', value: money(pipelineValue) },
          { label: 'Won revenue', value: money(wonValue), icon: Trophy },
          { label: 'Win rate', value: closedCount > 0 ? `${Math.round((wonCount / closedCount) * 100)}%` : 'n/a' },
          { label: 'Follow-ups due', value: followUpsDue.length, icon: Flame },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              {s.icon && <s.icon className="h-4 w-4 text-brand" />}
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

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
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide">{stage}</p>
                  <span className="text-xs text-muted-foreground">{stageLeads.length}</span>
                </div>
                {stageLeads.map((l) => (
                  <Card key={l.id}><CardContent className="space-y-2 p-3">
                    <p className="text-sm font-semibold">{l.business_name}</p>
                    <p className="text-xs text-muted-foreground">{l.contact_name || l.email || l.phone || ''}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-safe">{l.value ? money(l.value) : ''}</span>
                      {l.follow_up_date && <span className="text-[11px] text-muted-foreground">Follow up {l.follow_up_date.slice(0, 10)}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        className="h-7 flex-1 rounded-md border border-input bg-transparent px-1.5 text-xs"
                        value={l.stage}
                        onChange={(e) => setStage(l, e.target.value)}
                      >
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-danger" onClick={async () => { await base44.entities.Lead.delete(l.id); load(); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}