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

export default function TeamLeaderDashboard() {
  const { user } = useRole();
  const { data, derived } = useTeamLeaderData();
  const [screen, setScreen] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('cs-team-theme') || 'light');

  useEffect(() => {
    localStorage.setItem('cs-team-theme', theme);
  }, [theme]);

  const back = () => setScreen('home');

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
            />
          )}
        </div>
        <TeamLeaderNav screen={screen} onSelect={setScreen} />
      </div>
    </div>
  );
}