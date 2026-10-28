import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Power,
  Radio,
  Tv,
  ExternalLink,
} from 'lucide-react';

/**
 * Obsidian Smart Remote — brushed dark obsidian TV-remote style screen controller
 * (#0F172A, #1E293B, #38BDF8, #F8FAFC) with an OLED status readout bar,
 * tactile circular D-pad channel rocker on the left, optional mode/group bank pills,
 * and a backlit numbered channel keypad with glowing cyan LED indicator dots on the right.
 */
export default function ObsidianSmartRemote({
  title = 'Smart Screen Remote',
  subtitle = 'Select a channel or use the D-pad rocker to switch live screens',
  channels = [],
  activeKey,
  onSelectChannel,
  onConfirmChannel,
  confirmHref,
  confirmLabel = 'Open Screen',
  banks = [],
  activeBank,
  onSelectBank,
  screenModes = [],
  activeScreenMode,
  onSelectScreenMode,
  compact = false,
  columnsClass = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
}) {
  const activeIndex = Math.max(
    0,
    channels.findIndex((c) => c.key === activeKey)
  );
  const currentChannel = channels[activeIndex] || channels[0] || {
    key: 'default',
    label: title,
    sub: subtitle,
  };

  const stepChannel = (delta) => {
    if (!channels.length || !onSelectChannel) return;
    const nextIdx = (activeIndex + delta + channels.length) % channels.length;
    onSelectChannel(channels[nextIdx].key);
  };

  return (
    <div
      className={`preserve-island-theme relative overflow-hidden rounded-2xl border shadow-xl ${
        compact ? 'p-2.5' : 'p-3.5 sm:p-4'
      }`}
      style={{
        background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 60%, #090F1C 100%)',
        borderColor: '#475569',
        color: '#F8FAFC',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 28px -8px rgba(15,23,42,0.55)',
      }}
    >
      {/* Subtle brushed-obsidian metallic grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'repeating-linear-gradient(176deg, transparent 0 3px, rgba(148,163,184,0.22) 4px, transparent 5px 8px)',
        }}
      />

      <div className="relative z-10 space-y-2.5">
        {/* Top OLED Status Strip */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2"
          style={{
            backgroundColor: '#090F1C',
            borderColor: '#334155',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.55)',
          }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
              style={{
                backgroundColor: 'rgba(56,189,248,0.14)',
                borderColor: 'rgba(56,189,248,0.45)',
                color: '#38BDF8',
                boxShadow: '0 0 12px rgba(56,189,248,0.32)',
              }}
            >
              <Tv className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
            </span>
            <div className="min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="rounded border px-1.5 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider"
                  style={{
                    backgroundColor: 'rgba(56,189,248,0.16)',
                    borderColor: 'rgba(56,189,248,0.4)',
                    color: '#38BDF8',
                  }}
                >
                  CH {String(activeIndex + 1).padStart(2, '0')}/{String(channels.length || 1).padStart(2, '0')}
                </span>
                <span
                  className="text-xs sm:text-sm font-extrabold tracking-tight"
                  style={{ color: '#F8FAFC' }}
                >
                  {currentChannel.label}
                </span>
              </div>
              <div
                className="text-[10.5px] font-medium leading-tight"
                style={{ color: '#CBD5E1' }}
              >
                {currentChannel.sub || subtitle}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Screen Mode Switcher (e.g., Screen 1 + Screen 2 / Screen 1 / Screen 2) */}
            {screenModes.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-1 rounded-lg border p-0.5"
                style={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
              >
                {screenModes.map((m) => {
                  const isModeActive = activeScreenMode === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => onSelectScreenMode && onSelectScreenMode(m.key)}
                      className="rounded-md px-2 py-1 text-[10px] font-extrabold transition-all"
                      style={
                        isModeActive
                          ? {
                              backgroundColor: '#38BDF8',
                              color: '#0F172A',
                              boxShadow: '0 0 10px rgba(56,189,248,0.55)',
                            }
                          : {
                              backgroundColor: 'transparent',
                              color: '#CBD5E1',
                            }
                      }
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Channel Stepper Rockers */}
            <div
              className="inline-flex items-center rounded-lg border p-0.5"
              style={{ backgroundColor: '#0F172A', borderColor: '#334155' }}
            >
              <button
                type="button"
                onClick={() => stepChannel(-1)}
                title="Previous channel"
                className="inline-flex h-6 items-center gap-0.5 rounded-md px-2 text-[10px] font-extrabold transition hover:opacity-90"
                style={{ color: '#F8FAFC' }}
              >
                <ChevronUp className="h-3 w-3" style={{ color: '#38BDF8' }} />
                <span style={{ color: '#F8FAFC' }}>CH-</span>
              </button>
              <span className="h-3.5 w-px" style={{ backgroundColor: '#334155' }} />
              <button
                type="button"
                onClick={() => stepChannel(1)}
                title="Next channel"
                className="inline-flex h-6 items-center gap-0.5 rounded-md px-2 text-[10px] font-extrabold transition hover:opacity-90"
                style={{ color: '#F8FAFC' }}
              >
                <span style={{ color: '#F8FAFC' }}>CH+</span>
                <ChevronDown className="h-3 w-3" style={{ color: '#38BDF8' }} />
              </button>
            </div>

            {/* Live LED status badge */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider"
              style={{
                backgroundColor: '#0F172A',
                borderColor: 'rgba(56,189,248,0.45)',
                color: '#38BDF8',
              }}
            >
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }}
              />
              <span style={{ color: '#38BDF8' }}>LIVE</span>
            </span>
          </div>
        </div>

        {/* Optional Category Bank Strip */}
        {banks.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1.5"
            style={{ backgroundColor: 'rgba(15,23,42,0.85)', borderColor: '#334155' }}
          >
            <span
              className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider"
              style={{ color: '#38BDF8' }}
            >
              <Radio className="h-3 w-3" style={{ color: '#38BDF8' }} />
              <span style={{ color: '#38BDF8' }}>Channel Banks</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {banks.map((b) => {
                const active = activeBank === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBank && onSelectBank(b.id)}
                    className="rounded-lg border px-2.5 py-1 text-[10.5px] font-extrabold transition-all"
                    style={
                      active
                        ? {
                            backgroundColor: 'rgba(56,189,248,0.2)',
                            borderColor: '#38BDF8',
                            color: '#F8FAFC',
                            boxShadow: '0 0 10px rgba(56,189,248,0.35)',
                          }
                        : {
                            backgroundColor: '#1E293B',
                            borderColor: '#334155',
                            color: '#CBD5E1',
                          }
                    }
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Remote Deck: Circular D-Pad Rocker on Left + Backlit Numbered Keypad on Right */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-stretch">
          {/* Left Pod: Circular D-Pad Navigation Rocker */}
          <div
            className={`${
              compact ? 'md:col-span-4 lg:col-span-3' : 'md:col-span-3 lg:col-span-2'
            } flex flex-col items-center justify-between rounded-xl border p-2.5`}
            style={{
              backgroundColor: '#0F172A',
              borderColor: '#334155',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.45)',
            }}
          >
            <div
              className="flex w-full items-center justify-between text-[9.5px] font-extrabold uppercase tracking-wider"
              style={{ color: '#94A3B8' }}
            >
              <span style={{ color: '#94A3B8' }}>REMOTE PAD</span>
              <Power className="h-3 w-3" style={{ color: '#38BDF8' }} />
            </div>

            {/* Tactile Circular D-Pad */}
            <div
              className={`relative my-1.5 flex items-center justify-center rounded-full border-2 ${
                compact ? 'h-24 w-24' : 'h-28 w-28'
              }`}
              style={{
                background: 'radial-gradient(circle at 32% 28%, #1E293B 0%, #090F1C 78%)',
                borderColor: '#475569',
                boxShadow:
                  'inset 0 2px 6px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.6)',
              }}
            >
              {/* Up */}
              <button
                type="button"
                onClick={() => stepChannel(-1)}
                aria-label="Previous screen channel"
                title="Previous screen channel"
                className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
                style={{ color: '#E2E8F0' }}
              >
                <ChevronUp className="h-4 w-4" style={{ color: '#38BDF8' }} />
              </button>
              {/* Down */}
              <button
                type="button"
                onClick={() => stepChannel(1)}
                aria-label="Next screen channel"
                title="Next screen channel"
                className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
                style={{ color: '#E2E8F0' }}
              >
                <ChevronDown className="h-4 w-4" style={{ color: '#38BDF8' }} />
              </button>
              {/* Left */}
              <button
                type="button"
                onClick={() => stepChannel(-1)}
                aria-label="Previous screen channel"
                title="Previous screen channel"
                className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
                style={{ color: '#E2E8F0' }}
              >
                <ChevronLeft className="h-4 w-4" style={{ color: '#38BDF8' }} />
              </button>
              {/* Right */}
              <button
                type="button"
                onClick={() => stepChannel(1)}
                aria-label="Next screen channel"
                title="Next screen channel"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:scale-110 active:scale-95"
                style={{ color: '#E2E8F0' }}
              >
                <ChevronRight className="h-4 w-4" style={{ color: '#38BDF8' }} />
              </button>

              {/* Center OK Button */}
              {confirmHref ? (
                <Link
                  to={confirmHref}
                  title={confirmLabel}
                  className="flex h-10 w-10 items-center justify-center rounded-full border text-[10px] font-extrabold uppercase tracking-wider transition hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
                    borderColor: '#BAE6FD',
                    color: '#0F172A',
                    boxShadow: '0 0 14px rgba(56,189,248,0.55)',
                  }}
                >
                  OK
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onConfirmChannel
                      ? onConfirmChannel(currentChannel)
                      : stepChannel(1)
                  }
                  title={confirmLabel}
                  className="flex h-10 w-10 items-center justify-center rounded-full border text-[10px] font-extrabold uppercase tracking-wider transition hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
                    borderColor: '#BAE6FD',
                    color: '#0F172A',
                    boxShadow: '0 0 14px rgba(56,189,248,0.55)',
                  }}
                >
                  OK
                </button>
              )}
            </div>

            {confirmHref ? (
              <Link
                to={confirmHref}
                className="inline-flex w-full items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-extrabold transition hover:opacity-95"
                style={{
                  backgroundColor: 'rgba(56,189,248,0.16)',
                  borderColor: 'rgba(56,189,248,0.45)',
                  color: '#38BDF8',
                }}
              >
                <span className="truncate" style={{ color: '#38BDF8' }}>
                  {confirmLabel}
                </span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0" style={{ color: '#38BDF8' }} />
              </Link>
            ) : (
              <div
                className="w-full text-center font-mono text-[9.5px] font-bold"
                style={{ color: '#38BDF8' }}
              >
                {title}
              </div>
            )}
          </div>

          {/* Right Matrix: Tactile Numbered Backlit Channel Keys */}
          <div
            className={`${
              compact ? 'md:col-span-8 lg:col-span-9' : 'md:col-span-9 lg:col-span-10'
            } grid ${columnsClass} gap-2 auto-rows-fr content-start`}
          >
            {channels.map((ch, idx) => {
              const Icon = ch.icon;
              const isSelected = ch.key === activeKey;
              return (
                <button
                  key={ch.key}
                  type="button"
                  onClick={() => onSelectChannel && onSelectChannel(ch.key)}
                  aria-pressed={isSelected}
                  className="group relative flex h-full min-h-[54px] flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-150 hover:-translate-y-0.5"
                  style={
                    isSelected
                      ? {
                          backgroundColor: '#1E293B',
                          borderColor: '#38BDF8',
                          color: '#F8FAFC',
                          boxShadow:
                            'inset 0 0 12px rgba(56,189,248,0.22), 0 0 12px rgba(56,189,248,0.35)',
                        }
                      : {
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          color: '#E2E8F0',
                        }
                  }
                >
                  <div className="flex w-full items-center justify-between gap-1.5">
                    <span
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold tracking-wider"
                      style={
                        isSelected
                          ? { backgroundColor: '#38BDF8', color: '#0F172A' }
                          : { backgroundColor: '#1E293B', color: '#94A3B8' }
                      }
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {Icon && (
                        <Icon
                          className="h-3.5 w-3.5 shrink-0"
                          style={{ color: isSelected ? '#38BDF8' : '#94A3B8' }}
                        />
                      )}
                      <span
                        className="h-2 w-2 shrink-0 rounded-full transition-all"
                        style={
                          isSelected
                            ? { backgroundColor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }
                            : { backgroundColor: '#475569' }
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-1.5 min-w-0">
                    <div
                      className="text-xs font-extrabold leading-snug tracking-tight break-words"
                      style={{ color: '#F8FAFC' }}
                    >
                      {ch.label}
                    </div>
                    {ch.sub && (
                      <div
                        className="mt-0.5 text-[10px] font-medium leading-tight break-words"
                        style={{ color: '#CBD5E1' }}
                      >
                        {ch.sub}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}