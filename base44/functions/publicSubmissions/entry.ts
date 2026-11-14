import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { scopedEntities, activeTenantIds } from '../../shared/tenantScope.ts';

// Release 2: a public submission is filed under one business. The form may name it
// (body.tenant_key); with a single active business that business is used. With several and
// none named, the submission is refused rather than guessed.
export function pickPublicBusiness(requested: unknown, active: string[]) {
  const key = typeof requested === 'string' ? requested.trim() : '';
  if (key) return active.includes(key) ? { ok: true, tenantId: key } : { ok: false, error: 'Unknown organisation.' };
  if (active.length === 1) return { ok: true, tenantId: active[0] };
  return { ok: false, error: 'Please use the form link provided by the organisation.' };
}

const COMPLAINT_CATEGORIES = ['Service Quality', 'Staff Conduct', 'Communication', 'Safety', 'Financial', 'Other'];
const RELATIONSHIPS = ['Participant', 'Family Member', 'Staff', 'Advocate', 'Other'];
const INTEREST_TYPES = ['Volunteer', 'Student Placement'];

// Neutralises spreadsheet formula-injection prefixes in public text fields
const sanitizePublicText = (v, max) => {
  if (typeof v !== 'string') return '';
  const trimmed = v.trim().slice(0, max);
  return /^[\s\u0000-\u001f]*[=+\-@]/.test(trimmed) ? `'${trimmed}` : trimmed;
};

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// In-memory IP & tenant sliding-window throttle (supplements persisted DB count flood brake)
const ipHits = new Map();
const tenantHits = new Map();

function checkSlidingWindow(store, key, maxRequests, windowMs, nowMs) {
  const history = (store.get(key) || []).filter((ts) => nowMs - ts < windowMs);
  if (history.length >= maxRequests) return false;
  history.push(nowMs);
  store.set(key, history);
  return true;
}

export function verifyPublicAbuseControls(body, headers = new Headers(), nowMs = Date.now()) {
  // 1. Bot honeypot trap
  if (body?.website || body?.bot_field || body?.company_url) {
    return { allowed: false, status: 400, error: 'Automated bot submission rejected.' };
  }

  // 2. CAPTCHA challenge check (when challenge_a & challenge_b or captcha_expected are supplied)
  if (body?.challenge_a !== undefined && body?.challenge_b !== undefined) {
    const expected = Number(body.challenge_a) + Number(body.challenge_b);
    const provided = Number(String(body.captcha_answer ?? '').trim());
    if (!Number.isFinite(provided) || provided !== expected) {
      return { allowed: false, status: 400, error: 'Please complete the human verification challenge correctly.' };
    }
  }

  // 3. IP throttling (max 8 submissions per IP per minute)
  const ip =
    (headers.get?.('x-forwarded-for') || headers.get?.('cf-connecting-ip') || 'anonymous-ip')
      .split(',')[0]
      .trim() || 'anonymous-ip';
  if (!checkSlidingWindow(ipHits, ip, 8, 60000, nowMs)) {
    return { allowed: false, status: 429, error: 'Too many requests from this IP address. Please wait 60 seconds.' };
  }

  // 4. Tenant throttling (max 20 submissions per tenant per minute)
  const tenantKey = String(body?.tenant_key || body?.tenant_id || 'default-tenant').slice(0, 80);
  if (!checkSlidingWindow(tenantHits, tenantKey, 20, 60000, nowMs)) {
    return { allowed: false, status: 429, error: 'Too many submissions for this organisation. Please try again shortly.' };
  }

  return { allowed: true, ip, tenantKey };
}

export default async function(req) {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const now = new Date();
    const abuseCheck = verifyPublicAbuseControls(body, req.headers, now.getTime());
    if (!abuseCheck.allowed) {
      return Response.json(
        { error: abuseCheck.error },
        { status: abuseCheck.status, headers: abuseCheck.status === 429 ? { 'Retry-After': '60' } : {} }
      );
    }

    const base44 = createClientFromRequest(req);
    const business = pickPublicBusiness(body.tenant_key, await activeTenantIds(base44));
    if (!business.ok) return Response.json({ error: business.error }, { status: 400 });
    const entities = scopedEntities(base44.asServiceRole.entities, business.tenantId);

    const recent = new Date(now.getTime() - 60000).toISOString();
    const [complaints, volunteers] = await Promise.all([
      entities.Complaint.count({ source_entity_type: 'Public Form', created_date: { $gte: recent } }),
      entities.VolunteerInterest.count({ created_date: { $gte: recent } }),
    ]);
    if (complaints + volunteers >= 30) {
      return Response.json(
        { error: 'Too many submissions. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const date = now.toISOString().slice(0, 10);
    const time = now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5);

    if (body.kind === 'complaint') {
      const title = sanitizePublicText(body.title, 140);
      const description = sanitizePublicText(body.description, 4000);
      const complainant_name = sanitizePublicText(body.complainant_name, 120);
      if (!title || !description || !complainant_name) {
        return Response.json({ error: 'Name, subject and details are required.' }, { status: 400 });
      }
      const category = COMPLAINT_CATEGORIES.includes(body.category) ? body.category : 'Other';
      const relationship = RELATIONSHIPS.includes(body.complainant_relationship) ? body.complainant_relationship : 'Other';
      const complaint_id = 'CMP-' + date.replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      const rec = await entities.Complaint.create({
        title,
        complaint_id,
        date_received: date,
        time_received: time,
        complainant_name,
        complainant_relationship: relationship,
        category,
        description,
        status: 'Received',
        priority: 'Medium',
        source_entity_type: 'Public Form',
        source_form_title: 'Public Complaint Form',
      });
      return Response.json({ ok: true, reference: rec.complaint_id });
    }

    if (body.kind === 'volunteer_interest') {
      const full_name = sanitizePublicText(body.full_name, 120);
      const email = sanitizePublicText(body.email, 160).toLowerCase();
      const phone = sanitizePublicText(body.phone, 40);
      const motivation = sanitizePublicText(body.motivation, 3000);
      if (!full_name || !emailOk(email) || !phone || !motivation || body.privacy_consent !== true) {
        return Response.json({ error: 'Full name, a valid email, phone, motivation and privacy consent are required.' }, { status: 400 });
      }
      const interest_type = INTEREST_TYPES.includes(body.interest_type) ? body.interest_type : 'Volunteer';
      const rec = await entities.VolunteerInterest.create({
        interest_type,
        full_name,
        email,
        phone,
        suburb: sanitizePublicText(body.suburb, 120),
        institution_name: sanitizePublicText(body.institution_name, 160),
        course_name: sanitizePublicText(body.course_name, 160),
        student_number: sanitizePublicText(body.student_number, 60),
        preferred_service_area: sanitizePublicText(body.preferred_service_area, 200),
        availability: sanitizePublicText(body.availability, 300),
        relevant_experience: sanitizePublicText(body.relevant_experience, 3000),
        motivation,
        support_or_adjustments: sanitizePublicText(body.support_or_adjustments, 1000),
        privacy_consent: true,
        submitted_at: now.toISOString(),
        status: 'Received',
      });
      return Response.json({ ok: true, reference: rec.id });
    }

    return Response.json({ error: 'Unknown submission kind' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}