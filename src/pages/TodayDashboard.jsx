import React, { useEffect, useMemo, useRef, useState } from 'react';
import '@/components/today/today.css';
import { useRole } from '@/lib/useRole';
import useTodayData, { todayIso } from '@/components/today/useTodayData';
import TodaySidebar from '@/components/today/TodaySidebar';
import TodayHeader from '@/components/today/TodayHeader';
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

export default function TodayDashboard() {
  const { user } = useRole();
  const { data, reload } = useTodayData();
  const wellbeingRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('cs-today-theme') || 'light');
  const [started, setStarted] = useState(() => localStorage.getItem('cs-today-started') === todayIso());

  useEffect(() => {
    localStorage.setItem('cs-today-theme', theme);
  }, [theme]);

  const counts = useMemo(() => {
    const emails = data?.emails || [];
    const shifts = data?.shifts || [];
    const invoices = data?.invoices || [];
    const notes = data?.notes || [];
    return {
      emails: emails.filter((email) => !['Responded', 'Archived'].includes(email.lifecycle_status)).length,
      shifts: shifts.length,
      invoices: invoices.length,
      notesOutstanding: notes.filter((note) => note.lifecycle_status !== 'Acknowledged').length,
      onShift: shifts.filter((shift) => shift.clock_in && !shift.clock_out).length,
      unfilled: shifts.filter((shift) => !shift.employee_name).length
    };
  }, [data]);

  const plan = useMemo(() => {
    const todos = data?.todos || [];
    return [
      ...todos.slice(0, 2).map((task) => ({ id: task.id, label: task.title })),
      { id: 'invoices', label: `${counts.invoices} invoices to approve` }
    ];
  }, [data, counts]);

  const startWorkday = () => {
    localStorage.setItem('cs-today-started', todayIso());
    setStarted(true);
  };

  return (
    <div className="today-shell" data-theme={theme}>
      <div className="mx-auto flex w-full max-w-[1480px] items-start gap-4 px-3 pb-24 pt-4 sm:px-5">
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
          />

          <AskBar counts={counts} />
          <MorningBriefTiles counts={counts} />

          {!data ? (
            <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((key) => (
                <div key={key} className="t-card h-40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
              <EmailsPanel emails={data.emails} />
              <RosterTodayPanel shifts={data.shifts} notes={data.notes} />
              <InvoicesPanel invoices={data.invoices} onRefresh={reload} />
              <NdisUpdatesPanel updates={data.ndis} />
              <ComplianceJobPanel issues={data.issues} incidents={data.incidents} />
              <TodosPanel todos={data.todos} />
              <TeamNowPanel team={data.team} shifts={data.shifts} notes={data.notes} />
              <div ref={wellbeingRef} className="xl:col-span-1">
                <YouPanel />
              </div>
            </div>
          )}
        </main>
      </div>
      <TodayDock />
    </div>
  );
}