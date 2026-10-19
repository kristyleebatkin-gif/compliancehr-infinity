import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import { profilePalette } from '@/lib/profileColours';
import { statusTone } from '@/lib/statusStyles';
import { Search, ChevronRight, Users, Heart, Mail, Phone } from 'lucide-react';

// Admin view: every employee or participant profile in the organisation,
// grouped into modular sections with search and quick filters.
export default function OurProfilesTab({ kind }) {
  const isParticipant = kind === 'participant';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const entity = isParticipant ? base44.entities.ParticipantProfile : base44.entities.StaffProfile;
        const page = await entity.filter({}, { sort: 'full_name', limit: 200 });
        if (active) setRecords(page.items || []);
      } catch (e) { console.error(e); }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [isParticipant]);

  const groupKey = (r) => (isParticipant ? (r.status || 'Active') : (r.role || 'Unassigned'));
  const groups = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      const key = groupKey(r);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [records, isParticipant]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      if (group !== 'all' && groupKey(r) !== group) return false;
      if (!term) return true;
      return [r.full_name, r.email, r.phone, r.position, r.role, r.ndis_number, r.ndis_reference_number, r.support_type]
        .some((v) => (v || '').toLowerCase().includes(term));
    });
  }, [records, search, group, isParticipant]);

  const initials = (name) => (name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  const activeCount = records.filter((r) => (r.status || 'Active') === 'Active').length;
  const attentionCount = records.length - activeCount;
  const Icon = isParticipant ? Heart : Users;

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  if (!records.length) {
    return <EmptyState icon={Users} title="No profiles yet" message={isParticipant ? 'Participant profiles will appear here once created.' : 'Employee profiles will appear here once created.'} modulePath={isParticipant ? 'participants' : 'staff'} />;
  }

  return (
    <div className="space-y-5">
      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total profiles', value: records.length, cls: 'text-foreground' },
          { label: 'Active', value: activeCount, cls: 'text-safe' },
          { label: isParticipant ? 'On hold / inactive' : 'On leave / inactive', value: attentionCount, cls: 'text-warning' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className={`font-display text-2xl font-extrabold tabular-nums ${s.cls}`}>{s.value}</div>
            <div className="mt-0.5 text-xs font-medium text-foreground/50">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + quick filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder={`Search ${isParticipant ? 'participants' : 'employees'} by name, email or number`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button variant={group === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setGroup('all')}>All ({records.length})</Button>
          {groups.map(([key, list]) => (
            <Button key={key} variant={group === key ? 'default' : 'outline'} size="sm" onClick={() => setGroup(key === group ? 'all' : key)}>
              {key} ({list.length})
            </Button>
          ))}
        </div>
      </div>

      {/* Modular grouped sections */}
      {visible.length === 0 ? (
        <EmptyState icon={Icon} title="No matches" message="Try a different search term or filter." modulePath={isParticipant ? 'participants' : 'staff'} />
      ) : (
        <div className="space-y-6">
          {groups
            .map(([key, list]) => [key, list.filter((r) => visible.includes(r))])
            .filter(([, list]) => list.length > 0)
            .map(([key, list]) => (
              <section key={key}>
                <div className="mb-2.5 flex items-center gap-2">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground/70">{key}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/60">{list.length}</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {list.map((r) => {
                    const { primary } = profilePalette(r.full_name);
                    return (
                      <Link key={r.id} to={isParticipant ? `/our-participants/${r.id}` : `/our-employees/${r.id}`} className="group">
                        <div className="flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}
                          >
                            {initials(r.full_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="truncate text-sm font-semibold font-editorial">{r.full_name}</div>
                              <Badge className={`shrink-0 ${statusTone(r.status || 'Active')}`}>{r.status || 'Active'}</Badge>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {isParticipant
                                ? (r.support_type && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">{r.support_type}</span>)
                                : ((r.position || r.role) && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">{r.position || r.role}</span>)}
                              {isParticipant
                                ? (r.ndis_number && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">NDIS {r.ndis_number}</span>)
                                : (r.employee_number && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">ID {r.employee_number}</span>)}
                              {isParticipant && r.ndis_reference_number && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">Ref {r.ndis_reference_number}</span>}
                            </div>
                            <div className="mt-2 space-y-0.5 text-xs text-foreground/50">
                              {r.email && <div className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" />{r.email}</div>}
                              {r.phone && <div className="flex items-center gap-1.5 truncate"><Phone className="h-3 w-3 shrink-0" />{r.phone}</div>}
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                              Open profile <ChevronRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}