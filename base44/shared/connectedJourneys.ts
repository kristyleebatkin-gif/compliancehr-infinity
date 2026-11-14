// Connected journey gates (owner-approved scope, journeys B–E).
//
// These are decision rules only: no SDK, no writes, no network. The backend
// function connectedJourneyGate reads existing records, hands them here, and
// returns the result. Keeping the rules pure is what makes them testable, and
// it means the same verdict is used for the screen and for the write guard.
//
// Nothing here invents a legal requirement. Journey D in particular only ever
// judges requirements the organisation has actually recorded (screening,
// certificates, training); missing evidence is reported as an unknown, never as
// a pass.

export type Blocker = { code: string; label: string };

export type GateState = 'ready' | 'blocked' | 'incomplete' | 'complete';

export type Gate = {
  state: GateState;
  blockers: Blocker[];
  unknowns: string[];
};

const text = (v: unknown) => String(v ?? '').trim();
const day = (v: unknown) => text(v).slice(0, 10);
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Participant + service date is the join between a shift and its service note. */
export function noteKey(participantName: unknown, date: unknown) {
  return `${text(participantName).toLowerCase()}|${day(date)}`;
}

function serviceHours(start: unknown, end: unknown, breakMinutes: unknown) {
  const a = text(start).slice(0, 5);
  const b = text(end).slice(0, 5);
  if (!a || !b) return 0;
  const toMin = (s: string) => {
    const [h, m] = s.split(':').map((x) => Number(x));
    return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
  };
  let mins = toMin(b) - toMin(a);
  if (!Number.isFinite(mins)) return 0;
  if (mins < 0) mins += 24 * 60; // shift crossing midnight
  mins -= Math.max(0, num(breakMinutes));
  return round2(Math.max(0, mins) / 60);
}

// ---------------------------------------------------------------------------
// Journey B — roster → attendance → service note → approved billing
// ---------------------------------------------------------------------------

export type ShiftBilling = Gate & {
  shift_id: string;
  participant_name: string;
  date: string;
  amount: number;
};

/**
 * Can this shift be billed? Grounded only in fields that already exist on the
 * shift plus whether a service note was recorded for the same participant/date.
 *
 * Order matters: an already-invoiced shift is reported as such and is never
 * re-billed, whatever else is wrong with it.
 */
export function assessShiftBilling(input: {
  shift: any;
  hasServiceNote: boolean;
}): Gate & { already_billed: boolean } {
  const shift = input?.shift;
  if (!shift) {
    return {
      state: 'blocked',
      blockers: [{ code: 'shift_missing', label: 'Shift record not found' }],
      unknowns: [],
      already_billed: false,
    };
  }

  if (shift.invoiced === true || text(shift.invoice_id)) {
    return {
      state: 'complete',
      blockers: [
        {
          code: 'already_billed',
          label: shift.invoice_id ? `Already invoiced (invoice ${text(shift.invoice_id)})` : 'Already invoiced',
        },
      ],
      unknowns: [],
      already_billed: true,
    };
  }

  const blockers: Blocker[] = [];
  const unknowns: string[] = [];

  const status = text(shift.status);
  if (status === 'Cancelled' || status === 'Missed') {
    blockers.push({ code: 'not_delivered', label: `Service was not delivered (status: ${status})` });
  } else if (status !== 'Completed') {
    blockers.push({
      code: 'not_completed',
      label: `Service not marked completed (status: ${status || 'not recorded'})`,
    });
  }

  if (!text(shift.participant_name)) {
    blockers.push({ code: 'participant_missing', label: 'Shift has no participant, so it cannot be billed' });
  }
  if (!day(shift.date)) {
    blockers.push({ code: 'date_missing', label: 'Shift has no service date' });
  }

  // Approval: an empty approval field is not the same as "not required".
  const approval = text(shift.approval_status);
  if (approval === 'Rejected') {
    blockers.push({ code: 'approval_rejected', label: 'Shift approval was rejected' });
  } else if (approval === 'Pending Approval') {
    blockers.push({ code: 'approval_pending', label: 'Shift approval is still pending' });
  } else if (!['Approved', 'Not Required'].includes(approval)) {
    blockers.push({
      code: 'approval_missing',
      label: 'Shift approval not recorded (set Approved or Not Required)',
    });
  }

  if (!input.hasServiceNote) {
    blockers.push({
      code: 'note_missing',
      label: 'No service note recorded for this participant and date',
    });
  }

  if (!(text(shift.clock_in) && text(shift.clock_out))) {
    unknowns.push('Attendance times are not both recorded on the shift');
  }
  if (!(num(shift.billable_rate) > 0)) {
    unknowns.push('No billable rate is set on the shift, so the amount will be zero');
  }

  return { state: blockers.length ? 'blocked' : 'ready', blockers, unknowns, already_billed: false };
}

