import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import WorkspaceShortcuts from '@/components/WorkspaceShortcuts';
import { LayoutGrid, Star, Bell, CircleHelp } from 'lucide-react';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { useRole } from '@/lib/useRole';
import { navigationScope, readNavigation, cleanModuleKeys, matchesModulePath } from '@/lib/navigationPreferences';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const buttonClass = 'inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#0072FF]/30 px-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[#0072FF]';

export default function WorkspaceNavigationTools({ compact = false, moveShortcuts = false, shortcutsTarget = null }) {
  const location = useLocation();
  const { user, can, navRole } = useRole();
  const allowed = MODULE_DIRECTORY.filter((item) => can(item.key));
  const allowedKeyString = allowed.map((item) => item.key).join('|');
  const keys = useMemo(() => allowedKeyString.split('|').filter(Boolean), [allowedKeyString]);
  const scope = navigationScope(user);
  const [preferences, setPreferences] = useState({ scope: null, favourites: [], recent: [] });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const active = allowed.find((item) => matchesModulePath(location.pathname, item.path))
    || (['/roster', '/shifts'].some((path) => matchesModulePath(location.pathname, path)) ? allowed.find((item) => item.key === 'rostering') : null);

  useEffect(() => {
    let saved;
    try { saved = readNavigation(window.localStorage, scope, keys); } catch { saved = { favourites: [], recent: [] }; }
    setPreferences({ scope, ...saved });
  }, [scope, keys]);

  useEffect(() => {
    if (!scope || !active) return;
    setPreferences((previous) => {
      const saved = previous.scope === scope ? previous : { scope, favourites: [], recent: [] };
      if (saved.recent[0] === active.key) return previous;
      return { ...saved, recent: cleanModuleKeys([active.key, ...saved.recent], keys, 5) };
    });
  }, [scope, active?.key, keys]);

  useEffect(() => {
    if (!scope || preferences.scope !== scope) return;
    try {
      window.localStorage.setItem(scope, JSON.stringify({ favourites: cleanModuleKeys(preferences.favourites, keys), recent: cleanModuleKeys(preferences.recent, keys, 5) }));
      setStorageUnavailable(false);
    } catch { setStorageUnavailable(true); }
  }, [preferences, scope, keys]);

  useEffect(() => {
    const show = () => { setQuery(''); setGroup(''); setOpen(true); };
    window.addEventListener('chr-open-module-directory', show);
    return () => window.removeEventListener('chr-open-module-directory', show);
  }, []);
  useEffect(() => { setOpen(false); }, [location.pathname, location.search, scope, navRole]);
  const favourites = preferences.scope === scope ? cleanModuleKeys(preferences.favourites, keys) : [];
  const recent = preferences.scope === scope ? cleanModuleKeys(preferences.recent, keys, 5) : [];
  const results = allowed.filter((item) => (!group || item.group === group) && (item.label + ' ' + item.blurb + ' ' + item.group).toLowerCase().includes(query.trim().toLowerCase()));
  const toggleFavourite = (key) => {
    if (!scope) return;
    setPreferences((previous) => {
      const current = previous.scope === scope ? previous : { scope, favourites: [], recent: [] };
      return { ...current, favourites: current.favourites.includes(key) ? current.favourites.filter((entry) => entry !== key) : cleanModuleKeys([...current.favourites, key], keys) };
    });
  };

  return <><section aria-label="Workspace shortcuts" className="app-workspace-shortcuts border-b border-[#0072FF]/20 bg-white px-3 py-3 text-[#0A2B6D] sm:px-6">
    <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
      <nav aria-label="Breadcrumb" className={compact ? 'sr-only' : 'text-sm'}><Link to="/dashboard" className="font-semibold text-[#0072FF]">Workspace</Link>{active && <> / <span>{active.group.replace(/^\d+\.\s*/, '')}</span> / <span aria-current="page" className="font-bold">{active.label}</span></>}</nav>
      <div className="flex flex-wrap gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><button type="button" className={buttonClass}><LayoutGrid size={18} />Find a module <span>({allowed.length})</span></button></DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogTitle>Module directory</DialogTitle>
            <DialogDescription>Search your permitted workspaces and save up to 12 favourites. Personal shortcuts never change access permissions.</DialogDescription>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">Search<input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search modules" className="mt-1 min-h-11 w-full rounded-lg border border-[#0072FF]/30 px-3" /></label>
              <label className="text-sm font-semibold">Group<select value={group} onChange={(event) => setGroup(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#0072FF]/30 px-3"><option value="">All groups</option>{NAV_GROUPS.filter((entry) => allowed.some((item) => item.group === entry.label)).map((entry) => <option key={entry.id} value={entry.label}>{entry.label}</option>)}</select></label>
            </div>
            <p role="status" className="text-sm">{results.length} of {allowed.length} permitted workspaces</p>
            <div className="grid gap-2 sm:grid-cols-2">{results.map((item) => <div key={item.key} className="flex items-start gap-2 rounded-xl border border-[#0072FF]/20 p-3">
              <Link to={item.path} onClick={() => setOpen(false)} className="min-w-0 flex-1 rounded-lg py-2"><span className="block font-bold">{item.label}</span><span className="block text-xs">{item.group}</span><span className="mt-1 block text-sm">{item.blurb}</span></Link>
              <button type="button" onClick={() => toggleFavourite(item.key)} disabled={!scope || (!favourites.includes(item.key) && favourites.length >= 12)} aria-label={(favourites.includes(item.key) ? 'Remove favourite: ' : 'Add favourite: ') + item.label} aria-pressed={favourites.includes(item.key)} className="min-h-11 min-w-11 rounded-lg p-3 text-[#5A00D6] disabled:opacity-40"><Star size={18} fill={favourites.includes(item.key) ? 'currentColor' : 'none'} /></button>
            </div>)}</div>
            {!results.length && <p>No matching workspaces. Try another search or group.</p>}
            {(!scope || storageUnavailable) && <p role="status" className="text-sm">Personal shortcuts cannot be saved on this device right now.</p>}
          </DialogContent>
        </Dialog>
        <Link to="/notifications" aria-label="Notifications" className={buttonClass}><Bell size={18} /></Link>
        {can('help') && <Link to="/help" aria-label="Help" className={buttonClass}><CircleHelp size={18} /></Link>}
        <Link to="/my-profile" className={buttonClass}>My account</Link>
      </div>
    </div>
    {!compact && !moveShortcuts && <WorkspaceShortcuts allowed={allowed} favourites={favourites} recent={recent} className="mx-auto mt-2 max-w-[1440px]" />}
  </section>
  {!compact && moveShortcuts && shortcutsTarget && createPortal(
    <WorkspaceShortcuts allowed={allowed} favourites={favourites} recent={recent} className="workspace-shortcuts-bar mb-3 rounded-lg border border-border bg-card px-3 py-2 text-card-foreground" />,
    shortcutsTarget
  )}</>;
}