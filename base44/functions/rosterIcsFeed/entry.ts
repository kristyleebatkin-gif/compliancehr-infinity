import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Read-only ICS feed of the rostering schedule for external calendar apps
// (Google Calendar, Apple Calendar, Outlook). Protected by a token stored in
// the CalendarFeed entity: .../functions/rosterIcsFeed?token=<token>
// Token may arrive as a query param or JSON body field.

function icsEscape(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function pad(n) { return String(n).padStart(2, '0'); }

// Local floating times (no Z suffix) so the calendar renders in its own timezone.
function icsLocalDateTime(dateStr, timeStr, defaultTime) {
  const t = timeStr || defaultTime;
  const [h, m] = String(t).split(':').map((v) => Number(v) || 0);
  return `${dateStr.replace(/-/g, '')}T${pad(h)}${pad(m)}00`;
}

function allDayDateTime(dateStr) {
  return `${dateStr.replace(/-/g, '')}`;
}

function nextDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function foldLine(line) {
  // Fold lines longer than 75 octets per RFC 5545.
  if (line.length <= 74) return line;
  const parts = [];
  let rest = line;
  parts.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length > 0) {
    parts.push(' ' + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  return parts.join('\r\n');
}

export default async function(req) {
  try {
    const url = new URL(req.url);
    let token = url.searchParams.get('token') || '';
    if (!token && req.method === 'POST') {
      try {
        const body = await req.json();
        token = body && body.token ? String(body.token) : '';
      } catch (e) { /* no body */ }
    }
    if (!token) {
      return new Response('Missing feed token', { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const feedPage = await base44.asServiceRole.entities.CalendarFeed.filter({ token: String(token) }, { limit: 1 });
    if (!feedPage.items || feedPage.items.length === 0) {
      return new Response('Invalid feed token', { status: 403 });
    }

    // Load all non-cancelled shifts (paginated).
    const shifts = [];
    let cursor;
    do {
      const page = await base44.asServiceRole.entities.Shift.filter(
        { status: { $ne: 'Cancelled' } },
        { sort: 'date', limit: 500, cursor }
      );
      shifts.push(...(page.items || []));
      cursor = page.has_more ? page.next_cursor : undefined;
    } while (cursor);

    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ComplianceHR Infinitely//Rostering//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      foldLine('X-WR-CALNAME:Rostering Schedule'),
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
      'X-PUBLISHED-TTL:PT1H',
    ];

    shifts.forEach((s) => {
      const summaryParts = [s.employee_name || 'Unassigned'];
      if (s.participant_name) summaryParts.push(`-> ${s.participant_name}`);
      const summary = summaryParts.join(' ');

      const descParts = [];
      if (s.service_type) descParts.push(`Service: ${s.service_type}`);
      if (s.funding_source) descParts.push(`Funding: ${s.funding_source}`);
      descParts.push(`Status: ${s.status || 'Scheduled'}`);
      if (s.location) descParts.push(`Location: ${s.location}`);
      if (s.notes) descParts.push(`Notes: ${s.notes}`);
      if (s.approval_status && s.approval_status !== 'Not Required') descParts.push(`Approval: ${s.approval_status}`);
      const description = descParts.join('\\n');

      // Expand recurrences (daily/weekly/fortnightly) up to repeat_until.
      let dates = [s.date];
      if (!s.repeat_rule || s.repeat_rule === 'none' || !s.repeat_until) {
        dates = [s.date];
      } else {
        const step = s.repeat_rule === 'daily' ? 1 : s.repeat_rule === 'weekly' ? 7 : 14;
        dates = [];
        let d = s.date;
        for (let i = 0; i < 104 && d <= s.repeat_until; i += 1) {
          dates.push(d);
          d = nextDate(d, step);
        }
      }

      dates.forEach((date) => {
        const hasTimes = Boolean(s.start_time && s.end_time);
        lines.push('BEGIN:VEVENT');
        lines.push(foldLine(`UID:${s.id}-${date}@polite-safe-hire-flow.base44.app`));
        lines.push(`DTSTAMP:${stamp}`);
        if (hasTimes) {
          lines.push(`DTSTART;TZID=Australia/Sydney:${icsLocalDateTime(date, s.start_time, '00:00')}`);
          const endSpills = s.end_time <= s.start_time;
          lines.push(`DTEND;TZID=Australia/Sydney:${icsLocalDateTime(date, s.end_time, '00:00')}`);
          if (endSpills) {
            // Overnight shift: end on the next day.
            lines.pop();
            lines.push(`DTEND;TZID=Australia/Sydney:${icsLocalDateTime(nextDate(date, 1), s.end_time, '00:00')}`);
          }
        } else {
          const end = nextDate(date, 1);
          lines.push(`DTSTART;VALUE=DATE:${allDayDateTime(date)}`);
          lines.push(`DTEND;VALUE=DATE:${allDayDateTime(end)}`);
        }
        lines.push(foldLine(`SUMMARY:${icsEscape(summary)}`));
        lines.push(foldLine(`DESCRIPTION:${icsEscape(description)}`));
        if (s.location) lines.push(foldLine(`LOCATION:${icsEscape(s.location)}`));
        lines.push(foldLine(`STATUS:${s.status === 'Completed' ? 'CONFIRMED' : 'TENTATIVE'}`));
        lines.push('END:VEVENT');
      });
    });

    lines.push('END:VCALENDAR');

    return new Response(lines.join('\r\n') + '\r\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rostering.ics"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return new Response(`Feed error: ${error.message}`, { status: 500 });
  }
}