/** Board rows for the billing exception screen. */
export function assessBillingBoard(input: {
  shifts: any[];
  noteKeys: Iterable<string>;
}): ShiftBilling[] {
  const keys = new Set(input?.noteKeys || []);
  return (input?.shifts || []).map((shift) => {
    const verdict = assessShiftBilling({
      shift,
      hasServiceNote: keys.has(noteKey(shift?.participant_name, shift?.date)),
    });
    return {
      ...verdict,
      shift_id: text(shift?.id),
      participant_name: text(shift?.participant_name),
      date: day(shift?.date),
      amount: round2(serviceHours(shift?.start_time, shift?.end_time, shift?.break_minutes) * num(shift?.billable_rate)),
    };
  });
}

/**
 * Invoice lines that retain the originating service (shift) id on every line, so
 * a billed line can always be traced back to the delivered shift.
 */
export function buildBillingLines(shifts: any[]) {
  return (shifts || []).map((shift) => {
    const hours = serviceHours(shift?.start_time, shift?.end_time, shift?.break_minutes);
    const rate = num(shift?.billable_rate);
    return {
      shift_id: text(shift?.id),
      date: day(shift?.date),
      description: `${text(shift?.service_type) || 'Support'} — ${text(shift?.participant_name)}`.trim(),
      hours,
      rate,
      amount: round2(hours * rate),
    };
  });
}

/** Guard used before a draft invoice is written: only ready, unbilled shifts. */
export function partitionBillable(rows: ShiftBilling[], requestedIds: string[]) {
  const wanted = new Set((requestedIds || []).map(text).filter(Boolean));
  const chosen = (rows || []).filter((row) => wanted.has(row.shift_id));
  return {
    billable: chosen.filter((row) => row.state === 'ready').map((row) => row.shift_id),
    skipped: chosen
      .filter((row) => row.state !== 'ready')
      .map((row) => ({ shift_id: row.shift_id, reason: row.blockers[0]?.label || 'Not billable' })),
    notFound: [...wanted].filter((id) => !chosen.some((row) => row.shift_id === id)),
  };
}

// ---------------------------------------------------------------------------
// Journey C — incident → investigation → risk control → improvement → effectiveness
// ---------------------------------------------------------------------------

/**
 * May this incident be closed? Every linked corrective action must be closed
 * with a recorded effectiveness review, evidence and approved closure, and the
 * incident must have an accountable owner. Uses the existing ImprovementAction
 * fields only.
 */
export function assessIncidentFollowUp(input: {
  incident: any;
  actions: any[];
  riskLinked: boolean;
}): Gate {
  const incident = input?.incident;
  if (!incident) {
    return { state: 'blocked', blockers: [{ code: 'incident_missing', label: 'Incident not found' }], unknowns: [] };
  }

  const blockers: Blocker[] = [];
  const unknowns: string[] = [];
  const actions = input?.actions || [];

  if (text(incident.status) === 'Closed') {
    return { state: 'complete', blockers: [], unknowns: [] };
  }

  if (!text(incident.owner) && !text(incident.responsible_manager)) {
    blockers.push({ code: 'owner_missing', label: 'Incident has no accountable owner' });
  }

  if (!actions.length) {
    blockers.push({
      code: 'no_action',
      label: 'No corrective action is linked to this incident',
    });
  }

  for (const action of actions) {
    const title = text(action?.title) || 'Untitled action';
    if (!text(action?.owner)) {
      blockers.push({ code: 'action_owner_missing', label: `Corrective action “${title}” has no accountable owner` });
    }
    if (!day(action?.target_date)) {
      blockers.push({ code: 'action_target_missing', label: `Corrective action “${title}” has no target date` });
    }
    const status = text(action?.status);
    if (status !== 'Closed') {
      blockers.push({
        code: 'action_open',
        label: `Corrective action “${title}” is still ${status || 'not started'}`,
      });
      continue;
    }
    const effectiveness = text(action?.effectiveness_result) || 'Not Reviewed';
    if (effectiveness === 'Not Reviewed') {
      blockers.push({
        code: 'effectiveness_missing',
        label: `Effectiveness of “${title}” has not been reviewed`,
      });
    }
    if (!text(action?.effectiveness_evidence)) {
      blockers.push({
        code: 'effectiveness_evidence_missing',
        label: `No effectiveness evidence recorded for “${title}”`,
      });
    }
    if (!text(action?.closure_approved_by)) {
      blockers.push({ code: 'closure_unapproved', label: `Closure of “${title}” has not been approved` });
    }
  }

  if (!input?.riskLinked) {
    unknowns.push('No risk assessment or risk control is linked to this incident');
  }

  return { state: blockers.length ? 'blocked' : 'ready', blockers, unknowns };
}

