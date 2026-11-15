import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Link2, Plus, Trash2, Loader2 } from 'lucide-react';
import NewLinkDialog from '@/components/graph/NewLinkDialog';

export default function LinkRegisterPanel({ links, recordsByType, tenantId, onChanged }) {
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const remove = async (id) => {
    setError('');
    setBusyId(id);
    try {
      await base44.entities.KnowledgeLink.delete(id);
      await onChanged();
    } catch (err) {
      setError(err?.message || 'The link could not be removed.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-primary">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold text-[#0A2B6D]">Links register · {links.length} recorded</p>
          <p className="text-[11px] font-semibold text-[#0A2B6D]/75">
            Links derived from record fields are calculated on the fly and are not stored here. Anything stored in this
            register is a deliberate connection you have made, and the graph displays it as a declared relationship requiring review.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5" />New link</Button>
      </div>

      {links.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-[#C084FC] bg-[#F5F0FF] p-4 text-center text-xs font-bold text-[#0A2B6D]">
          No links have been recorded by hand yet. Everything the graph shows is currently derived from the reference
          fields already stored on your records.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">From</th>
                <th className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">Relationship</th>
                <th className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">To</th>
                <th className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">Why</th>
                <th className="px-2.5 py-1.5 text-right font-extrabold text-[#0A2B6D]"> </th>
              </tr>
            </thead>
            <tbody>
              {links.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-2.5 py-1.5 font-bold text-[#0A2B6D]">{row.from_label || `${row.from_type} record`}</td>
                  <td className="px-2.5 py-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#C084FC] px-1.5 py-0.5 text-[10px] font-bold text-[#5A00D6]">
                      <Link2 className="h-2.5 w-2.5" />{row.relationship}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 font-bold text-[#0A2B6D]">{row.to_label || `${row.to_type} record`}</td>
                  <td className="px-2.5 py-1.5 font-semibold text-[#0A2B6D]/75">{row.reason || '—'}</td>
                  <td className="px-2.5 py-1.5 text-right">
                    <Button size="sm" variant="ghost" onClick={() => remove(row.id)} disabled={busyId === row.id}>
                      {busyId === row.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 text-[#FF2E9A]" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewLinkDialog
        open={open}
        onOpenChange={setOpen}
        recordsByType={recordsByType}
        tenantId={tenantId}
        onSaved={onChanged}
      />
    </div>
  );
}