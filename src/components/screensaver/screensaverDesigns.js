// Personalised screensaver designs — five per lead dashboard.
// Each person picks their own from their dashboard settings; the choice is
// remembered per workspace on their device.

export const SCREENSAVER_WORKSPACES = {
  today: {
    label: 'Administration – Lead',
    owner: 'Sherelle',
    storageKey: 'cs-screensaver-today'
  },
  'team-leader': {
    label: 'Team Leader – Lead',
    owner: 'Jamie',
    storageKey: 'cs-screensaver-team-leader'
  }
};

export const SCREENSAVER_DESIGNS = {
  today: [
    {
      id: 'admin-morning-brief',
      name: 'Morning Brief',
      blurb: 'A warm sunrise over the day’s first inbox.',
      motif: 'sun',
      gradient: 'linear-gradient(140deg, #1B1140 0%, #7A3A2C 52%, #F6B45C 100%)',
      accent: '#FFD79A'
    },
    {
      id: 'admin-inbox-zero',
      name: 'Inbox Zero',
      blurb: 'Calm blue grid, everything filed and clear.',
      motif: 'grid',
      gradient: 'linear-gradient(150deg, #04122E 0%, #0A2B6D 58%, #0072FF 100%)',
      accent: '#8FD8FF'
    },
    {
      id: 'admin-ledger-lines',
      name: 'Ledger Lines',
      blurb: 'Orderly columns and balanced numbers.',
      motif: 'ledger',
      gradient: 'linear-gradient(160deg, #06121F 0%, #0A2B6D 55%, #0F766E 100%)',
      accent: '#5EEAD4'
    },
    {
      id: 'admin-roster-compass',
      name: 'Roster Compass',
      blurb: 'Every shift finds exactly its place.',
      motif: 'rings',
      gradient: 'linear-gradient(150deg, #0B1030 0%, #3B1A78 56%, #7C3AED 100%)',
      accent: '#C9BCFF'
    },
    {
      id: 'admin-ndis-horizon',
      name: 'NDIS Horizon',
      blurb: 'An aurora of standards, quietly held.',
      motif: 'aurora',
      gradient: 'linear-gradient(145deg, #04121F 0%, #0E4C6B 44%, #5A00D6 100%)',
      accent: '#67E8F9'
    }
  ],
  'team-leader': [
    {
      id: 'team-night-shift',
      name: 'Night Shift',
      blurb: 'Quiet stars over the overnight roster.',
      motif: 'stars',
      gradient: 'linear-gradient(150deg, #050B22 0%, #0A2B6D 55%, #1E1B4B 100%)',
      accent: '#A9CDFF'
    },
    {
      id: 'team-pulse',
      name: 'Team Pulse',
      blurb: 'The whole team on one heartbeat.',
      motif: 'pulse',
      gradient: 'linear-gradient(140deg, #12061F 0%, #5A00D6 54%, #FF2E9A 100%)',
      accent: '#FF9ACD'
    },
    {
      id: 'team-field-notes',
      name: 'Field Notes',
      blurb: 'Topographic lines from the frontline.',
      motif: 'topo',
      gradient: 'linear-gradient(150deg, #04140F 0%, #0F3D2E 48%, #0A2B6D 100%)',
      accent: '#7BF0C4'
    },
    {
      id: 'team-shift-clock',
      name: 'Shift Clock',
      blurb: 'Amber ticks marking every handover.',
      motif: 'clock',
      gradient: 'linear-gradient(150deg, #101014 0%, #1F2937 54%, #3F2A12 100%)',
      accent: '#FBBF24'
    },
    {
      id: 'team-handover-dawn',
      name: 'Handover Dawn',
      blurb: 'Sunrise arcs for the change of shift.',
      motif: 'dawn',
      gradient: 'linear-gradient(140deg, #1A0F2E 0%, #7A2E5A 50%, #F59E0B 100%)',
      accent: '#FDBA8C'
    }
  ]
};

export function screensaverDesigns(workspace) {
  return SCREENSAVER_DESIGNS[workspace] || [];
}