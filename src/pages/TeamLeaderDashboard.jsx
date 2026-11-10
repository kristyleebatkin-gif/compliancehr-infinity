import React, { useEffect, useState } from 'react';
import '@/components/teamleader/teamLeader.css';
import { useRole } from '@/lib/useRole';
import useTeamLeaderData from '@/components/teamleader/useTeamLeaderData';
import TeamLeaderHome from '@/components/teamleader/TeamLeaderHome';
import ShiftNotesScreen from '@/components/teamleader/ShiftNotesScreen';
import HighlightsScreen from '@/components/teamleader/HighlightsScreen';
import CalculatorScreen from '@/components/teamleader/CalculatorScreen';
import { TeamScreen, RosterScreen } from '@/components/teamleader/TeamAndRosterScreens';
import TeamLeaderNav from '@/components/teamleader/TeamLeaderNav';
import StudioLauncher from '@/components/today/studio/StudioLauncher';
import SecurityPinGate from '@/components/security/SecurityPinGate';
import useScreensaver from '@/components/screensaver/useScreensaver';
import ScreensaverOverlay from '@/components/screensaver/ScreensaverOverlay';
import ScreensaverSettingsDialog from '@/components/screensaver/ScreensaverSettingsDialog';

const ERROR_LABELS = {
  shifts: 'today’s roster',
  notes: 'today’s shift notes',
  todos: 'team tasks',
  incidents: 'incident records',
  team: 'staff directory'
};

export default function TeamLeaderDashboard() {
  return (
    <SecurityPinGate workspace="team-leader" title="Team Leader – Lead" subtitle="Jamie's team workspace">
      {({ openSecurityPin }) => <TeamLeaderWorkspace onSecurityPin={openSecurityPin} />}
    </SecurityPinGate>
  );
}

function TeamLeaderWorkspace({ onSecurityPin }) {
  const { user } = useRole();
  const { data, derived, reload } = useTeamLeaderData();
  const [screen, setScreen] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('cs-team-theme') || 'dark');
  const screensaver = useScreensaver({ workspace: 'team-leader' });

  useEffect(() => {
    localStorage.setItem('cs-team-theme', theme);
  }, [theme]);

  const back = () => setScreen('home');
  const failedSections = Object.entries(data?.errors || {}).filter(([, error]) => Boolean(error)).map(([key]) => ERROR_LABELS[key] || key);
  const studioContext = derived
    ? `${derived.onShift.length} of ${(data.team || []).length} team members on shift, ${derived.late.length} not clocked in, ${derived.unfilled.length} unfilled shifts, ${derived.missingNotes.length} shift notes still missing, ${derived.escalations.length} escalations waiting.`
    : '';

  return (
    <div className="tl-shell">
      <div className="tl-phone" data-theme={theme}>
        <div className="tl-scroll flex-1 overflow-y-auto pb-2">
          {!data || !derived ? (
            <div className="space-y-2.5 p-3.5">
              {[0, 1, 2, 3].map((key) => (
                <div key={key} className="tl-card h-24 animate-pulse" />
              ))}
            </div>
          ) : failedSections.length > 0 ? (
            <div className="space-y-3 p-3.5">
              <section role="alert" className="tl-card space-y-2 p-4">
                <h1 className="tl-text text-base font-extrabold">Team data is incomplete</h1>
                <p className="tl-muted text-xs leading-relaxed">
                  Could not load: {failedSections.join(', ')}. Team counts are hidden until all required records are available.
                </p>
                <button type="button" onClick={reload} className="tl-btn tl-primary">Retry team data</button>
              </section>
            </div>
          ) : screen === 'workbench' ? (
            <div className="tl-workbench p-3.5">
              <StudioLauncher
                context={studioContext}
                title="Jamie’s workbench"
                subtitle="Five studios in one — tuned for the Surface Pro 12th and Galaxy Tab S11 Ultra"
              />
            </div>
          ) : screen === 'notes' ? (
            <ShiftNotesScreen shifts={data.shifts} notes={data.notes} onBack={back} />
          ) : screen === 'highlights' ? (
            <HighlightsScreen derived={derived} onBack={back} />
          ) : screen === 'calculator' ? (
            <CalculatorScreen onBack={back} />
          ) : screen === 'team' ? (
            <TeamScreen team={data.team} derived={derived} onBack={back} />
          ) : screen === 'roster' ? (
            <RosterScreen shifts={data.shifts} derived={derived} onBack={back} />
          ) : (
            <TeamLeaderHome
              user={user}
              data={data}
              derived={derived}
              theme={theme}
              onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              onScreen={setScreen}
              onSecurityPin={onSecurityPin}
              onScreensaver={() => screensaver.setSettingsOpen(true)}
            />
          )}
        </div>
        <TeamLeaderNav screen={screen} onSelect={setScreen} />
      </div>

      <ScreensaverSettingsDialog
        open={screensaver.settingsOpen}
        onOpenChange={screensaver.setSettingsOpen}
        title={screensaver.roleLabel}
        designs={screensaver.designs}
        activeId={screensaver.designId}
        onSelect={screensaver.selectDesign}
        onPreview={screensaver.previewScreensaver}
      />

      {screensaver.open && derived && failedSections.length === 0 && (
        <ScreensaverOverlay
          design={screensaver.design}
          name={user?.full_name}
          roleLabel={screensaver.roleLabel}
          stats={[
            { label: 'on shift', value: derived.onShift.length },
            { label: 'not clocked in', value: derived.late.length },
            { label: 'notes missing', value: derived.missingNotes.length },
            { label: 'escalations', value: derived.escalations.length }
          ]}
          onClose={screensaver.closeScreensaver}
        />
      )}
    </div>
  );
}