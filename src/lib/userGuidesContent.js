// Merges the guide content parts into a single library keyed by module key.
import { GUIDES_PART_1 } from '@/lib/guidesContent1';
import { GUIDES_PART_2 } from '@/lib/guidesContent2';
import { GUIDES_PART_3 } from '@/lib/guidesContent3';

export const USER_GUIDES = { ...GUIDES_PART_1, ...GUIDES_PART_2, ...GUIDES_PART_3 };

export const GUIDE_SECTION_LABELS = {
  purpose: 'Purpose of this module',
  features: 'What\u2019s inside',
  steps: 'How it works \u2014 step by step',
  tools: 'Tools & resources',
  tips: 'Pro tips & good practice',
};