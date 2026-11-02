import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { hasAnyRole } from '../../shared/systemAuth.ts';

// AI incident triage: SUGGESTS a regulatory assessment for an incident.
// It never writes to the Incident. A reviewer must accept the suggestion in the
// form and save it themselves. Deadlines are calculated by fixed rules in code,
// never by the AI. The suggestion is written to AuditLog so accuracy can be reviewed.

const REVIEW_ROLES = ['admin', 'Provider Administrator', 'Management', 'Compliance Manager', 'Compliance Administrator', 'Administration'];

const NDIS_TYPES = ['Death', 'Serious injury', 'Abuse or neglect', 'Unlawful sexual or physical contact', 'Sexual misconduct or grooming', 'Unauthorised restrictive practice', 'Other reportable incident', 'Not reportable', 'Unsure'];
const SIRS_PRIORITIES = ['Not Applicable', 'Priority 1 - 24 Hours', 'Priority 2 - 30 Days', 'Unsure'];

// Keep in step with base44/agent-skills/ndis-reportable-incidents.md and
// aged-care-standards-and-sirs.md (last checked 2 November 2026).
const RULES = `Reference rules (Australian context; summarise, do not quote):
NDIS reportable incidents (NDIS Quality and Safeguards Commission) are the following when they occur, or are alleged to have occurred, in connection with the provision of NDIS supports or services:
- the death of a person with disability;
- serious injury of a person with disability;
- abuse or neglect of a person with disability;
- unlawful sexual or physical contact with, or assault of, a person with disability;
- sexual misconduct committed against, or in the presence of, a person with disability, including grooming;
- the use of a restrictive practice on a person with disability that is unauthorised or not in accordance with their behaviour support plan.
Allegations count. Most must be notified to the NDIS Commission within 24 hours of key personnel becoming aware, followed by a report within 5 business days, and a final report (usually within 60 business days) if the Commission asks. An unauthorised restrictive practice that caused no harm is generally notified within 5 business days; if it caused harm, 24 hours applies.
Aged Care Serious Incident Response Scheme (SIRS) incident types: unreasonable use of force; unlawful sexual contact or inappropriate sexual conduct; psychological or emotional abuse; unexpected death; stealing or financial coercion by a staff member; neglect; inappropriate use of restrictive practices; unexplained absence from care.
SIRS Priority 1 (notify within 24 hours): the incident caused, or could reasonably have caused, physical or psychological injury or discomfort requiring medical or psychological treatment; or there are reasonable grounds to report it to police; or it is an unexpected death or unexplained absence from care. Priority 2 (notify within 30 days): all other reportable SIRS incidents.
SIRS covers incidents connected to the care of an older person receiving funded aged care services (residential care or in the home), under the Aged Care Act 2024 from 1 November 2025. NDIS rules only apply to NDIS supports.
WHS regulator notification is generally required for a death, a serious injury or illness, or a dangerous incident at a workplace.`;

