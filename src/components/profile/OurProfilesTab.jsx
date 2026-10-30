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

  const groupKey = (r) => (isParticipant ? (r.status || 'Status not set') : (r.role || 'Unassigned'));
  const groups = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      const key = groupKey(r);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    const sectionOrder = ['Support Worker', 'Administration', 'Team Leader', 'Management', 'Compliance Manager'];
    return [...map.entries()].sort((a, b) => {
      if (directory && !isParticipant) {
        const rank = (key) => sectionOrder.includes(key) ? sectionOrder.indexOf(key) : sectionOrder.length;
        return rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]);
      }
      return a[0].localeCompare(b[0]);
    });
  }, [records, isParticipant, directory]);

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
  const activeCount = directory ? 0 : records.filter((r) => r.status === 'Active').length;
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
        <div className="app-page-header flex items-center gap-4 px-4" style={{ background: 'var(--header-gradient)' }}>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold">{initials(records[0].full_name)}</div>
          <div className="min-w-0">
            <h2>{records[0].full_name}</h2>
            <p>{isParticipant ? (records[0].support_type || 'Participant') : (records[0].position || records[0].role || 'Employee')} · {records[0].email}</p>
          </div>
          <Badge className="ml-auto shrink-0 border-0 bg-white/20 text-white">{records[0].status || 'Status not set'}</Badge>
        </div>
      )}
      {!selfOnly && <>
      {/* Participants: search sits directly under the header */}
      {isParticipant && !directory && searchBox}

      {!isParticipant && !directory && searchBox}

      {/* Standalone directories keep their own summary; the employee page owns its header tiles. */}
      {!directory && <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total profiles', value: records.length, Icon: Users, grad: 'bg-indigo-500' },
          { label: 'Active', value: activeCount, Icon: UserCheck, grad: 'bg-emerald-500' },
          { label: 'Not marked active', value: attentionCount, Icon: Clock, grad: 'bg-amber-500' },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-3 rounded-2xl ${s.grad} p-4 text-white shadow-md`}>
            <div className="rounded-xl bg-white/20 p-2.5"><s.Icon className="h-5 w-5" /></div>
            <div>
              <div className="font-display text-2xl font-extrabold tabular-nums">{s.value}</div>
              <div className="text-xs font-medium text-white/80">{s.label}</div>
            </div>
          </div>
        ))}
      </div>}

      {/* Profile categories sit below the dashboard. */}
      {directory ? null : filterRow}
      </>}

      {/* Modular grouped sections */}
      {visible.length === 0 ? (
        <EmptyState icon={Icon} title="No matches" message="Try a different search term or filter." modulePath={isParticipant ? 'participants' : 'staff'} />
      ) : (
        <div className={`profile-groups space-y-4 sm:max-lg:space-y-1.5 ${directory && !isParticipant && group === 'all' ? 'employee-paired-sections' : ''}`}>
          {groups
            .map(([key, list]) => [key, list.filter((r) => visible.includes(r))])
            .filter(([, list]) => list.length > 0)
            .map(([key, list]) => (
              <section key={key} data-profile-role={key}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm" style={{ background: `linear-gradient(135deg, ${profilePalette(key).primary}, ${profilePalette(key).accent})` }} />
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#0A2B6D]">{key}</h3>
                  <span className="rounded-full border border-[#0A2B6D]/15 bg-white px-2 py-0.5 text-[11px] font-extrabold text-[#5A00D6]">{list.length}</span>
                  <div className="h-px flex-1 bg-[#0A2B6D]/10" />
                </div>
                <div className="profile-card-grid grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {list.map((r) => {
                    const { primary } = profilePalette(r.full_name);
                    return (
                      <Link key={r.id} to={`${profilePath}/${r.id}`} className="group h-full">
                        <div className="flex h-full flex-col rounded-2xl border border-[#0A2B6D]/12 bg-white p-3 shadow-[0_1px_2px_rgba(10,43,109,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0072FF]/45 hover:shadow-[0_12px_28px_-16px_rgba(10,43,109,0.45)]">
                          <div className="flex items-start gap-2.5">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-extrabold text-white shadow-sm ring-1 ring-inset ring-white/30"
                              style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}
                            >
                              {initials(r.full_name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 break-words text-[15px] font-extrabold leading-[19px] text-[#0A2B6D]">{r.full_name}</div>
                                <Badge className={`shrink-0 whitespace-nowrap text-[10px] font-extrabold ${statusTone(r.status || 'Status not set')}`}>{r.status || 'Status not set'}</Badge>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {isParticipant
                                  ? (r.support_type && <span className="rounded-full border border-[#0A2B6D]/15 bg-white px-2 py-0.5 text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/75">{r.support_type}</span>)
                                  : ((r.position || r.role) && <span className="rounded-full border border-[#0A2B6D]/15 bg-white px-2 py-0.5 text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/75">{r.position || r.role}</span>)}
                                {isParticipant
                                  ? (r.ndis_number && <span className="rounded-full border border-[#0A2B6D]/15 bg-white px-2 py-0.5 text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/75">NDIS {r.ndis_number}</span>)
                                  : (r.employee_number && <span className="rounded-full border border-[#0A2B6D]/15 bg-white px-2 py-0.5 text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/75">ID {r.employee_number}</span>)}
                                {isParticipant && r.ndis_reference_number && <span className="rounded-full border border-[#0A2B6D]/15 bg-white px-2 py-0.5 text-[10.5px] font-bold leading-[13px] text-[#0A2B6D]/75">Ref {r.ndis_reference_number}</span>}
                              </div>
                            </div>
                          </div>
                          {(r.email || r.phone) && (
                            <div className="mt-2 space-y-1 border-t border-[#0A2B6D]/8 pt-2 text-[10.5px] font-semibold leading-[14px] text-[#0A2B6D]/65">
                              {r.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 shrink-0 text-[#0072FF]" /><span className="min-w-0 break-all">{r.email}</span></div>}
                              {r.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0 text-[#0072FF]" /><span className="min-w-0 break-words">{r.phone}</span></div>}
                            </div>
                          )}
                          <div className="mt-auto flex items-center justify-between gap-1 pt-2 text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-[#0A2B6D]/45 transition-colors group-hover:text-[#5A00D6]">
                            <span>Open profile</span>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D]/12 bg-white transition-colors group-hover:border-[#5A00D6]/40 group-hover:bg-[#5A00D6] group-hover:text-white">
                              <ChevronRight className="h-3 w-3" />
                            </span>
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