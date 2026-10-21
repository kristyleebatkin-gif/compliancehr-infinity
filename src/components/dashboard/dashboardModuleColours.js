import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { MODULE_COLOURS } from '@/lib/moduleColours';

// Stable, evenly distributed pairs from the existing app palette, dashboard only.
export default function dashboardModuleColours(key) {
  const index = Math.max(0, MODULE_DIRECTORY.findIndex(module => module.key === key));
  const primary = index % MODULE_COLOURS.length;
  const offset = 3 + Math.floor(index / MODULE_COLOURS.length);
  return { colour: MODULE_COLOURS[primary], accent: MODULE_COLOURS[(primary + offset) % MODULE_COLOURS.length] };
}