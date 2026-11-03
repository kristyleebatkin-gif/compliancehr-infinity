import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function ObsidianSmartRemote({
  title = '',
  subtitle = '',
  channels = [],
  activeKey = '',
  onSelectChannel,
  onConfirmChannel,
  confirmHref = '',
  confirmLabel = '',
  banks = [],
  activeBank = '',
  onSelectBank,
  screenModes = [],
  activeScreenMode = '',
  onSelectScreenMode,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      {/* Header & View Mode Controls */}
      {(title || subtitle || banks.length > 0 || screenModes.length > 0) && (
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-[#F8FAFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {(title || subtitle) && (
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs font-normal text-[#0A2B6D]/75">{subtitle}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {banks.length > 0 && (
              <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Workspace domain groups">
                {banks.map((b) => {
                  const active = b.id === activeBank;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => onSelectBank && onSelectBank(b.id)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                        active
                          ? 'bg-[#0A2B6D] text-white shadow-2xs'
                          : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            )}

            {screenModes.length > 0 && (
              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                {screenModes.map((m) => {
                  const modeKey = m.id || m.key;
                  const active = modeKey === activeScreenMode;
                  return (
                    <button
                      key={modeKey}
                      type="button"
                      onClick={() => onSelectScreenMode && onSelectScreenMode(modeKey)}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                        active
                          ? 'bg-[#0072FF] text-white shadow-2xs'
                          : 'text-[#0A2B6D]/75 hover:text-[#0A2B6D]'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clean Purview / ServiceNow Pivot Tab Bar */}
      <div
        role="tablist"
        aria-label={title || 'Module views'}
        className="flex flex-wrap items-center gap-1.5 p-3"
      >
        {channels.map((ch) => {
          const Icon = ch.icon || ShieldCheck;
          const active = ch.key === activeKey;
          return (
            <button
              key={ch.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (onSelectChannel) onSelectChannel(ch.key);
                if (onConfirmChannel && active) onConfirmChannel(ch);
              }}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                active
                  ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-2xs'
                  : 'border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF] hover:bg-white'
              }`}
            >
              <Icon
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: active ? '#00C6FF' : '#0072FF' }}
              />
              <span>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {confirmHref && (
        <div className="flex justify-end border-t border-slate-100 bg-[#F8FAFC] px-4 py-2">
          <Link
            to={confirmHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0072FF]"
          >
            <span>{confirmLabel || 'Open Selected Workspace'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}