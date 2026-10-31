import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DocumentControlForm from '@/components/governance/DocumentControlForm';
import { DOCUMENT_STATUSES } from '@/lib/governanceFramework';
import { fetchAllRecords } from '@/lib/csvExport';
import { CheckCircle2, Copy, Loader2, Pencil, Plus } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

const nextVersion = (version = 'v1.0') => {
  const match = /^v(\d+)\.(\d+)$/.exec(version.trim());
  if (!match) return `${version}-next`;
  return `v${Number(match[1]) + 1}.0`;
};

export default function DocumentControlRegister() {
  const [items, setItems] = useState(null);
  const [status, setStatus] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const query = status === 'all' ? {} : { status };
    const rows = await fetchAllRecords(base44.entities.DocumentControl, query, '-updated_date');
    setItems(rows);
  };

  useEffect(() => {
    setItems(null);
    load().catch(() => setItems([]));
  }, [status]);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item) => { setEditing(item); setFormOpen(true); };

  const apply = async (item, patch) => {
    setBusyId(item.id);
    try {
      await base44.entities.DocumentControl.update(item.id, patch);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const approve = async (item) => {
    const me = await base44.auth.me().catch(() => null);
    await apply(item, {
      status: 'Approved',
      approved_by: me?.full_name || me?.email || 'Approver',
      approval_date: today(),
    });
  };

  const createVersion = async (item) => {
    setBusyId(item.id);
    try {
      const { id, created_date, updated_date, created_by_id, ...rest } = item;
      await base44.entities.DocumentControl.create({
        ...rest,
        version: nextVersion(item.version),
        status: 'Draft',
        approved_by: '',
        approval_date: undefined,
        superseded_version: item.version,
      });
      await base44.entities.DocumentControl.update(id, { status: 'Superseded', superseded_version: nextVersion(item.version) });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">Document Control Register</p>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {DOCUMENT_STATUSES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" />New controlled document</Button>
      </div>

      <p className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] px-3 py-2 text-[11px] font-semibold text-[#0A2B6D]">
        New documents are created in Draft. A document only becomes live once it is approved, which records the
        approver and the approval date. Superseding a document keeps the previous version on file for audit.
      </p>

      {items === null ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#C084FC] bg-[#F5F0FF] p-8 text-center">
          <p className="text-sm font-bold text-[#0A2B6D]">No controlled documents recorded yet</p>
          <p className="mx-auto mt-1 max-w-xl text-xs font-medium text-[#0A2B6D]">
            Record each policy, procedure and form with its document ID, owner, version and review date so approval
            history and superseded versions stay auditable.
          </p>
          <Button size="sm" className="mt-3" onClick={openNew}><Plus className="h-4 w-4" />Add the first document</Button>
        </div>
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                    {item.document_id} · {item.document_category}
                  </p>
                  <p className="text-sm font-extrabold text-[#0A2B6D]">{item.title}</p>
                  <p className="text-[11px] font-semibold text-[#0A2B6D]">
                    {item.version} · {item.status}
                    {item.business_unit ? ` · ${item.business_unit}` : ''}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
              </div>

              <p className="mt-1.5 text-[11px] font-medium text-[#0A2B6D]">
                Owner: {item.owner || 'unassigned'} · Approved by: {item.approved_by || 'not approved'}
                {item.approval_date ? ` (${item.approval_date})` : ''}
              </p>
              <p className="text-[11px] font-medium text-[#0A2B6D]">
                Review: {item.review_date || 'not scheduled'}
                {item.superseded_version ? ` · Superseded by ${item.superseded_version}` : ''}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Draft', 'Review'].includes(item.status) && (
                  <Button size="sm" variant="secondary" disabled={busyId === item.id} onClick={() => apply(item, { status: 'Review' })}>
                    {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}Submit for review
                  </Button>
                )}
                {item.status === 'Review' && (
                  <Button size="sm" disabled={busyId === item.id} onClick={() => approve(item)}>
                    <CheckCircle2 className="h-3.5 w-3.5" />Approve
                  </Button>
                )}
                {item.status === 'Approved' && (
                  <Button size="sm" variant="secondary" disabled={busyId === item.id} onClick={() => apply(item, { status: 'Archived' })}>
                    Archive
                  </Button>
                )}
                {['Approved', 'Archived'].includes(item.status) && (
                  <Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => createVersion(item)}>
                    <Copy className="h-3.5 w-3.5" />New version
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentControlForm
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editing}
        onSaved={() => load().catch(() => setItems([]))}
      />
    </div>
  );
}