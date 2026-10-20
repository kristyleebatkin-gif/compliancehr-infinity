import { LMS_GROUPS } from '@/lib/lmsCurriculum';

const TONES = {
  brand: { border: 'border-primary/50', surface: 'bg-gradient-to-r from-primary/25 to-teal/15', text: 'text-primary', rail: 'bg-primary' },
  teal: { border: 'border-teal/50', surface: 'bg-gradient-to-r from-teal/25 to-safe/15', text: 'text-teal', rail: 'bg-teal' },
  danger: { border: 'border-danger/50', surface: 'bg-gradient-to-r from-danger/25 to-warning/15', text: 'text-danger', rail: 'bg-danger' },
  safe: { border: 'border-safe/50', surface: 'bg-gradient-to-r from-safe/25 to-teal/15', text: 'text-safe', rail: 'bg-safe' },
  warning: { border: 'border-warning/50', surface: 'bg-gradient-to-r from-warning/30 to-danger/15', text: 'text-warning', rail: 'bg-warning' },
};

export default function trainingTones(group) {
  return TONES[LMS_GROUPS.find((item) => item.name === group)?.color || group] || TONES.brand;
}