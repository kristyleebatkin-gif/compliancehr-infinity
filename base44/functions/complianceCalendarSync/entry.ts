import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const EVENTS_TAG = 'compliancehr-tasks';

function eventColorId(task) {
  if (task.priority === 'Urgent' || task.priority === 'High') return '11'; // tomato
  if (task.priority === 'Low') return '10'; // basil
  return '5'; // banana
}

function nextDay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d) + 24 * 60 * 60 * 1000);
  return dt.toISOString().slice(0, 10);
}

function buildEventBody(task) {
  const descParts = [];
  if (task.assigned_to) descParts.push('Assigned to: ' + task.assigned_to);
  if (task.module) descParts.push('Module: ' + task.module);
  if (task.priority) descParts.push('Priority: ' + task.priority);
  if (task.important_info) descParts.push('\nImportant: ' + task.important_info);
  descParts.push('\nManage in ComplianceHR: /tasks');
  return {
    summary: task.title,
    description: descParts.join('\n'),
    start: { date: task.due_date },
    end: { date: nextDay(task.due_date) },
    colorId: eventColorId(task),
    extendedProperties: { private: { app: EVENTS_TAG, task_id: task.id } },
  };
}

async function listTaggedEvents(authHeader) {
  const events = [];
  let pageToken = '';
  while (true) {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?privateExtendedProperty=app%3D' + EVENTS_TAG + '&maxResults=100&pageToken=' + encodeURIComponent(pageToken),
      { headers: authHeader, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) throw new Error('Google Calendar list failed (' + res.status + ')');
    const data = await res.json();
    events.push(...(data.items || []));
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return events;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { Authorization: 'Bearer ' + accessToken };

    // Active tasks with a due date (a page is enough — synced live deadlines stay current)
    const page = await base44.asServiceRole.entities.TodoTask.filter(
      {
        archived: { $ne: true },
        due_date: { $exists: true, $ne: null },
        status: { $nin: ['Completed', 'Cancelled'] },
      },
      { sort: 'due_date', limit: 500, fields: ['title', 'priority', 'module', 'assigned_to', 'important_info', 'status', 'due_date'] }
    );
    const tasks = page.items || [];

    const existing = await listTaggedEvents(authHeader);
    const byTaskId = new Map();
    for (const ev of existing) {
      const tid = ev.extendedProperties?.private?.task_id;
      if (tid) byTaskId.set(tid, ev);
    }

    let created = 0, updated = 0, deleted = 0;
    const errors = [];

    // Sync in batches of 6 concurrent Google calls
    const ops = [];
    for (const task of tasks) {
      const calEvent = byTaskId.get(task.id);
      const desired = buildEventBody(task);
      if (!calEvent) {
        ops.push(async () => {
          const res = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            { method: 'POST', headers: { ...authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify(desired), signal: AbortSignal.timeout(10000) }
          );
          if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            errors.push('create ' + task.title + ' → ' + res.status + ' ' + errBody.slice(0, 300));
          } else created++;
        });
      } else {
        const unchanged =
          calEvent.summary === desired.summary &&
          calEvent.description === desired.description &&
          calEvent.colorId === desired.colorId &&
          calEvent.start?.date === desired.start.date;
        byTaskId.delete(task.id);
        if (!unchanged) {
          ops.push(async () => {
            const res = await fetch(
              'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + encodeURIComponent(calEvent.id),
              { method: 'PATCH', headers: { ...authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify(desired), signal: AbortSignal.timeout(10000) }
            );
            if (!res.ok) errors.push('update ' + task.title + ' → ' + res.status);
            else updated++;
          });
        }
      }
    }
    // Stale events: task completed, cancelled, archived, deleted, or due date removed
    for (const [tid, calEvent] of byTaskId) {
      ops.push(async () => {
        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + encodeURIComponent(calEvent.id),
          { method: 'DELETE', headers: authHeader, signal: AbortSignal.timeout(10000) }
        );
        if (!res.ok && res.status !== 410 && res.status !== 404) errors.push('delete ' + tid + ' → ' + res.status);
        else deleted++;
      });
    }

    for (let i = 0; i < ops.length; i += 6) {
      await Promise.allSettled(ops.slice(i, i + 6).map((op) => op()));
    }

    return Response.json({ synced_tasks: tasks.length, created, updated, deleted, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}