// Print helpers for Visual Boards: open a clean print window with the board content.

// HTML-entity escape for any record-sourced value interpolated into the print markup.
export const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const openPrintWindow = (title, bodyHtml) => {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return false;
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #0f172a; }
    .print-header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
    .print-header h1 { margin: 0; font-size: 26px; }
    .print-header .meta { color: #64748b; font-size: 13px; margin-top: 4px; }
    .print-footer { margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 8px; color: #64748b; font-size: 11px; text-align: center; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  ${bodyHtml}
  <div class="print-footer">Printed from Visual Boards on ${new Date().toLocaleString('en-AU')}</div>
  <script>window.onload = function(){ window.focus(); window.print(); }</script>
</body>
</html>`);
  win.document.close();
  return true;
};

const headerBlock = (title, subtitle = '') => `
  <div class="print-header">
    <h1>${esc(title)}</h1>
    ${subtitle ? `<div class="meta">${esc(subtitle)}</div>` : ''}
  </div>`;

export const printClock = ({ mode, color, digitalTime, dateLine, size = 300 }) => {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const hourDeg = ((hour % 12) + minute / 60) * 30;
  const minuteDeg = minute * 6;
  const svg = mode === 'analog' ? `
    <svg width="${Math.min(size, 340)}" height="${Math.min(size, 340)}" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="94" fill="none" stroke="${color}" stroke-width="6"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => {
        const angle = (h * 30 * Math.PI) / 180;
        const x1 = 100 + 78 * Math.sin(angle); const y1 = 100 - 78 * Math.cos(angle);
        const x2 = 100 + 88 * Math.sin(angle); const y2 = 100 - 88 * Math.cos(angle);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
      }).join('')}
      <line x1="100" y1="100" x2="${100 + 45 * Math.sin((hourDeg * Math.PI) / 180)}" y2="${100 - 45 * Math.cos((hourDeg * Math.PI) / 180)}" stroke="#0f172a" stroke-width="7" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="${100 + 65 * Math.sin((minuteDeg * Math.PI) / 180)}" y2="${100 - 65 * Math.cos((minuteDeg * Math.PI) / 180)}" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="5" fill="${color}"/>
    </svg>` : `<div style="font-size:64px;font-weight:700;text-align:center;color:${color};">${digitalTime}</div>`;

  return openPrintWindow('Visual Clock', `
    ${headerBlock('Visual Clock', dateLine)}
    <div style="text-align:center;">${svg}</div>`);
};

export const printRoutine = ({ title, participant, steps }) => {
  const rows = steps.length
    ? steps.map((s, i) => {
        const sign = s.sign ? `<div style="color:#4f46e5;font-size:12px;margin-top:2px;">Sign prompt: ${esc(s.sign)} ${s.sign_description ? '&mdash; ' + esc(s.sign_description) : ''}</div>` : '';
        return `<div style="display:flex;align-items:flex-start;gap:12px;border:1px solid #cbd5e1;border-radius:10px;padding:12px;margin-bottom:8px;${s.done ? 'background:#f0fdf4;' : ''}">
          <div style="width:22px;height:22px;border:2px solid ${s.done ? '#16a34a' : '#94a3b8'};border-radius:50%;${s.done ? 'background:#16a34a;' : ''};flex-shrink:0;"></div>
          <div style="font-size:18px;"><b style="color:#64748b;">${i + 1}.</b> ${esc(s.text)}${sign}</div>
        </div>`;
      }).join('')
    : '<p style="color:#64748b;">No steps yet.</p>';
  return openPrintWindow(title, `
    ${headerBlock(title, participant ? `Participant: ${participant}` : 'Visual routine board')}
    ${rows}`);
};

export const printSignSheet = (signs, title = 'Sign Language Prompts') => {
  const cards = signs.map((s) => `
    <div style="display:inline-block;width:30%;border:2px solid #4f46e5;border-radius:12px;padding:10px;margin:6px;vertical-align:top;text-align:center;">
      <div style="font-size:40px;">${esc(s.emoji)}</div>
      <div style="font-size:16px;font-weight:700;margin:4px 0;">${esc(s.word)}</div>
      <div style="font-size:11px;color:#475569;text-align:left;">${esc(s.description)}</div>
    </div>`).join('');
  return openPrintWindow(title, `
    ${headerBlock(title, 'Simplified gesture prompts for visual support')}
    <div style="text-align:center;">${cards}</div>`);
};

export const routineStepsToCsv = (routines) => {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = ['Routine,Participant,Step Number,Step,Sign Prompt,Sign Description,Done'];
  routines.forEach((r) => {
    let steps = [];
    try { steps = JSON.parse(r.steps || '[]'); } catch { steps = []; }
    if (!steps.length) {
      lines.push([r.title, r.participant_name || '', 0, '', '', '', ''].map(escape).join(','));
    } else {
      steps.forEach((s, i) => {
        lines.push([r.title, r.participant_name || '', i + 1, s.text, s.sign || '', s.sign_description || '', s.done ? 'Done' : ''].map(escape).join(','));
      });
    }
  });
  return lines.join('\n');
};