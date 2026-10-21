const TONES = [
  ['danger', /incident|emergency|safety|risk|hazard|alert|complaint|breach|expir/],
  ['safe', /payroll|payslip|payment|invoice|quote|receipt|finance|funding|budget|procure|reconcil/],
  ['evidence', /training|certificate|course|skill|module|learning|competenc|template/],
  ['pink', /participant|client|goal|feedback|survey|shout|banter|communication|diary|advoca|consent/],
  ['warning', /calendar|schedule|shift|roster|leave|availability|pattern|equipment|asset|maintenance|deadline/],
  ['primary', /compliance|audit|policy|checklist|document|vault|form|permission|access|approval|review|report/],
  ['blue', /staff|employee|personnel|profile|detail|team|contact|directory|inbox|overview|work|task|feed|record|log|board/],
];

export default function dashboardTabTone(value) {
  return TONES.find(([, pattern]) => pattern.test(String(value || '').toLowerCase()))?.[0];
}