const pad = (n: number) => String(n).padStart(2, '0');
// Work on the local wall-clock time entered in the form (datetime-local, no timezone).
const parseLocal = (value: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value || '');
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])) : null;
};
const fmtLocal = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
const fmtDate = (d: Date) => fmtLocal(d).slice(0, 10);
const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 3600000);
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);
const addBusinessDays = (d: Date, days: number) => {
  const r = new Date(d.getTime());
  let added = 0;
  while (added < days) {
    r.setUTCDate(r.getUTCDate() + 1);
    const day = r.getUTCDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return r;
};

function calculateDeadlines(s: any, awarenessAt: string) {
  const awareness = parseLocal(awarenessAt);
  const notes: string[] = [];
  const out: Record<string, string> = {};
  const ndisReportable = s.ndis_reportable_type && !['Not reportable', 'Unsure'].includes(s.ndis_reportable_type);
  const sirsReportable = s.sirs_applicable && ['Priority 1 - 24 Hours', 'Priority 2 - 30 Days'].includes(s.sirs_priority);
  if (!ndisReportable && !sirsReportable) return { deadlines: out, notes };
  if (!awareness) {
    notes.push('Enter the Provider Awareness Date and Time, then run triage again to calculate deadlines.');
    return { deadlines: out, notes };
  }
  const candidates: Date[] = [];
  if (ndisReportable) {
    const fiveDayNotice = s.ndis_reportable_type === 'Unauthorised restrictive practice' && s.restrictive_practice_caused_harm === false;
    if (fiveDayNotice) {
      candidates.push(addBusinessDays(awareness, 5));
      notes.push('NDIS: unauthorised restrictive practice with no injury, notification due within 5 business days.');
    } else {
      candidates.push(addHours(awareness, 24));
      out.five_day_follow_up_due = fmtDate(addBusinessDays(awareness, 5));
      notes.push('NDIS: initial notification due within 24 hours, then a report within 5 business days.');
    }
  }
  if (sirsReportable) {
    candidates.push(s.sirs_priority === 'Priority 1 - 24 Hours' ? addHours(awareness, 24) : addDays(awareness, 30));
    notes.push(`SIRS: ${s.sirs_priority}.`);
  }
  out.initial_notification_due_at = fmtLocal(candidates.sort((a, b) => a.getTime() - b.getTime())[0]);
  notes.push('Business days skip weekends but not public holidays. Check deadlines against current regulator guidance.');
  return { deadlines: out, notes };
}

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasAnyRole(user, REVIEW_ROLES)) return Response.json({ error: 'Incident review access is required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const i = body.incident || {};
    const text = (v: unknown, max = 2000) => String(v || '').slice(0, max);
    if (!text(i.title).trim() && !text(i.description).trim()) {
      return Response.json({ error: 'Add a title and description before running AI triage' }, { status: 400 });
    }

    // Names and IDs are deliberately not sent to the AI.
    const facts = [
      `Title: ${text(i.title, 300)}`,
      `Program: ${text(i.program, 100) || 'Not stated'}`,
      `Category: ${text(i.category, 100)}; Severity: ${text(i.severity, 50)}`,
      `Location type: ${text(i.location, 200) || 'Not stated'}`,
      `Description: ${text(i.description)}`,
      `Immediate actions taken: ${text(i.immediate_actions)}`,
      `Risks / hazards identified: ${text(i.hazards_identified, 1000)}`,
      `Police notified: ${i.requires_police ? 'Yes' : 'No'}`,
    ].join('\n');

    const suggestion = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You help a registered NDIS and aged care provider in Australia triage an incident. Suggest how it should be assessed. A manager will review your suggestion before anything is recorded.

${RULES}

Incident details:
${facts}

Instructions:
- Base your assessment only on the details above. Do not invent facts.
- If the details are not enough to decide, choose "Unsure" and list what is missing.
- If the program is not stated, assess both NDIS and SIRS applicability and say which applies depends on the service type.
- Reasons must be 1 to 3 plain-English sentences a manager can paste into the record.
- Next steps: up to 5 short, practical actions (e.g. notify the Commission, notify the participant or nominee, preserve evidence, start an investigation, review the behaviour support plan).
- Never give legal advice or state that the provider is compliant.`,
      response_json_schema: {
        type: 'object',
        properties: {
          ndis_reportable_type: { type: 'string', enum: NDIS_TYPES },
          ndis_reasons: { type: 'string' },
          restrictive_practice_caused_harm: { type: 'boolean' },
          sirs_applicable: { type: 'boolean' },
          sirs_priority: { type: 'string', enum: SIRS_PRIORITIES },
          sirs_reasons: { type: 'string' },
          whs_notification_likely: { type: 'boolean' },
          police_advisable: { type: 'boolean' },
          suggested_severity: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
          confidence: { type: 'string', enum: ['High', 'Medium', 'Low'] },
          missing_information: { type: 'array', items: { type: 'string' } },
          next_steps: { type: 'array', items: { type: 'string' } },
        },
        required: ['ndis_reportable_type', 'ndis_reasons', 'sirs_applicable', 'sirs_priority', 'confidence', 'next_steps'],
      },
    });

    // Keep only values the form accepts.
    const s: any = suggestion || {};
    if (!NDIS_TYPES.includes(s.ndis_reportable_type)) s.ndis_reportable_type = 'Unsure';
    if (!SIRS_PRIORITIES.includes(s.sirs_priority)) s.sirs_priority = 'Unsure';
    if (!s.sirs_applicable) s.sirs_priority = 'Not Applicable';

    const { deadlines, notes } = calculateDeadlines(s, text(i.provider_awareness_at, 40));

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'AI Incident Triage Suggested',
        entity_type: 'Incident',
        record_id: text(body.incident_id, 100),
        record_title: text(i.title, 200),
        performed_by: user.full_name || user.email,
        performed_by_user_id: user.id,
        performed_by_email: user.email,
        performed_by_role: user.role,
        details: JSON.stringify({ suggestion: s, deadlines }).slice(0, 4000),
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Triage audit log failed', (logError as Error).message);
    }

    return Response.json({ ok: true, suggestion: s, deadlines, notes });
  } catch (error) {
    return Response.json({ error: (error as Error).message || 'AI triage failed' }, { status: 500 });
  }
}