// ---------------------------------------------------------------------------
// Journey D — onboarding → checks → training → shift eligibility
// ---------------------------------------------------------------------------

export const EXPIRY_WARNING_DAYS = 30; // display threshold only, not a legal rule

const daysUntil = (date: unknown, today: string) => {
  const d = day(date);
  if (!d) return null;
  const a = Date.parse(`${d}T00:00:00Z`);
  const b = Date.parse(`${day(today) || new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((a - b) / 86400000);
};

/**
 * Shift eligibility from what the organisation has recorded. Returns:
 *  - blocked    when a recorded check or certificate is expired, revoked or invalid
 *  - incomplete when nothing contradicts eligibility but evidence is missing/expiring
 *  - ready      only when recorded evidence is current and nothing is unverified
 * It never returns "ready" on the strength of silence.
 */
export function assessRosterEligibility(input: {
  staff: any;
  screening?: any[];
  certificates?: any[];
  training?: any[];
  today: string;
}): Gate {
  const staff = input?.staff;
  if (!staff) {
    return { state: 'blocked', blockers: [{ code: 'staff_missing', label: 'Employee record not found' }], unknowns: [] };
  }

  const blockers: Blocker[] = [];
  const unknowns: string[] = [];
  const today = day(input?.today);

  const staffStatus = text(staff.status);
  if (staffStatus && staffStatus !== 'Active') {
    blockers.push({ code: 'staff_not_active', label: `Employee status is ${staffStatus}` });
  }
  if (!text(staff.induction_date)) {
    unknowns.push('No induction date is recorded');
  }

  const screening = input?.screening || [];
  if (!screening.length) {
    unknowns.push('No screening verification is recorded');
  }
  for (const record of screening) {
    const label = text(record?.screening_type) || text(record?.record_type) || 'Screening';
    const status = text(record?.status);
    if (['Expired', 'Action Required'].includes(status)) {
      blockers.push({ code: 'screening_invalid', label: `${label} is recorded as ${status}` });
    }
    if (status === 'Draft') {
      unknowns.push(`${label} is still a draft and not verified`);
    }
    const left = daysUntil(record?.expiry_date, today);
    if (left !== null && left < 0) {
      blockers.push({ code: 'screening_expired', label: `${label} expired on ${day(record.expiry_date)}` });
    } else if (left !== null && left <= EXPIRY_WARNING_DAYS) {
      unknowns.push(`${label} expires within ${EXPIRY_WARNING_DAYS} days (${day(record.expiry_date)})`);
    }
    if (!text(record?.verification_date) && !text(record?.verification_reference)) {
      unknowns.push(`${label} has no verification date or reference`);
    }
    if (text(record?.assessment_outcome) === 'Not Competent') {
      blockers.push({ code: 'not_competent', label: `${text(record?.competency_area) || 'Competency'} assessed as Not Competent` });
    }
  }

  const certificates = input?.certificates || [];
  for (const cert of certificates) {
    const label = text(cert?.module_title) || 'Certificate';
    const status = text(cert?.status);
    if (['Expired', 'Revoked'].includes(status)) {
      blockers.push({ code: 'certificate_invalid', label: `${label} is recorded as ${status}` });
    }
    if (status === 'Pending Verification') {
      unknowns.push(`${label} is pending verification`);
    }
    const left = daysUntil(cert?.expiry_date, today);
    if (left !== null && left < 0) {
      blockers.push({ code: 'certificate_expired', label: `${label} expired on ${day(cert.expiry_date)}` });
    } else if (left !== null && left <= EXPIRY_WARNING_DAYS) {
      unknowns.push(`${label} expires within ${EXPIRY_WARNING_DAYS} days (${day(cert.expiry_date)})`);
    }
  }

  const training = input?.training || [];
  if (!training.length) {
    unknowns.push('No training completion is recorded');
  }
  for (const completion of training) {
    if (text(completion?.status) === 'Archived') {
      unknowns.push(`${text(completion?.module_title) || 'Training'} completion is archived`);
    }
    const left = daysUntil(completion?.expiry_date, today);
    if (left !== null && left < 0) {
      blockers.push({
        code: 'training_expired',
        label: `${text(completion?.module_title) || 'Training'} expired on ${day(completion.expiry_date)}`,
      });
    }
  }

  if (blockers.length) return { state: 'blocked', blockers, unknowns };
  if (unknowns.length) return { state: 'incomplete', blockers, unknowns };
  return { state: 'ready', blockers, unknowns };
}

// ---------------------------------------------------------------------------
// Journey E — draft → review → approval → acknowledgement → renewal
// ---------------------------------------------------------------------------

/**
 * Readiness checks for a controlled document. approval evidence is required
 * before anything may be acknowledged, and a draft/review document can never be
 * treated as the approved version.
 */
export function assessDocumentRelease(input: { document: any; acknowledged: boolean }): Gate {
  const doc = input?.document;
  if (!doc) {
    return { state: 'blocked', blockers: [{ code: 'document_missing', label: 'Document not found' }], unknowns: [] };
  }

  const blockers: Blocker[] = [];
  const unknowns: string[] = [];
  const status = text(doc.status);

  if (status === 'Archived' || status === 'Superseded') {
    blockers.push({ code: 'document_retired', label: `Document is ${status} and cannot be acknowledged` });
  } else if (status === 'Draft' || status === 'Review') {
    blockers.push({ code: 'not_approved', label: `Document is ${status}, not approved` });
  } else if (status !== 'Approved') {
    blockers.push({ code: 'status_unknown', label: 'Document status is not recorded' });
  }

  if (status === 'Approved') {
    if (!text(doc.approved_by)) {
      blockers.push({ code: 'approval_evidence_missing', label: 'No approver is recorded on the approved version' });
    }
    if (!day(doc.approval_date)) {
      blockers.push({ code: 'approval_date_missing', label: 'No approval date is recorded on the approved version' });
    }
    if (!text(doc.version)) {
      unknowns.push('Approved version has no version label');
    }
    if (!text(doc.file_url)) {
      unknowns.push('Approved version has no file attached');
    }
  }

  if (input?.acknowledged) {
    return { state: 'complete', blockers: [], unknowns };
  }

  return { state: blockers.length ? 'blocked' : 'ready', blockers, unknowns };
}

/** Version labels are preserved: an approved version is replaced, never edited. */
export function nextVersionLabel(version: unknown) {
  const raw = text(version);
  const match = raw.match(/(\d+)(?!.*\d)/);
  if (!match) return raw ? `${raw}-rev` : '1.1';
  const current = Number(match[1]);
  const next = current + 1;
  return raw.replace(/(\d+)(?!.*\d)/, String(next));
}

/**
 * An edit to an Approved version must open a new draft, not activate the
 * approved record. Returns a blocker when the requested change would do that.
 */
export function guardDocumentEdit(input: { document: any; changes: any }): Blocker[] {
  const doc = input?.document;
  const changes = input?.changes || {};
  if (!doc) return [{ code: 'document_missing', label: 'Document not found' }];
  const status = text(doc.status);
  if (status !== 'Approved') return [];
  const touchesContent = ['file_url', 'title', 'version', 'change_summary'].some((key) => key in changes);
  if (!touchesContent) return [];
  return [
    {
      code: 'approved_version_locked',
      label: `Version ${text(doc.version) || ''} is approved and cannot be edited — start a new draft version`.replace('  ', ' '),
    },
  ];
}