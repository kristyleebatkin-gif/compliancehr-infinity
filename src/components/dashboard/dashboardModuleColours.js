import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleColour } from '@/lib/moduleColours';

// One fixed semantic colour for every module, shared across its tile.
export default function dashboardModuleColours(key) {
  const module = MODULE_DIRECTORY.find(module => module.key === key);
  const colour = moduleColour(module?.label || key);
  return { colour, accent: colour };
}