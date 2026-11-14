import React, { useEffect, useMemo, useRef, useState } from 'react';
import '@/components/today/today.css';
import { useRole } from '@/lib/useRole';
import { canAccessNav } from '@/lib/roles';
import useTodayData, { todayIso } from '@/components/today/useTodayData';
import TodaySidebar from '@/components/today/TodaySidebar';
import TodayHeader from '@/components/today/TodayHeader';
import TodayRadio from '@/components/today/TodayRadio';
import TodayMobileNav from '@/components/today/TodayMobileNav';
import AskBar from '@/components/today/AskBar';
import MorningBriefTiles from '@/components/today/MorningBriefTiles';
import EmailsPanel from '@/components/today/EmailsPanel';
import RosterTodayPanel from '@/components/today/RosterTodayPanel';
import InvoicesPanel from '@/components/today/InvoicesPanel';
import NdisUpdatesPanel from '@/components/today/NdisUpdatesPanel';
import ComplianceJobPanel from '@/components/today/ComplianceJobPanel';
import TodosPanel from '@/components/today/TodosPanel';
import TeamNowPanel from '@/components/today/TeamNowPanel';
import YouPanel from '@/components/today/YouPanel';
import TodayDock from '@/components/today/TodayDock';
import StudioLauncher from '@/components/today/studio/StudioLauncher';
import SecurityPinGate from '@/components/security/SecurityPinGate';
import useScreensaver from '@/components/screensaver/useScreensaver';
import ScreensaverOverlay from '@/components/screensaver/ScreensaverOverlay';
import ScreensaverSettingsDialog from '@/components/screensaver/ScreensaverSettingsDialog';

const ERROR_LABELS = {
  emails: 'email inbox',
  shifts: 'today’s roster',
  invoices: 'draft invoices',
  notes: 'today’s shift notes',
  ndis: 'NDIS updates',
  todos: 'tasks',
  team: 'staff directory',
  incidents: 'incident records',
  issues: 'compliance issues',
  emailCount: 'email totals',
  shiftCount: 'roster totals',
  invoiceCount: 'draft-invoice totals',
  noteCount: 'shift-note totals'
};

function SectionUnavailable({ label }) {
  return (
    <section role="alert" className="t-card flex min-h-36 flex-col justify-center gap-1.5 border border-[#FF2E9A]/40 p-4">
      <p className="t-title text-sm font-extrabold">Unable to load {label}</p>
      <p className="t-muted text-xs leading-relaxed">This section is unavailable right now. No empty or zero result is being reported.</p>
    </section>
  );
}

export default function TodayDashboard() {
  return (
    <SecurityPinGate workspace="today" title="Administration – Lead" subtitle="Sherelle's daily operations workspace">
      {({ openSecurityPin }) => <TodayWorkspace onSecurityPin={openSecurityPin} />}
    </SecurityPinGate>
  );
}

