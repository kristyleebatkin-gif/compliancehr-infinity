import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  Check,
  RotateCcw,
  Sparkles,
  Plus,
  FileWarning,
  UserPlus,
  CalendarClock,
  FileSpreadsheet,
  Bot,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const QUICK_LAUNCH_ACTIONS = [
  { label: 'Log Incident', path: '/incidents/new', icon: FileWarning, color: '#FF2E9A' },
  { label: 'Participant Intake', path: '/intake/participant', icon: UserPlus, color: '#0072FF' },
  { label: 'Employee Intake', path: '/intake/employee', icon: Plus, color: '#5A00D6' },
  { label: 'Roster & Shifts', path: '/roster', icon: CalendarClock, color: '#A100FF' },
  { label: 'Create Invoice', path: '/invoicing', icon: FileSpreadsheet, color: '#0A2B6D' },
  { label: 'Ask Infinity AI', path: '/assistant', icon: Bot, color: '#00C6FF' },
];

export default function DashboardPersonaliser({
  suites = [],
  hiddenSuites = [],
  onToggleSuite,
  onResetSuites,
  density = 'comfortable',
  onChangeDensity,
}) {
  const [open, setOpen] = useState(false);

  const configurableSuites = suites.filter((s) => s.id !== 'all');

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-panel space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Quick Productivity Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F0FF] px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
            <Sparkles className="h-3 w-3 text-[#FF2E9A]" />
            Quick Launch
          </span>
          {QUICK_LAUNCH_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition hover:-translate-y-0.5 hover:border-[#0072FF] hover:text-[#0072FF]"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: action.color }} />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Dashboard Personalisation Toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition hover:bg-[#F5F0FF]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#5A00D6]" />
          <span>Personalise Dashboard</span>
          {hiddenSuites.length > 0 && (
            <span className="rounded-full bg-[#5A00D6] px-1.5 py-0.2 text-[10px] font-black text-white">
              {configurableSuites.length - hiddenSuites.length}/{configurableSuites.length}
            </span>
          )}
          {open ? (
            <ChevronUp className="h-3.5 w-3.5 text-[#0A2B6D]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[#0A2B6D]" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 pt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-extrabold text-[#0A2B6D]">
                Personalise Your Executive Workspace
              </h3>
              <p className="text-[11px] font-medium text-slate-600">
                Choose which dashboard suites appear in your "All Workspaces" view and adjust visual density. Preferences save automatically.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5">
                {['comfortable', 'compact'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onChangeDensity(mode)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold capitalize transition ${
                      density === mode
                        ? 'bg-[#0A2B6D] text-white'
                        : 'text-[#0A2B6D] hover:bg-[#F5F0FF]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onResetSuites}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#5A00D6] hover:bg-[#F5F0FF]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Show All</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {configurableSuites.map((suite) => {
              const visible = !hiddenSuites.includes(suite.id);
              const Icon = suite.icon;
              return (
                <button
                  key={suite.id}
                  type="button"
                  onClick={() => onToggleSuite(suite.id)}
                  className={`flex items-center justify-between gap-2 rounded-xl border-2 p-2.5 text-left transition ${
                    visible
                      ? 'border-[#0A2B6D] bg-white text-[#0A2B6D]'
                      : 'border-slate-200 bg-slate-50/60 text-slate-400 opacity-75'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: visible ? suite.color : '#94A3B8' }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold leading-tight">{suite.label}</div>
                      <div className="mt-0.5 text-[10px] font-medium leading-tight text-slate-500">
                        {suite.sub}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      visible
                        ? 'border-[#0072FF] bg-[#0072FF] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {visible && <Check className="h-3 w-3 text-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}