import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const COMPLAINT_CATEGORIES = ['Service Quality', 'Staff Conduct', 'Communication', 'Safety', 'Financial', 'Other'];
const RELATIONSHIPS = ['Participant', 'Family Member', 'Staff', 'Advocate', 'Other'];
const INTEREST_TYPES = ['Volunteer', 'Student Placement'];

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Public, unauthenticated submission endpoint for the provider's website forms.
// Complaints land in the complaint register; volunteer interest lands in the
// Volunteers module applications list. Service role is required because both
// entities restrict anonymous creates.
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
    const base44 = createClientFromRequest(req);
    const now = new Date();
    // Persisted counts apply across warm/cold function instances. This is a
    // basic flood brake; simultaneous requests still require an atomic gateway limiter.
    const recent = new Date(now.getTime() - 60000).toISOString();
    const [complaints, volunteers] = await Promise.all([
      base44.asServiceRole.entities.Complaint.count({ source_entity_type: 'Public Form', created_date: { $gte: recent } }),
      base44.asServiceRole.entities.VolunteerInterest.count({ created_date: { $gte: recent } }),
    ]);
    if (complaints + volunteers >= 30) return Response.json({ error: 'Too many submissions. Please try again shortly.' }, { status: 429, headers: { 'Retry-After': '60' } });

    const date = now.toISOString().slice(0, 10);
    const time = now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5);

    if (body.kind === 'complaint') {
      const title = str(body.title, 140);
      const description = str(body.description, 4000);
      const complainant_name = str(body.complainant_name, 120);
      if (!title || !description || !complainant_name) {
        return Response.json({ error: 'Name, subject and details are required.' }, { status: 400 });
      }
      const category = COMPLAINT_CATEGORIES.includes(body.category) ? body.category : 'Other';
      const relationship = RELATIONSHIPS.includes(body.complainant_relationship) ? body.complainant_relationship : 'Other';
      const complaint_id = 'CMP-' + date.replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      const rec = await base44.asServiceRole.entities.Complaint.create({
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
      const full_name = str(body.full_name, 120);
      const email = str(body.email, 160).toLowerCase();
      const phone = str(body.phone, 40);
      const motivation = str(body.motivation, 3000);
      if (!full_name || !emailOk(email) || !phone || !motivation || body.privacy_consent !== true) {
        return Response.json({ error: 'Full name, a valid email, phone, motivation and privacy consent are required.' }, { status: 400 });
      }
      const interest_type = INTEREST_TYPES.includes(body.interest_type) ? body.interest_type : 'Volunteer';
      const rec = await base44.asServiceRole.entities.VolunteerInterest.create({
        interest_type,
        full_name,
        email,
        phone,
        suburb: str(body.suburb, 120),
        institution_name: str(body.institution_name, 160),
        course_name: str(body.course_name, 160),
        student_number: str(body.student_number, 60),
        preferred_service_area: str(body.preferred_service_area, 200),
        availability: str(body.availability, 300),
        relevant_experience: str(body.relevant_experience, 3000),
        motivation,
        support_or_adjustments: str(body.support_or_adjustments, 1000),
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