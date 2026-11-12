import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Loader2, RefreshCw, Search } from 'lucide-react';
import SuggestedActionRow from './SuggestedActionRow';

const FILTERS = ['All', 'To do', 'In progress', 'Done'];

const countBy = (items, status) => items.filter((a) => a.status === status).length;

export default function SuggestionsDigestBoard() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const page = await base44.entities.SuggestedAction.filter({}, { sort: 'module', limit: 500 });
    setActions(page.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (action, patch) => {
    setActions((prev) => prev.map((a) => (a.id === action.id ? { ...a, ...patch } : a)));
    await base44.entities.SuggestedAction.update(action.id, patch);
  };

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return actions.filter((a) => {
      if (filter !== 'All' && a.status !== filter) return false;
      if (!term) return true;
      return `${a.module} ${a.title} ${a.owner || ''}`.toLowerCase().includes(term);
    });
  }, [actions, filter, search]);

  const groups = useMemo(() => {
    const map = new Map();
    visible.forEach((a) => {
      const key = a.module || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    });
    return Array.from(map.entries());
  }, [visible]);

  const total = actions.length;
  const done = countBy(actions, 'Done');
  const inProgress = countBy(actions, 'In progress');
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[#00C6FF]" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">
              Suggestions Digest · Every register, every suggestion
            </span>
            <h3 className="text-sm font-extrabold text-white">
              {total} suggested actions across {new Set(actions.map((a) => a.module)).size} modules
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-white/15 text-white">{done} done</Badge>
          <Badge className="bg-white/15 text-white">{inProgress} in progress</Badge>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/40 bg-white/10 text-white hover:bg-white/20">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-2 min-w-[140px] flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0072FF] to-[#5A00D6]" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-extrabold tabular-nums text-[#0A2B6D]">{pct}% complete</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              className="border-2 border-[#0A2B6D] font-extrabold"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
          <div className="relative ml-auto w-48 min-w-0">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search suggested actions"
              placeholder="Search actions or people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading suggested actions...
          </div>
        ) : groups.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No actions match this view.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {groups.map(([module, items]) => {
              const moduleTotal = actions.filter((a) => a.module === module).length;
              const moduleDone = actions.filter((a) => a.module === module && a.status === 'Done').length;
              return (
                <div key={module} className="space-y-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#0A2B6D]">{module}</h4>
                    <span className="text-[10px] font-extrabold tabular-nums text-[#5A00D6]">
                      {moduleDone}/{moduleTotal}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((a) => (
                      <SuggestedActionRow key={a.id} action={a} onSave={save} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}