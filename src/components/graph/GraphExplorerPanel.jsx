import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NODE_TYPES, neighbours, typeMeta } from '@/lib/knowledgeGraph';

export default function GraphExplorerPanel({ graph }) {
  const [typeKey, setTypeKey] = React.useState('standard');
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState('');
  const [trail, setTrail] = React.useState([]);

  const type = typeMeta(typeKey);
  const nodes = React.useMemo(
    () => [...graph.nodes.values()].filter((node) => node.typeKey === typeKey),
    [graph, typeKey]
  );
  const choices = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return nodes
      .filter((node) => !needle || `${node.title} ${node.detail}`.toLowerCase().includes(needle))
      .slice(0, 80);
  }, [nodes, search]);

  const fallbackId = selectedId && graph.nodes.has(selectedId) ? selectedId : choices[0]?.id || '';
  const focusId = trail.length ? trail[trail.length - 1] : fallbackId;
  const focus = focusId ? graph.nodes.get(focusId) : null;
  const links = focus ? neighbours(graph, focus.id) : [];

  const grouped = React.useMemo(() => {
    const map = new Map();
    links.forEach((entry) => {
      const key = entry.typeLabel || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    });
    return [...map.entries()];
  }, [links]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">Object type</p>
          <Select value={typeKey} onValueChange={(value) => { setTypeKey(value); setSelectedId(''); setTrail([]); setSearch(''); }}>
            <SelectTrigger className="h-9 w-[190px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {NODE_TYPES.map((option) => <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">Find a record</p>
          <Input className="h-9 w-[210px] text-xs" placeholder="Search this type" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="min-w-[240px] flex-1 space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">Start from</p>
          <Select value={fallbackId} onValueChange={(value) => { setSelectedId(value); setTrail([]); }}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder={choices.length ? 'Choose a record' : `No ${type.label.toLowerCase()} records yet`} />
            </SelectTrigger>
            <SelectContent>
              {choices.map((node) => <SelectItem key={node.id} value={node.id}>{node.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {trail.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => setTrail((current) => current.slice(0, -1))}>
            <ArrowLeft className="h-3.5 w-3.5" />Back one step
          </Button>
        )}
      </div>

      {!focus ? (
        <p className="rounded-xl border-2 border-dashed border-[#C084FC] bg-[#F5F0FF] p-4 text-center text-xs font-bold text-[#0A2B6D]">
          No {type.label.toLowerCase()} records exist yet, so there is nothing to explore. Records appear here as soon as they are created in {type.path}.
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">{focus.typeLabel}</p>
              <p className="text-sm font-extrabold text-[#0A2B6D]">{focus.title}</p>
              <p className="text-[11px] font-semibold text-[#0A2B6D]/80">
                {[focus.detail, focus.status].filter(Boolean).join(' · ') || 'No further detail recorded'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-[#0A2B6D] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                {links.length} link{links.length === 1 ? '' : 's'}
              </span>
              <Link to={focus.path} className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0072FF] underline">
                Open record<ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {grouped.length === 0 ? (
            <p className="mt-2 rounded-lg border border-[#FF2E9A] bg-[#F5F0FF] p-2 text-[11px] font-semibold text-[#0A2B6D]">
              This record stands alone. Nothing in the registers references it and it references nothing, so an assessor
              cannot trace it to a standard. Record a reference on the source record, or add a link in the Links
              register to close the chain.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {grouped.map(([groupLabel, entries]) => (
                <div key={groupLabel} className="rounded-lg border border-[#C084FC]/50 bg-[#F5F0FF] p-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">{groupLabel} · {entries.length}</p>
                  <div className="mt-1 space-y-1">
                    {entries.map((entry) => (
                      <button
                        key={`${entry.id}-${entry.relationship}-${entry.direction}`}
                        type="button"
                        onClick={() => setTrail((current) => [...current, entry.id])}
                        className="flex w-full flex-wrap items-center justify-between gap-1.5 rounded-md bg-white px-2 py-1 text-left transition hover:bg-[#F5F0FF]"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <Network className="h-3 w-3 shrink-0 text-[#A100FF]" />
                          <span className="min-w-0 truncate text-[11px] font-bold text-[#0A2B6D]">{entry.title}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <span className="rounded-full border border-[#C084FC] px-1.5 py-0.5 text-[10px] font-bold text-[#5A00D6]">
                            {entry.relationshipLabel} · {entry.confidence}%
                          </span>
                          <span className="text-[10px] font-bold uppercase text-[#0072FF]">Trace</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}