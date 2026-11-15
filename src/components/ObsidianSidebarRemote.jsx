import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ChevronDown, LogOut } from 'lucide-react';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { MODULE_DIRECTORY, NAV_GROUPS, buildNavigationGroups } from '@/lib/moduleDirectory';
import { useRole } from '@/lib/useRole';
import { matchesModulePath } from '@/lib/navigationPreferences';

// Legacy exports are kept for the existing iPad Quick Access.
export const PRIMARY_11_OS_NAV = buildNavigationGroups();
export const FOCUSED_5_PILLAR_NAV = buildNavigationGroups(MODULE_DIRECTORY, [
  { id: 'pillar-today', label: '1. My Workspace', keys: NAV_GROUPS[0].keys },
  { id: 'pillar-people', label: '2. People & Service Delivery', keys: [...NAV_GROUPS[1].keys, ...NAV_GROUPS[2].keys] },
  { id: 'pillar-workforce', label: '3. Workforce & Communication', keys: [...NAV_GROUPS[3].keys, ...NAV_GROUPS[4].keys] },
  { id: 'pillar-safety', label: '4. Safety, Quality & Evidence', keys: [...NAV_GROUPS[5].keys, ...NAV_GROUPS[6].keys] },
  { id: 'pillar-audit', label: '5. Business & Administration', keys: [...NAV_GROUPS[7].keys, ...NAV_GROUPS[8].keys, ...NAV_GROUPS[9].keys] },
]);

export default function ObsidianSidebarRemote({ visiblePrimary, isActive: isActiveProp, navLabel = (item) => item.label, onLogout }) {
  const location = useLocation();
  const { can } = useRole();
  const modules = (visiblePrimary || MODULE_DIRECTORY).filter((item) => can(item.key));
  const groups = buildNavigationGroups(modules);
  const isActive = isActiveProp || ((path) => matchesModulePath(location.pathname, path));
  const activeGroup = groups.find((group) => group.children.some((item) => isActive(item.path)))?.id;
  const [expanded, setExpanded] = useState({});
  useEffect(() => {
    if (activeGroup) setExpanded((previous) => ({ ...previous, [activeGroup]: true }));
  }, [activeGroup, location.pathname]);

  return <div className="preserve-island-theme flex min-h-full w-full flex-col bg-[#0A2B6D] text-white">
    <div className="h-1 bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A]" />
    <Link to="/dashboard" aria-label="ComplianceHR Infinity home" className="flex justify-center px-3 py-4"><BrandLogoLockup size="xs" theme="dark" showSlogan compactSlogan /></Link>
    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('chr-open-module-directory'))} className="mx-3 mb-3 flex min-h-11 items-center gap-2 rounded-lg border border-white/30 px-3 text-left text-sm font-bold"><LayoutGrid size={18} />Find a module ({modules.length})</button>
    <nav aria-label="Workspace navigation" className="flex-1 space-y-2 px-3 pb-4">
      {groups.map((group, index) => {
        const open = expanded[group.id] ?? (group.id === activeGroup || group.id === 'my-workspace');
        const colour = ['#0072FF', '#A855F7', '#FF2E9A'][index % 3];
        return <section key={group.id}>
          <button type="button" aria-expanded={open} aria-controls={'nav-group-' + group.id} onClick={() => setExpanded((previous) => ({ ...previous, [group.id]: !open }))} className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-white/20 px-3 py-2 text-left text-sm font-bold focus-visible:ring-2 focus-visible:ring-white" style={{ borderLeft: '3px solid ' + colour }}>
            <span>{group.label}</span><ChevronDown size={16} className={open ? 'shrink-0 rotate-180' : 'shrink-0'} />
          </button>
          <div id={'nav-group-' + group.id} hidden={!open} className="space-y-1 pt-1">
            {group.children.map((item) => { const Icon = item.icon; const active = isActive(item.path); return <Link key={item.key} to={item.path} aria-current={active ? 'page' : undefined} className={'flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-white ' + (active ? 'bg-[#0072FF] font-bold text-white' : 'text-white/90 hover:bg-white/10')}><Icon size={17} className="shrink-0" aria-hidden="true" /><span className="min-w-0 break-words">{navLabel(item)}</span></Link>; })}
          </div>
        </section>;
      })}
      {!groups.length && <p className="p-3 text-sm">No workspaces are available for this account.</p>}
    </nav>
    {onLogout && <button type="button" onClick={onLogout} className="m-3 flex min-h-11 items-center gap-2 rounded-lg border border-white/30 px-3 text-sm font-semibold"><LogOut size={17} />Sign out</button>}
  </div>;
}
