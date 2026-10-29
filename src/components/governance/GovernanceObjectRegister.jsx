import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GovernanceObjectForm from '@/components/governance/GovernanceObjectForm';
import { LIFECYCLE_STAGES } from '@/lib/governanceFramework';
import { Loader2, Plus, Pencil } from 'lucide-react';

export default function GovernanceObjectRegister() {
  const [items, setItems] = useState(null);
  const [stage, setStage] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const query = stage === 'all' ? {} : { lifecycle_stage: stage };
    const page = await base44.entities.GovernanceObject.filter(query, { sort: '-updated_date', limit: 100 });
    setItems(page.items || []);
  };

  useEffect(() => {
    setItems(null);
    load().catch(() => setItems([]));
  }, [stage]);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item) => { setEditing(item); setFormOpen(true); };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">Universal Object Register</p>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="h-8 w-[190px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All lifecycle stages</SelectItem>
              {LIFECYCLE_STAGES.map((row) => <SelectItem key={row.key} value={row.key}>{row.key}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" />New governance object</Button>
      </div>

      {items === null ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#C084FC] bg-[#F5F0FF] p-8 text-center">
          <p className="text-sm font-bold text-[#0A2B6D]">No governance objects recorded yet</p>
          <p className="mx-auto mt-1 max-w-xl text-xs font-medium text-[#0A2B6D]">
            Start with a policy or a register entry. Each object carries its owner, version, related policy,
            procedure, plan, form and register, its risk, incident, feedback, audit and CAPA links, its evidence
            and its retention dates.
          </p>
          <Button size="sm" className="mt-3" onClick={openNew}><Plus className="h-4 w-4" />Create the first object</Button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                    {item.lifecycle_stage} · {item.document_category || 'Record'}
                  </p>
                  <p className="text-sm font-extrabold text-[#0A2B6D]">{item.title}</p>
                  <p className="text-[11px] font-semibold text-[#0A2B6D]">
                    {[item.object_code, item.version, item.status].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
              </div>
              <div className="mt-2 space-y-1 text-[11px] font-medium text-[#0A2B6D]">
                <p>Owner: {item.business_owner || 'Unassigned'} · Assigned to: {item.assigned_to_type}{item.assigned_to_name ? ` (${item.assigned_to_name})` : ''}</p>
                {item.related_policy && <p>Policy: {item.related_policy}</p>}
                {item.related_register && <p>Register: {item.related_register}</p>}
                <p>
                  Evidence: {(item.evidence_documents || []).length} document(s)
                  {item.signatures ? ' · signed' : ''}
                  {item.acknowledgements ? ' · acknowledged' : ''}
                </p>
                <p>Review: {item.review_date || 'not scheduled'} · Retention: {item.retention_period || 'not set'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <GovernanceObjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editing}
        onSaved={() => load().catch(() => setItems([]))}
      />
    </div>
  );
}