import { LMS_GROUPS } from '@/lib/lmsCurriculum';

const TONES = {
  brand: { border: 'border-primary/30', surface: 'bg-gradient-to-r from-primary/10 to-teal/5', text: 'text-primary', rail: 'bg-primary' },
  teal: { border: 'border-teal/30', surface: 'bg-gradient-to-r from-teal/10 to-safe/5', text: 'text-teal', rail: 'bg-teal' },
  danger: { border: 'border-danger/30', surface: 'bg-gradient-to-r from-danger/10 to-warning/5', text: 'text-danger', rail: 'bg-danger' },
  safe: { border: 'border-safe/30', surface: 'bg-gradient-to-r from-safe/10 to-teal/5', text: 'text-safe', rail: 'bg-safe' },
  warning: { border: 'border-warning/30', surface: 'bg-gradient-to-r from-warning/10 to-danger/5', text: 'text-warning', rail: 'bg-warning' },
};

export default function trainingTones(group) {
  return TONES[LMS_GROUPS.find((item) => item.name === group)?.color || group] || TONES.brand;
}