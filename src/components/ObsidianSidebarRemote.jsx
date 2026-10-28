import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NAV_GROUPS } from '@/lib/moduleDirectory';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Power,
  Tv,
  LogOut,
  Radio,
} from 'lucide-react';

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

  // Build grouped list and flat channel list with 1-based channel numbers
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
    <div
      className="preserve-island-theme relative flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden p-2.5 space-y-2.5 select-none"
      style={{
        background: 'linear-gradient(165deg, #1E293B 0%, #0F172A 55%, #090F1C 100%)',
        color: '#F8FAFC',
        boxShadow: 'inset -1px 0 0 rgba(56,189,248,0.22)',
      }}
    >
      {/* Brushed Obsidian Metallic Grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'repeating-linear-gradient(176deg, transparent 0 3px, rgba(148,163,184,0.22) 4px, transparent 5px 8px)',
        }}
      />

      {/* Top Small Screen: Recessed OLED Channel & Brand Readout */}
      <div
        className="relative z-10 shrink-0 rounded-2xl border p-2.5"
        style={{
          backgroundColor: '#090F1C',
          borderColor: 'rgba(56,189,248,0.45)',
          boxShadow:
            'inset 0 2px 10px rgba(0,0,0,0.75), 0 0 16px -4px rgba(56,189,248,0.28)',
        }}
      >
        {/* Top OLED Status Line */}
        <div className="flex items-center justify-between gap-1.5 border-b pb-1.5" style={{ borderColor: '#1E293B' }}>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold uppercase tracking-wider"
              style={{
                backgroundColor: 'rgba(56,189,248,0.16)',
                borderColor: 'rgba(56,189,248,0.45)',
                color: '#38BDF8',
              }}
            >
              <Tv className="h-2.5 w-2.5" style={{ color: '#38BDF8' }} />
              CH {activeChannel.channelCode}/{String(flatChannels.length || 1).padStart(2, '0')}
            </span>
            <span
              className="truncate font-mono text-[9px] font-bold uppercase tracking-wider"
              style={{ color: '#94A3B8' }}
            >
              {activeChannel.groupLabel}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider" style={{ color: '#38BDF8' }}>
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }}
            />
            LIVE
          </span>
        </div>

        {/* OLED Screen Center: Brand & Active Route */}
        <div className="mt-2 text-center space-y-1">
          <div className="font-editorial text-sm font-extrabold tracking-tight" style={{ color: '#F8FAFC' }}>
            Compliance
            <span className="font-editorial-italic" style={{ color: '#38BDF8' }}>
              HR
            </span>{' '}
            <span style={{ color: '#BAE6FD' }}>Infinity</span>
          </div>

          <div
            className="rounded-lg border px-2 py-1"
            style={{
              backgroundColor: '#0F172A',
              borderColor: '#1E293B',
            }}
          >
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#38BDF8' }}>
              Active Screen Route
            </div>
            <div className="truncate text-[11.5px] font-extrabold leading-snug" style={{ color: '#F8FAFC' }}>
              {activeChannel.displayLabel}
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 pt-0.5">
            <span
              className="inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-extrabold"
              style={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
                color: '#BAE6FD',
              }}
            >
              {role}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold" style={{ color: '#94A3B8' }}>
              <Power className="h-2.5 w-2.5" style={{ color: '#38BDF8' }} />
              Smart Router
            </span>
          </div>
        </div>
      </div>

      {/* Tactile Remote Control Pod: Circular D-Pad + CH-/CH+ Rockers */}
      <div
        className="relative z-10 shrink-0 rounded-2xl border p-2"
        style={{
          backgroundColor: '#0F172A',
          borderColor: '#334155',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 10px rgba(0,0,0,0.35)',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left: CH- /GRP- Rocker */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => stepChannel(-1)}
              title="Previous page channel"
              className="flex items-center justify-center gap-0.5 rounded-lg border px-2 py-1 text-[9.5px] font-extrabold transition hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: '#1E293B',
                borderColor: '#475569',
                color: '#F8FAFC',
              }}
            >
              <ChevronUp className="h-3 w-3" style={{ color: '#38BDF8' }} />
              <span style={{ color: '#F8FAFC' }}>CH-</span>
            </button>
            <button
              type="button"
              onClick={() => stepGroup(-1)}
              title="Previous section group"
              className="flex items-center justify-center gap-0.5 rounded-lg border px-2 py-1 text-[9px] font-bold transition hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: '#090F1C',
                borderColor: '#334155',
                color: '#94A3B8',
              }}
            >
              <ChevronLeft className="h-2.5 w-2.5" style={{ color: '#38BDF8' }} />
              <span style={{ color: '#CBD5E1' }}>GRP</span>
            </button>
          </div>

          {/* Center: Circular Tactile D-Pad */}
          <div
            className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2"
            style={{
              background: 'radial-gradient(circle at 32% 28%, #1E293B 0%, #090F1C 78%)',
              borderColor: '#475569',
              boxShadow:
                'inset 0 2px 5px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.65)',
            }}
          >
            <button
              type="button"
              onClick={() => stepChannel(-1)}
              aria-label="Previous channel"
              title="Previous page (Up)"
              className="absolute top-0.5 left-1/2 -translate-x-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
            >
              <ChevronUp className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
            </button>
            <button
              type="button"
              onClick={() => stepChannel(1)}
              aria-label="Next channel"
              title="Next page (Down)"
              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
            >
              <ChevronDown className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
            </button>
            <button
              type="button"
              onClick={() => stepGroup(-1)}
              aria-label="Previous group"
              title="Previous group (Left)"
              className="absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
            </button>
            <button
              type="button"
              onClick={() => stepGroup(1)}
              aria-label="Next group"
              title="Next group (Right)"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
            >
              <ChevronRight className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
            </button>

            <button
              type="button"
              onClick={() => navigate(activeChannel.path)}
              title={`Open ${activeChannel.displayLabel}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border text-[9px] font-extrabold uppercase tracking-wider transition hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
                borderColor: '#BAE6FD',
                color: '#0F172A',
                boxShadow: '0 0 10px rgba(56,189,248,0.55)',
              }}
            >
              OK
            </button>
          </div>

          {/* Right: CH+ / GRP+ Rocker */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => stepChannel(1)}
              title="Next page channel"
              className="flex items-center justify-center gap-0.5 rounded-lg border px-2 py-1 text-[9.5px] font-extrabold transition hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: '#1E293B',
                borderColor: '#475569',
                color: '#F8FAFC',
              }}
            >
              <span style={{ color: '#F8FAFC' }}>CH+</span>
              <ChevronDown className="h-3 w-3" style={{ color: '#38BDF8' }} />
            </button>
            <button
              type="button"
              onClick={() => stepGroup(1)}
              title="Next section group"
              className="flex items-center justify-center gap-0.5 rounded-lg border px-2 py-1 text-[9px] font-bold transition hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: '#090F1C',
                borderColor: '#334155',
                color: '#94A3B8',
              }}
            >
              <span style={{ color: '#CBD5E1' }}>GRP</span>
              <ChevronRight className="h-2.5 w-2.5" style={{ color: '#38BDF8' }} />
            </button>
          </div>
        </div>

        {/* Group Bank Filter Pills */}
        <div className="mt-2 flex flex-wrap gap-1 border-t pt-1.5" style={{ borderColor: '#1E293B' }}>
          <button
            type="button"
            onClick={() => setSelectedGroupIdx(null)}
            className="rounded-md border px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider transition"
            style={
              selectedGroupIdx === null
                ? {
                    backgroundColor: '#38BDF8',
                    borderColor: '#BAE6FD',
                    color: '#0F172A',
                  }
                : {
                    backgroundColor: '#090F1C',
                    borderColor: '#334155',
                    color: '#94A3B8',
                  }
            }
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
                className="rounded-md border px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider transition"
                style={
                  selected
                    ? {
                        backgroundColor: '#38BDF8',
                        borderColor: '#BAE6FD',
                        color: '#0F172A',
                      }
                    : {
                        backgroundColor: '#090F1C',
                        borderColor: '#334155',
                        color: '#94A3B8',
                      }
                }
              >
                {g.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Backlit Numbered Channel Keypad (Page Router) */}
      <nav
        aria-label="App modules"
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 space-y-2.5"
      >
        {displayedGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {/* Group Header Strip */}
            <div
              className="flex items-center justify-between rounded-lg border px-2 py-1"
              style={{
                backgroundColor: '#090F1C',
                borderColor: '#334155',
              }}
            >
              <span
                className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider"
                style={{ color: '#38BDF8' }}
              >
                <Radio className="h-2.5 w-2.5" style={{ color: '#38BDF8' }} />
                {group.label}
              </span>
              <span
                className="font-mono text-[8.5px] font-bold"
                style={{ color: '#94A3B8' }}
              >
                {group.entries.length} CH
              </span>
            </div>

            {/* Tactile Backlit Route Keys */}
            <div className="space-y-1">
              {group.entries.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group relative flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold transition-all hover:-translate-y-0.5"
                    style={
                      active
                        ? {
                            backgroundColor: '#1E293B',
                            borderColor: '#38BDF8',
                            color: '#F8FAFC',
                            boxShadow:
                              'inset 0 0 12px rgba(56,189,248,0.22), 0 0 12px rgba(56,189,248,0.38)',
                          }
                        : {
                            backgroundColor: '#0F172A',
                            borderColor: '#334155',
                            color: '#E2E8F0',
                          }
                    }
                  >
                    {/* Backlit Channel Number */}
                    <span
                      className="inline-flex h-5 min-w-[22px] shrink-0 items-center justify-center rounded px-1 font-mono text-[9px] font-extrabold leading-none"
                      style={
                        active
                          ? { backgroundColor: '#38BDF8', color: '#0F172A' }
                          : { backgroundColor: '#1E293B', color: '#94A3B8' }
                      }
                    >
                      {item.channelCode}
                    </span>

                    {/* Module Icon */}
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border"
                      style={
                        active
                          ? {
                              backgroundColor: 'rgba(56,189,248,0.18)',
                              borderColor: 'rgba(56,189,248,0.5)',
                            }
                          : {
                              backgroundColor: '#1E293B',
                              borderColor: '#334155',
                            }
                      }
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: active ? '#38BDF8' : '#BAE6FD' }}
                      />
                    </span>

                    {/* Route Title */}
                    <span
                      className="min-w-0 flex-1 truncate text-[11px] font-extrabold leading-snug"
                      style={{ color: active ? '#F8FAFC' : '#E2E8F0' }}
                    >
                      {item.displayLabel}
                    </span>

                    {/* Glowing Cyan LED Indicator Dot */}
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={
                        active
                          ? { backgroundColor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }
                          : { backgroundColor: '#475569' }
                      }
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Remote Account & Power Dock */}
      <div
        className="relative z-10 shrink-0 rounded-2xl border p-2.5 space-y-1.5"
        style={{
          backgroundColor: '#090F1C',
          borderColor: '#334155',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.6)',
        }}
      >
        <div className="px-1">
          <div className="truncate text-[11px] font-extrabold" style={{ color: '#F8FAFC' }}>
            {user?.full_name || 'User'}
          </div>
          <div className="truncate text-[10px] font-semibold" style={{ color: '#38BDF8' }}>
            {user?.email || ''}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-extrabold transition hover:opacity-90"
          style={{
            backgroundColor: '#1E293B',
            borderColor: '#475569',
            color: '#F8FAFC',
          }}
        >
          <LogOut className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
          <span style={{ color: '#F8FAFC' }}>Sign out</span>
        </button>
      </div>
    </div>
  );
}