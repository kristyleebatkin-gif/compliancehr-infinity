import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { auDate, auTime, pretty, pageItems } from '../../shared/reminders.ts';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';

// Daily register-wide reminder scan. Covers every register that previously had no
// automated follow-up: quality escalation, overdue invoices, quote expiry, certificate
// expiry, document reviews, asset maintenance, equipment/MSDS reviews, upcoming events,
// meeting actions, lead follow-ups, NDIS deadlines, supplier review and compliance
// checklist tasks. Audit actions are covered separately by auditActionEscalation.
// Idempotent: each item alerts once per state, deduped against diary subjects and
// existing notifications, following the same pattern as keyAuthorityReminders.
const ADMIN_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];
const HORIZON_DAYS = 30;
const SOON_DAYS = 7;

const NOTE_TYPES = [
  'Quality Escalation', 'Invoice Overdue', 'Quote Expiry', 'Certificate Expiry',
  'Document Review', 'Asset Maintenance', 'Equipment Review', 'Event Reminder',
  'Meeting Action', 'Lead Follow-up', 'NDIS Deadline', 'Supplier Review',
  'Compliance Checklist',
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dryRun = !!body.dry_run;

    const now = new Date();
    const today = auDate(now);
    const soon = auDate(new Date(now.getTime() + SOON_DAYS * 86400000));
    const horizon = auDate(new Date(now.getTime() + HORIZON_DAYS * 86400000));
    const time = auTime(now);
    const monthKey = auDate(now).slice(0, 7);

    const [
      qualityP, invoiceP, quoteP, certP, docsP, maintP, equipP, eventsP,
      actionsP, leadsP, ndisP, suppliersP, checklistsP, usersP, entriesP, notifsP,
    ] = await Promise.all([
      service.entities.QualityItem.filter({}, { limit: 500 }),
      service.entities.Invoice.filter({}, { limit: 500 }),
      service.entities.Quote.filter({}, { limit: 500 }),
      service.entities.Certificate.filter({}, { limit: 1000 }),
      service.entities.CompanyDocument.filter({}, { limit: 500 }),
      service.entities.AssetMaintenance.filter({}, { limit: 500 }),
      service.entities.EquipmentManual.filter({}, { limit: 500 }),
      service.entities.CommunityEvent.filter({}, { limit: 500 }),
      service.entities.MeetingActionRecord.filter({}, { limit: 500 }),
      service.entities.Lead.filter({}, { limit: 500 }),
      service.entities.NDISComplianceDeadline.filter({}, { limit: 500 }),
      service.entities.Supplier.filter({}, { limit: 500 }),
      service.entities.ComplianceChecklistEntry.filter({}, { limit: 1000 }),
      service.entities.User.list(),
      service.entities.CommunicationEntry.filter({ note_type: { $in: NOTE_TYPES } }, { limit: 1000 }),
      service.entities.Notification.filter({}, { limit: 1000 }),
    ]);

    const entryKeys = new Set(pageItems(entriesP).map((e) => String(e.subject || '')));
    const notifKeys = new Set(pageItems(notifsP).map((n) => String(n.message || '')));

    const groups = [];
    const addGroup = (note_type, module, notif_type, attention, items) => {
      const fresh = items.filter((i) => !entryKeys.has(i.subject) && !notifKeys.has(i.subject));
      if (fresh.length > 0) groups.push({ note_type, module, notif_type, attention, items: fresh });
    };

    // 1. Quality & Improvement — overdue / due-soon items.
    addGroup('Quality Escalation', 'Quality & Improvement', 'Overdue Escalation', 'Quality & Improvement Manager, Administration',
      pageItems(qualityP)
        .filter((q) => !['Implemented', 'Closed'].includes(q.status) && q.target_date)
        .map((q) => ({ q, state: q.target_date < today ? 'Overdue' : (q.target_date <= soon ? 'Due Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Quality item ${r.state.toLowerCase()}: ${r.title} (target ${pretty(r.target_date)})`,
          body: `Quality ${r.q.type || 'item'} "${r.q.title}" is ${r.state.toLowerCase()} with a target date of ${pretty(r.target_date)}.`
            + `${r.q.nominated_to ? ` Nominated to ${r.q.nominated_to}.` : ''} Please progress or reschedule it.`,
        })));

    // 2. Invoicing Centre — unpaid invoices overdue or due soon.
    addGroup('Invoice Overdue', 'Invoicing Centre', 'Overdue Escalation', 'Finance & Accounts Officer, Administration',
      pageItems(invoiceP)
        .filter((inv) => inv.status !== 'Paid' && inv.status !== 'Cancelled' && inv.due_date)
        .map((inv) => ({ inv, state: inv.due_date < today ? 'Overdue' : (inv.due_date <= soon ? 'Due Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Invoice ${r.state.toLowerCase()}: ${r.inv.invoice_number || r.inv.client_name} (due ${pretty(r.inv.due_date)})`,
          body: `Invoice ${r.inv.invoice_number || ''} for ${r.inv.client_name} ($${Number(r.inv.amount || 0).toFixed(2)}) is ${r.state.toLowerCase()} (due ${pretty(r.inv.due_date)}). Please follow up payment.`,
        })));

    // 3. Quote Centre — quotes expired or expiring within 7 days.
    addGroup('Quote Expiry', 'Quote Centre', 'Expiry Alert', 'Administration, Finance & Accounts Officer',
      pageItems(quoteP)
        .filter((qt) => !['Accepted', 'Declined', 'Expired'].includes(qt.status) && qt.expiry_date)
        .map((qt) => ({ qt, state: qt.expiry_date < today ? 'Expired' : (qt.expiry_date <= soon ? 'Expiring Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Quote ${r.state.toLowerCase()}: ${r.qt.quote_number || r.qt.client_name} (${pretty(r.qt.expiry_date)})`,
          body: `Quote ${r.qt.quote_number || ''} for ${r.qt.client_name} ($${Number(r.qt.total || 0).toFixed(2)}) has ${r.state === 'Expired' ? 'expired' : 'expiring'} ${pretty(r.qt.expiry_date)}. Please follow up with the client.`,
        })));

    // 4. Certificates — active certificates expiring within 30 days.
    addGroup('Certificate Expiry', 'Certificates', 'Expiry Alert', 'Compliance Manager, Administration',
      pageItems(certP)
        .filter((c) => !['Expired', 'Revoked'].includes(c.status) && c.expiry_date)
        .map((c) => ({ c, state: c.expiry_date < today ? 'Expired' : (c.expiry_date <= horizon ? 'Expiring Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Certificate ${r.state.toLowerCase()}: ${r.c.module_title || 'Certificate'} for ${r.c.staff_name || 'staff'} (${pretty(r.c.expiry_date)})`,
          body: `${r.c.staff_name ? `${r.c.staff_name}'s certificate` : 'Certificate'} "${r.c.module_title || 'Certificate'}" ${r.state === 'Expired' ? 'expired' : 'expires'} ${pretty(r.c.expiry_date)}. Please arrange renewal training.`,
        })));

    // 5. Document Vault — policies / documents due for review.
    addGroup('Document Review', 'Document Vault', 'Policy Review', 'Compliance Manager, Administration',
      pageItems(docsP)
        .filter((d) => d.status !== 'Archived' && d.review_date)
        .map((d) => ({ d, state: d.review_date < today ? 'Overdue' : (d.review_date <= horizon ? 'Due Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Document review ${r.state.toLowerCase()}: ${r.d.name} (${pretty(r.d.review_date)})`,
          body: `Document "${r.d.name}" (version ${r.d.version || 'n/a'}) is ${r.state === 'Overdue' ? 'overdue for' : 'due for'} review on ${pretty(r.d.review_date)}. Please review or update the review date.`,
        })));

    // 6. Asset Management — maintenance due within 30 days.
    addGroup('Asset Maintenance', 'Asset Management', 'Review Reminder', 'Administration, Compliance Manager',
      pageItems(maintP)
        .filter((m) => m.next_maintenance_date)
        .map((m) => ({ m, state: m.next_maintenance_date < today ? 'Overdue' : (m.next_maintenance_date <= horizon ? 'Due Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Asset maintenance ${r.state.toLowerCase()}: ${r.m.asset_name} (${pretty(r.m.next_maintenance_date)})`,
          body: `Maintenance for "${r.m.asset_name}" is ${r.state === 'Overdue' ? 'overdue (was due' : 'due'} ${pretty(r.m.next_maintenance_date)}). Please schedule the maintenance.`,
        })));

    // 7. Equipment & MSDS — manuals / safety data due for review.
    addGroup('Equipment Review', 'Equipment & MSDS', 'Review Reminder', 'Compliance Manager, Administration',
      pageItems(equipP)
        .filter((e) => e.review_date)
        .map((e) => ({ e, state: e.review_date < today ? 'Overdue' : (e.review_date <= horizon ? 'Due Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Equipment manual review ${r.state.toLowerCase()}: ${r.e.title} (${pretty(r.e.review_date)})`,
          body: `Manual "${r.e.title}" (${r.e.equipment_name || 'equipment'}) is ${r.state === 'Overdue' ? 'overdue for' : 'due for'} review on ${pretty(r.e.review_date)}. Please review or update the review date.`,
        })));

    // 8. Programs & Events — upcoming events within 14 days.
    addGroup('Event Reminder', 'Programs & Events', 'General', 'Administration, Team Leader',
      pageItems(eventsP)
        .filter((ev) => !['Completed', 'Cancelled'].includes(ev.status) && ev.event_date)
        .map((ev) => ({ ev, state: ev.event_date >= today && ev.event_date <= soon ? 'Upcoming' : null }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Event upcoming: ${r.ev.title} on ${pretty(r.ev.event_date)}`,
          body: `"${r.ev.title}" is scheduled for ${pretty(r.ev.event_date)}${r.ev.start_time ? ` at ${r.ev.start_time}` : ''}${r.ev.location ? `, ${r.ev.location}` : ''}. Please confirm preparations and attendees.`,
        })));

    // 9. Meeting Centre — meeting actions overdue or due within 7 days.
    addGroup('Meeting Action', 'Meeting Centre', 'Overdue Escalation', 'Administration, Team Leader',
      pageItems(actionsP)
        .filter((a) => !['Completed', 'Cancelled'].includes(a.status) && a.due_date)
        .map((a) => ({ a, state: a.due_date < today ? 'Overdue' : (a.due_date <= soon ? 'Due Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Meeting action ${r.state.toLowerCase()}: ${r.a.action_required || r.a.action_id} (due ${pretty(r.a.due_date)})`,
          body: `Action "${r.a.action_required || r.a.action_id}" from ${r.a.meeting_title || 'a meeting'} is ${r.state.toLowerCase()} (due ${pretty(r.a.due_date)}).${r.a.responsible_person ? ` Responsible: ${r.a.responsible_person}.` : ''} Please progress or close it out.`,
        })));

    // 10. CRM & Leads — follow-ups due today or overdue.
    addGroup('Lead Follow-up', 'CRM & Leads', 'General', 'CRM & Marketing Officer, Administration',
      pageItems(leadsP)
        .filter((l) => !['Won', 'Lost'].includes(l.stage) && l.follow_up_date)
        .map((l) => ({ l, state: l.follow_up_date < today ? 'Overdue' : (l.follow_up_date <= today ? 'Due Today' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Lead follow-up ${r.state.toLowerCase()}: ${r.l.business_name} (due ${pretty(r.l.follow_up_date)})`,
          body: `Lead "${r.l.business_name}" (${r.l.contact_name || 'contact'} on ${r.l.phone || r.l.email || 'file'}) has a follow-up ${r.state.toLowerCase()} for ${pretty(r.l.follow_up_date)}. Please make contact and update the lead stage.`,
        })));

    // 11. NDIS Provider Portal — compliance deadlines due within 30 days.
    addGroup('NDIS Deadline', 'NDIS Provider Portal', 'NDIS Audit Due', 'Compliance Manager, Provider Administrator',
      pageItems(ndisP)
        .filter((n) => !['Completed', 'Submitted'].includes(n.status) && n.due_date)
        .map((n) => ({ n, state: n.due_date < today ? 'Overdue' : (n.due_date <= horizon ? 'Due Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `NDIS deadline ${r.state.toLowerCase()}: ${r.n.title} (due ${pretty(r.n.due_date)})`,
          body: `NDIS requirement "${r.n.title}" is ${r.state === 'Overdue' ? 'overdue (was due' : 'due'} ${pretty(r.n.due_date)}).${r.n.owner ? ` Owner: ${r.n.owner}.` : ''} Please action or sign off.`,
        })));

    // 12. Procurement Hub — monthly supplier register review (key includes month so it recurs).
    addGroup('Supplier Review', 'Procurement Hub', 'General', 'Administration, Finance & Accounts Officer',
      (() => {
        const suppliers = pageItems(suppliersP);
        const inactive = suppliers.filter((s) => s.status === 'Inactive');
        const subject = `Supplier review ${monthKey}: ${suppliers.length} suppliers, ${inactive.length} inactive`;
        const body = `Monthly supplier register review for ${monthKey}: ${suppliers.length} suppliers on file, ${inactive.length} inactive.`
          + `${inactive.length ? ` Inactive: ${inactive.map((s) => s.name).join(', ')}.` : ''} Please confirm suppliers are current and re-qualify or remove stale entries.`;
        return [{ subject, body }];
      })());

    // 13. Compliance checklist tasks — next_due_date due or overdue.
    addGroup('Compliance Checklist', 'Compliance & Report Centre', 'Expiry Alert', 'Compliance Manager, Administration',
      pageItems(checklistsP)
        .filter((c) => c.next_due_date)
        .map((c) => ({ c, state: c.next_due_date < today ? 'Overdue' : (c.next_due_date <= soon ? 'Due Soon' : null) }))
        .filter((r) => r.state)
        .map((r) => ({
          subject: `Compliance task ${r.state.toLowerCase()}: ${r.c.title} (due ${pretty(r.c.next_due_date)})`,
          body: `Compliance checklist task "${r.c.title}" (${r.c.section || 'checklist'}) is ${r.state.toLowerCase()} (due ${pretty(r.c.next_due_date)}). Please complete or reschedule it.`,
        })));

    if (groups.length === 0) {
      return Response.json({ success: true, due_items: 0, message: 'No register items require reminders today.' });
    }

    const administrators = pageItems(usersP).filter((u) => ADMIN_ROLES.includes(u.role)
      && u.account_status !== 'Archived' && String(u.email || '').trim());
    const created = { diary_entries: 0, notifications: [] };

    if (!dryRun) {
      for (const group of groups) {
        for (const item of group.items) {
          await service.entities.CommunicationEntry.create({
            entry_kind: 'Message',
            note_type: group.note_type,
            person_type: 'Employee',
            person_name: 'System',
            subject: item.subject,
            attention: group.attention,
            body: item.body,
            module: group.module,
            entry_date: today,
            entry_time: time,
            sender_name: 'System (Register Reminders)',
            email_sent: false,
          });
          created.diary_entries += 1;
        }
        for (const admin of administrators) {
          await service.entities.Notification.create({
            type: group.notif_type,
            recipient: admin.email,
            recipient_id: admin.id,
            message: group.items.map((i) => i.subject).join('; '),
            read: false,
            linked_entity_type: group.module,
          });
        }
      }
    }

    return Response.json({
      success: true,
      scans: groups.map((g) => ({ note_type: g.note_type, module: g.module, items: g.items.length })),
      due_items: groups.reduce((sum, g) => sum + g.items.length, 0),
      diary_entries_created: created.diary_entries,
      notifications_created: created.notifications.length > 0 || !dryRun ? administrators.length * groups.length : 0,
      dry_run: dryRun,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}