function TodayWorkspace({ onSecurityPin }) {
  const { user, navRole } = useRole();
  const { data, reload } = useTodayData();
  const wellbeingRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('cs-today-theme') || 'dark');
  const [started, setStarted] = useState(() => localStorage.getItem('cs-today-started') === todayIso());
  const screensaver = useScreensaver({ workspace: 'today' });

  const visibleKeys = {
    emails: canAccessNav(navRole, 'communications'),
    shifts: canAccessNav(navRole, 'rostering'),
    invoices: canAccessNav(navRole, 'invoicing'),
    notesOutstanding: canAccessNav(navRole, 'communications'),
    ndis: canAccessNav(navRole, 'ndis-news'),
    todos: canAccessNav(navRole, 'tasks'),
    team: canAccessNav(navRole, 'our-staff') && canAccessNav(navRole, 'rostering') && canAccessNav(navRole, 'communications'),
    compliance: canAccessNav(navRole, 'compliance') && canAccessNav(navRole, 'incidents')
  };

  useEffect(() => {
    localStorage.setItem('cs-today-theme', theme);
  }, [theme]);

  const counts = useMemo(() => ({
    emails: data?.summary?.emails ?? 0,
    shifts: data?.summary?.shifts ?? 0,
    invoices: data?.summary?.invoices ?? 0,
    notesOutstanding: data?.summary?.notesOutstanding ?? 0,
    onShift: (data?.shifts || []).filter((shift) => shift.clock_in && !shift.clock_out).length,
    unfilled: (data?.shifts || []).filter((shift) => !shift.employee_name && shift.status !== 'Cancelled').length
  }), [data]);

  const plan = useMemo(() => {
    if (!data) return [];
    const tasks = visibleKeys.todos && !data.errors?.todos ? (data.todos || []).slice(0, 2) : [];
    const entries = tasks.map((task) => ({ id: task.id, label: task.title }));
    if (visibleKeys.invoices && !data.errors?.invoiceCount && !data.errors?.invoices) {
      entries.push({ id: 'invoices', label: `${counts.invoices} invoices to approve` });
    }
    return entries;
  }, [data, counts, visibleKeys.todos, visibleKeys.invoices]);

  const studioContext = useMemo(() => {
    if (!data) return '';
    return `${data.summary?.emails ?? 0} emails in the inbox, ${counts.shifts} shifts today (${counts.onShift} in progress, ${counts.unfilled} unfilled), ${counts.invoices} draft invoices, ${(data.todos || []).length} open tasks, ${counts.notesOutstanding} outstanding shift notes.`;
  }, [data, counts]);

  const failedSections = useMemo(
    () => Object.entries(data?.errors || {}).filter(([, error]) => Boolean(error)).map(([key]) => ERROR_LABELS[key] || key),
    [data]
  );
  const hasErrors = failedSections.length > 0;

  const startWorkday = () => {
    localStorage.setItem('cs-today-started', todayIso());
    setStarted(true);
  };

  return (
    <div className="today-shell" data-theme={theme}>
      <div className="mx-auto flex w-full max-w-[1480px] items-start gap-4 px-3 pb-24 pt-4 sm:px-5 min-[1640px]:max-w-[1680px]">
        <TodaySidebar
          plan={plan}
          onWellbeing={() => wellbeingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        />

        <main className="min-w-0 flex-1 space-y-3.5">
          <TodayHeader
            user={user}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            started={started}
            onStart={startWorkday}
            onSecurityPin={onSecurityPin}
            onScreensaver={() => screensaver.setSettingsOpen(true)}
          />

          <TodayRadio />

          <TodayMobileNav />

          {!data ? (
            <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3 min-[1640px]:grid-cols-4">
              {[0, 1, 2, 3, 4, 5].map((key) => <div key={key} className="t-card h-40 animate-pulse" />)}
            </div>
          ) : (
            <>
              {hasErrors ? (
                <div role="alert" className="t-card flex flex-wrap items-center justify-between gap-3 border border-[#FF2E9A]/50 p-3.5">
                  <div className="min-w-0">
                    <p className="t-title text-sm font-extrabold">Some dashboard information could not be loaded</p>
                    <p className="t-muted mt-1 text-xs leading-relaxed">
                      Unavailable: {failedSections.join(', ')}. Summary totals are hidden so incomplete data is not presented as a complete result.
                    </p>
                  </div>
                  <button type="button" onClick={reload} className="t-btn t-btn-primary shrink-0">Retry data</button>
                </div>
              ) : (
                <>
                  <AskBar counts={counts} visibleKeys={visibleKeys} />
                  <MorningBriefTiles counts={counts} visibleKeys={visibleKeys} />
                </>
              )}

              <StudioLauncher context={studioContext} />

              <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3 min-[1640px]:grid-cols-4">
                {visibleKeys.emails && (data.errors?.emails ? <SectionUnavailable label={ERROR_LABELS.emails} /> : <EmailsPanel emails={data.emails} />)}
                {visibleKeys.shifts && visibleKeys.notesOutstanding && (data.errors?.shifts || data.errors?.notes ? <SectionUnavailable label="roster and shift-note data" /> : <RosterTodayPanel shifts={data.shifts} notes={data.notes} />)}
                {visibleKeys.invoices && (data.errors?.invoices ? <SectionUnavailable label={ERROR_LABELS.invoices} /> : <InvoicesPanel invoices={data.invoices} onRefresh={reload} />)}
                {visibleKeys.ndis && (data.errors?.ndis ? <SectionUnavailable label={ERROR_LABELS.ndis} /> : <NdisUpdatesPanel updates={data.ndis} />)}
                {visibleKeys.compliance && (data.errors?.issues || data.errors?.incidents ? <SectionUnavailable label="compliance and incident data" /> : <ComplianceJobPanel issues={data.issues} incidents={data.incidents} />)}
                {visibleKeys.todos && (data.errors?.todos ? <SectionUnavailable label={ERROR_LABELS.todos} /> : <TodosPanel todos={data.todos} />)}
                {visibleKeys.team && (data.errors?.team || data.errors?.shifts || data.errors?.notes ? <SectionUnavailable label="team availability data" /> : <TeamNowPanel team={data.team} shifts={data.shifts} notes={data.notes} />)}
                <div ref={wellbeingRef} className="xl:col-span-1"><YouPanel /></div>
              </div>
            </>
          )}
        </main>
      </div>
      <TodayDock />

      <ScreensaverSettingsDialog
        open={screensaver.settingsOpen}
        onOpenChange={screensaver.setSettingsOpen}
        title={screensaver.roleLabel}
        designs={screensaver.designs}
        activeId={screensaver.designId}
        onSelect={screensaver.selectDesign}
        onPreview={screensaver.previewScreensaver}
      />

      {screensaver.open && (
        <ScreensaverOverlay
          design={screensaver.design}
          name={user?.full_name}
          roleLabel={screensaver.roleLabel}
          stats={
            data && !hasErrors
              ? [
                  { label: 'in the inbox', value: counts.emails },
                  { label: 'shifts today', value: counts.shifts },
                  { label: 'draft invoices', value: counts.invoices },
                  { label: 'open tasks', value: (data.todos || []).length }
                ]
              : []
          }
          onClose={screensaver.closeScreensaver}
        />
      )}
    </div>
  );
}