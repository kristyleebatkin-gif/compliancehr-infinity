import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LINK_TYPES, linksFor, typeMeta } from '@/lib/universalLinkEngine';
import { Link2 } from 'lucide-react';

export default function RecordLinkExplorer({ recordsByType, index }) {
  const [typeKey, setTypeKey] = useState('policy');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const type = typeMeta(typeKey);
  const records = recordsByType[typeKey] || [];

  const choices = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return records
      .filter((record) => {
        if (!needle) return true;
        const title = type.title(record) || '';
        const detail = type.detail(record) || '';
        return `${title} ${detail}`.toLowerCase().includes(needle);
      })
      .slice(0, 60);
  }, [records, search, type]);

  const activeId = selectedId && records.some((record) => record.id === selectedId) ? selectedId : choices[0]?.id || '';
  const nodeId = activeId ? `${typeKey}:${activeId}` : '';
  const links = nodeId ? linksFor(index, nodeId) : [];
  const focus = nodeId ? index.byId.get(nodeId) : null;

  const grouped = useMemo(() => {
    const map = new Map();
    links.forEach((entry) => {
      if (!map.has(entry.node.type)) map.set(entry.node.type, []);
      map.get(entry.node.type).push(entry);
    });
    return [...map.entries()];
  }, [links]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A00D6]">Object type</p>
          <Select
            value={typeKey}
            onValueChange={(value) => { setTypeKey(value); setSelectedId(''); setSearch(''); }}
          >
            <SelectTrigger className="h-8 w-[190px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {LINK_TYPES.map((option) => <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A00D6]">Find a record</p>
          <Input className="h-8 w-[210px] text-xs" placeholder="Search this type" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="min-w-[240px] flex-1 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A00D6]">Record</p>
          <Select value={activeId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={choices.length ? 'Choose a record' : 'No records in this type yet'} /></SelectTrigger>
            <SelectContent>
              {choices.map((record) => (
                <SelectItem key={record.id} value={record.id}>{type.title(record) || 'Untitled record'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!focus ? (
        <p className="rounded-xl border-2 border-dashed border-[#C084FC] bg-[#F5F0FF] p-4 text-center text-xs font-bold text-[#0A2B6D]">
          No {type.label.toLowerCase()} recorded yet, so there is nothing to link. Create one in {type.path} and its links appear here automatically.
        </p>
      ) : (
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">{type.label}</p>
              <p className="text-sm font-extrabold text-[#0A2B6D]">{type.title(focus.record) || 'Untitled record'}</p>
              <p className="text-[11px] font-semibold text-[#0A2B6D]">
                {[type.detail(focus.record), type.status(focus.record), type.date(focus.record)].filter(Boolean).join(' · ')}
              </p>
            </div>
            <span className="rounded-full bg-[#0A2B6D] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
              {links.length} live link{links.length === 1 ? '' : 's'}
            </span>
          </div>

          {links.length === 0 ? (
            <p className="mt-2 rounded-lg border border-[#FF2E9A] bg-[#F5F0FF] p-2 text-[11px] font-semibold text-[#0A2B6D]">
              This record shares no participant, person, document reference, standard or subject with another object yet.
              Record the participant or staff member on it, or name the policy, procedure or register it belongs to,
              and the links build themselves.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {grouped.map(([groupType, entries]) => {
                const meta = typeMeta(groupType);
                return (
                  <div key={groupType} className="rounded-lg border border-[#C084FC]/60 bg-[#F5F0FF] p-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">{meta.label} · {entries.length}</p>
                    <div className="mt-1 space-y-1">
                      {entries.map((entry) => (
                        <div key={entry.node.id} className="flex flex-wrap items-center justify-between gap-1.5 rounded-md bg-white px-2 py-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <Link2 className="h-3 w-3 shrink-0 text-[#A100FF]" />
                            <span className="min-w-0 truncate text-[11px] font-bold text-[#0A2B6D]">
                              {meta.title(entry.node.record) || 'Untitled record'}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <span className="rounded-full border border-[#C084FC] px-1.5 py-0.5 text-[10px] font-bold text-[#5A00D6]">
                              {entry.reason}
                            </span>
                            <Link to={meta.path} className="text-[10px] font-bold text-[#0072FF] underline">Open</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}