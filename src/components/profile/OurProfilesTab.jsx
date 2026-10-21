import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/EmptyState';
import ProfileLoadError from '@/components/profile/ProfileLoadError';
import EmployeeCategoryTiles from '@/components/profile/EmployeeCategoryTiles';
import useEmployeeDirectoryPage from '@/components/profile/useEmployeeDirectoryPage';
import { loadProfileWithTimeout } from '@/lib/profileLoading';
import { profilePalette } from '@/lib/profileColours';
import { statusTone } from '@/lib/statusStyles';
import { useRole, ROLES } from '@/lib/useRole';
import { managesProfiles, profileRecordScope, preparePersonalProfileAccess } from '@/lib/personalProfileAccess';
import { Search, ChevronRight, Users, Heart, Mail, Phone, UserCheck, Clock } from 'lucide-react';

// Admin view: every employee or participant profile in the organisation,
// grouped into modular sections with search and quick filters. Staff and
// participants see only their own profile in their matching module.
export default function OurProfilesTab({ kind, basePath, scoped = true, directory = false, searchValue = '', groupValue = 'all', onGroupChange, categories = [], total }) {
  const isParticipant = kind === 'participant';
  const profilePath = basePath || (isParticipant ? '/our-participants' : '/our-employees');
  const { role, user } = useRole();
  const selfOnly = scoped && !managesProfiles(role) && !(isParticipant && role === ROLES.SUPPORT);
  const [storedRecords, setRecords] = useState([]);
  const [storedLoading, setLoading] = useState(true);
  const [storedError, setError] = useState('');
  const [localSearch, setSearch] = useState('');
  const [localGroup, setLocalGroup] = useState('all');
  const [reload, setReload] = useState(0);
  const search = directory ? searchValue : localSearch;
  const group = directory ? groupValue : localGroup;
  const setGroup = directory ? onGroupChange : setLocalGroup;
  const directoryPage = useEmployeeDirectoryPage({ enabled: directory, scoped, search, group, kind });
  const records = directory ? directoryPage.data?.pages.flatMap(page => page.items || []) || [] : storedRecords;
  const loading = directory ? directoryPage.isPending : storedLoading;
  const error = directory ? directoryPage.error : storedError;

  useEffect(() => {
    if (directory) return;
    let active = true;
    setRecords([]);
    setLoading(true);
    setError('');
    (async () => {
      try {
        const page = await loadProfileWithTimeout(async () => {
          if (!user?.id) throw new Error('Your account could not be loaded. Please sign in again.');
          if (scoped) await preparePersonalProfileAccess();
          const entity = isParticipant ? base44.entities.ParticipantProfile : base44.entities.StaffProfile;
          const query = scoped ? profileRecordScope(role, user, isParticipant ? 'ParticipantProfile' : 'StaffProfile') : {};
          return entity.filter(query, { sort: 'full_name', limit: 200 });
        });
        if (active) setRecords(page.items || []);
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [directory, isParticipant, selfOnly, scoped, role, user?.id, user?.email, reload]);

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
    if (directory) return records;
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      if (group !== 'all' && groupKey(r) !== group) return false;
      if (!term) return true;
      return [r.full_name, r.email, r.phone, r.position, r.role, r.ndis_number, r.ndis_reference_number, r.support_type]
        .some((v) => (v || '').toLowerCase().includes(term));
    });
  }, [directory, records, search, group, isParticipant]);

  const initials = (name) => (name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  const activeCount = directory ? 0 : records.filter((r) => (r.status || 'Active') === 'Active').length;
  const attentionCount = records.length - activeCount;
  const Icon = isParticipant ? Heart : Users;

  const searchBox = (
    <div className="relative sm:w-72 sm:max-lg:w-56 sm:max-lg:[&_input]:h-7 sm:max-lg:[&_input]:text-xs">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="gradient-brand-soft border-primary/40 pl-9" placeholder={`Search ${isParticipant ? 'participants' : 'employees'} by name, email or number`} value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
  );
  const filterRow = (
    <div className="flex flex-wrap gap-1.5">
      <Button variant={group === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setGroup('all')}>All ({records.length})</Button>
      {groups.map(([key, list]) => (
        <Button key={key} variant={group === key ? 'default' : 'outline'} size="sm" onClick={() => setGroup(key === group ? 'all' : key)}>
          {key} ({list.length})
        </Button>
      ))}
    </div>
  );

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  if (error) return <ProfileLoadError error={error} onRetry={() => directory ? directoryPage.refetch() : setReload((value) => value + 1)} />;

  if (!records.length && !directory) {
    return <EmptyState icon={Users} title={selfOnly ? 'Your profile is not set up yet' : 'No profiles yet'} message={selfOnly ? 'Your profile will appear here once management creates it and links your email.' : (isParticipant ? 'Participant profiles will appear here once created.' : 'Employee profiles will appear here once created.')} modulePath={isParticipant ? 'participants' : 'staff'} />;
  }

  return (
    <div className={`space-y-5 sm:max-lg:space-y-1.5 ${directory ? 'employee-directory-profile-list' : ''}`}>
      {selfOnly && records[0] && (
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 p-5 text-white shadow-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold">{initials(records[0].full_name)}</div>
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-bold">{records[0].full_name}</p>
            <p className="text-sm text-white/80">{isParticipant ? (records[0].support_type || 'Participant') : (records[0].position || records[0].role || 'Employee')}</p>
            <p className="truncate text-xs text-white/70">{records[0].email}</p>
          </div>
          <Badge className="ml-auto shrink-0 border-0 bg-white/20 text-white">{records[0].status || 'Active'}</Badge>
        </div>
      )}
      {!selfOnly && <>
      {/* Participants: search sits directly under the header */}
      {isParticipant && !directory && searchBox}

      {!isParticipant && !directory && searchBox}

      {/* Standalone directories keep their own summary; the employee page owns its header tiles. */}
      {!directory && <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total profiles', value: records.length, Icon: Users, grad: 'from-indigo-500 via-violet-500 to-purple-500' },
          { label: 'Active', value: activeCount, Icon: UserCheck, grad: 'from-emerald-500 via-teal-500 to-cyan-500' },
          { label: isParticipant ? 'On hold / inactive' : 'On leave / inactive', value: attentionCount, Icon: Clock, grad: 'from-amber-500 via-orange-500 to-rose-500' },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${s.grad} p-4 text-white shadow-md`}>
            <div className="rounded-xl bg-white/20 p-2.5"><s.Icon className="h-5 w-5" /></div>
            <div>
              <div className="font-display text-2xl font-extrabold tabular-nums">{s.value}</div>
              <div className="text-xs font-medium text-white/80">{s.label}</div>
            </div>
          </div>
        ))}
      </div>}

      {/* Profile categories sit below the dashboard. */}
      {directory ? (!isParticipant && <EmployeeCategoryTiles categories={categories} selected={group} onSelect={setGroup} total={total} />) : filterRow}
      </>}

      {/* Modular grouped sections */}
      {visible.length === 0 ? (
        <EmptyState icon={Icon} title="No matches" message="Try a different search term or filter." modulePath={isParticipant ? 'participants' : 'staff'} />
      ) : (
        <div className="profile-groups space-y-4 sm:max-lg:space-y-1.5">
          {groups
            .map(([key, list]) => [key, list.filter((r) => visible.includes(r))])
            .filter(([, list]) => list.length > 0)
            .map(([key, list]) => (
              <section key={key}>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full shadow-sm" style={{ background: `linear-gradient(135deg, ${profilePalette(key).primary}, ${profilePalette(key).accent})` }} />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground/70">{key}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/60">{list.length}</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
                <div className="profile-card-grid grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {list.map((r) => {
                    const { primary } = profilePalette(r.full_name);
                    return (
                      <Link key={r.id} to={`${profilePath}/${r.id}`} className="group">
                        <div className="flex h-full items-start gap-2 rounded-xl border border-border/60 bg-card p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}
                          >
                            {initials(r.full_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="truncate text-sm font-semibold font-editorial">{r.full_name}</div>
                              <Badge className={`shrink-0 ${statusTone(r.status || 'Active')}`}>{r.status || 'Active'}</Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {isParticipant
                                ? (r.support_type && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">{r.support_type}</span>)
                                : ((r.position || r.role) && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">{r.position || r.role}</span>)}
                              {isParticipant
                                ? (r.ndis_number && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">NDIS {r.ndis_number}</span>)
                                : (r.employee_number && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">ID {r.employee_number}</span>)}
                              {isParticipant && r.ndis_reference_number && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/70">Ref {r.ndis_reference_number}</span>}
                            </div>
                            <div className="mt-1 space-y-0.5 text-[11px] text-foreground/50">
                              {r.email && <div className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" />{r.email}</div>}
                              {r.phone && <div className="flex items-center gap-1.5 truncate"><Phone className="h-3 w-3 shrink-0" />{r.phone}</div>}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
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
      {directory && directoryPage.hasNextPage && <Button variant="outline" disabled={directoryPage.isFetchingNextPage} onClick={() => directoryPage.fetchNextPage()}>{directoryPage.isFetchingNextPage ? 'Loading…' : `Load more ${isParticipant ? 'participants' : 'employees'}`}</Button>}
    </div>
  );
}