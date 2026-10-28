import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NAV_GROUPS } from '@/lib/moduleDirectory';
import { getHeaderView } from '@/lib/fullColourTiles';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  ArrowRight,
  Compass,
} from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

export default function ObsidianSidebarRemote({
  visiblePrimary = [],
  role,
  user,
  isActive,
  navLabel,
  currentLabel,
  onLogout,
}) {
  const navigate = useNavigate();
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(null);

  const { groupsWithChannels, flatChannels } = useMemo(() => {
    const flat = [];
    const grouped = [];

    NAV_GROUPS.forEach((group, gIdx) => {
      const items = visiblePrimary.filter(
        (item) =>
          group.keys.includes(item.key) &&
          !(item.key === 'staff-progress' && visiblePrimary.some((entry) => entry.key === 'staff'))
      );
      if (!items.length) return;

      const entries = items.map((item) => {
        const channelNumber = flat.length + 1;
        const entry = {
          ...item,
          channelNumber,
          channelCode: String(channelNumber).padStart(2, '0'),
          displayLabel: navLabel(item),
          groupLabel: group.label,
          groupIdx: gIdx,
        };
        flat.push(entry);
        return entry;
      });

      grouped.push({
        label: group.label,
        groupIdx: gIdx,
        entries,
      });
    });

    return { groupsWithChannels: grouped, flatChannels: flat };
  }, [visiblePrimary, navLabel]);

  const activeChannelIdx = useMemo(() => {
    const idx = flatChannels.findIndex((item) => isActive(item.path));
    return idx >= 0 ? idx : 0;
  }, [flatChannels, isActive]);

  const activeChannel = flatChannels[activeChannelIdx] || {
    channelCode: '01',
    displayLabel: currentLabel || 'Dashboard',
    groupLabel: 'OVERVIEW',
    path: '/dashboard',
  };

  const stepChannel = (delta) => {
    if (!flatChannels.length) return;
    const nextIdx = (activeChannelIdx + delta + flatChannels.length) % flatChannels.length;
    const nextItem = flatChannels[nextIdx];
    if (nextItem) {
      navigate(nextItem.path);
    }
  };

  const stepGroup = (delta) => {
    if (!groupsWithChannels.length) return;
    const currentGroupPos = Math.max(
      0,
      groupsWithChannels.findIndex((g) => g.label === activeChannel.groupLabel)
    );
    const nextGroupPos =
      (currentGroupPos + delta + groupsWithChannels.length) % groupsWithChannels.length;
    const targetGroup = groupsWithChannels[nextGroupPos];
    if (targetGroup?.entries?.[0]) {
      navigate(targetGroup.entries[0].path);
    }
  };

  const displayedGroups =
    selectedGroupIdx === null
      ? groupsWithChannels
      : groupsWithChannels.filter((_, idx) => idx === selectedGroupIdx);

  return (
    <div className="relative flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden bg-white p-2.5 space-y-2 select-none">
      {/* Top Quick-Access Matched Header Card */}
      <div className="shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

        <div className="p-2.5 space-y-2">
          {/* Header Row Matching Quick Access */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
                style={{ background: BRAND_GRADIENT }}
              >
                <Zap className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="min-w-0">
                <div className="text-[12.5px] font-extrabold leading-tight text-[#0A2B6D]">
                  Page Navigation
                </div>
                <div className="text-[10px] font-semibold leading-tight text-slate-600">
                  {flatChannels.length} live screens · one tap
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
              Live
            </span>
          </div>

          {/* Active Screen Mini iPad Readout */}
          <div className="flex flex-col gap-[3px] rounded-xl border-2 border-[#0A2B6D] bg-[#0A2B6D] p-[3px]">
            <div className="overflow-hidden rounded-[8px] bg-white">
              <div
                className="flex items-center justify-between gap-1 px-2 py-1 text-white"
                style={{ background: getHeaderView(activeChannelIdx) }}
              >
                <span className="text-[9.5px] font-extrabold tracking-tight text-white">
                  CH {activeChannel.channelCode}/{String(flatChannels.length || 1).padStart(2, '0')} · {activeChannel.groupLabel}
                </span>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C6FF]" />
              </div>
              <div className="flex items-center justify-between gap-1 bg-white px-2 py-1">
                <span className="truncate text-[11px] font-extrabold text-[#0A2B6D]">
                  {activeChannel.displayLabel}
                </span>
                <span className="rounded-full bg-[#F5F0FF] px-1.5 py-0.5 text-[9px] font-extrabold text-[#5A00D6]">
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper & Group Filter Controls */}
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => stepChannel(-1)}
              title="Previous page screen"
              className="inline-flex flex-1 items-center justify-center gap-0.5 rounded-lg border border-slate-200 bg-white py-1 text-[10px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF] hover:text-[#0072FF]"
            >
              <ChevronUp className="h-3 w-3 text-[#0072FF]" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              onClick={() => stepGroup(-1)}
              title="Previous group"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold text-[#5A00D6] hover:border-[#5A00D6]"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => stepGroup(1)}
              title="Next group"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-extrabold text-[#5A00D6] hover:border-[#5A00D6]"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => stepChannel(1)}
              title="Next page screen"
              className="inline-flex flex-1 items-center justify-center gap-0.5 rounded-lg border border-slate-200 bg-white py-1 text-[10px] font-extrabold text-[#0A2B6D] hover:border-[#0072FF] hover:text-[#0072FF]"
            >
              <span>Next</span>
              <ChevronDown className="h-3 w-3 text-[#0072FF]" />
            </button>
          </div>

          {/* Group Filter Pills */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            <button
              type="button"
              onClick={() => setSelectedGroupIdx(null)}
              className={`rounded-md border px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider transition ${
                selectedGroupIdx === null
                  ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white'
                  : 'border-slate-200 bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
              }`}
            >
              ALL ({flatChannels.length})
            </button>
            {groupsWithChannels.map((g, idx) => {
              const selected = selectedGroupIdx === idx;
              return (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setSelectedGroupIdx(selected ? null : idx)}
                  className={`rounded-md border px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider transition ${
                    selected
                      ? 'border-[#5A00D6] bg-[#5A00D6] text-white'
                      : 'border-slate-200 bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                  }`}
                >
                  {g.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick-Access Styled iPad Mini Screen List */}
      <nav
        aria-label="App modules"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 space-y-2.5"
      >
        {displayedGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#F5F0FF] px-2.5 py-1">
              <span className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                <Compass className="h-2.5 w-2.5 text-[#0072FF]" />
                {group.label}
              </span>
              <span className="text-[9px] font-extrabold text-[#0A2B6D]">
                {group.entries.length} screens
              </span>
            </div>

            <div className="space-y-1.5">
              {group.entries.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const headerBg = getHeaderView(item.channelNumber - 1);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={`${item.displayLabel} — ${group.label}`}
                    className={`group flex flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] transition-all duration-200 focus-visible:outline-none ${
                      active
                        ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                        : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
                    }`}
                  >
                    {/* iPad Screen */}
                    <div className="flex flex-col overflow-hidden rounded-[8px] bg-white">
                      {/* Coloured Header Inside Screen */}
                      <div
                        className="flex min-h-[30px] items-center justify-between gap-1 px-2 py-1 text-white"
                        style={{ background: headerBg }}
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                          <span
                            className="min-w-0 text-[10px] font-extrabold leading-[12px] tracking-tight text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {item.displayLabel}
                          </span>
                        </div>
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            active ? 'bg-[#00C6FF]' : 'bg-white/75'
                          }`}
                        />
                      </div>

                      {/* White Detail Strip Inside Screen */}
                      <div className="flex min-h-[24px] items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-2 py-0.5">
                        <span className="truncate text-[9.5px] font-bold text-[#0A2B6D]/85">
                          CH {item.channelCode} · {group.label}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
                      </div>
                    </div>

                    {/* iPad Home Indicator Bar */}
                    <div className="flex h-[4px] items-center justify-center">
                      <span
                        className={`h-[2px] w-5 rounded-full transition-all ${
                          active ? 'w-7 bg-[#00C6FF]' : 'bg-white/45 group-hover:bg-white/80'
                        }`}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User & Sign-Out Card Matching Quick Access */}
      <div className="shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-panel space-y-1.5">
        <div className="px-1">
          <div className="truncate text-[11px] font-extrabold text-[#0A2B6D]">
            {user?.full_name || 'User'}
          </div>
          <div className="truncate text-[10px] font-semibold text-[#5A00D6]">
            {user?.email || ''}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#0A2B6D] transition hover:bg-[#F5F0FF] hover:text-[#5A00D6]"
        >
          <LogOut className="h-3.5 w-3.5 text-[#FF2E9A]" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}