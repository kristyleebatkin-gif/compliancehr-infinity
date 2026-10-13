// Per-module internal audit report: gathers live record counts, recent
// activity and compliance tracker alerts for one module, renders an extensive
// branded PDF and logs the audit to the Internal Audit Register.
import { jsPDF } from 'jspdf';
import { base44 } from '@/api/base44Client';
import { drawCompanyBranding, drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';
import { MODULE_TRACKERS, trackerQuery } from '@/lib/moduleTrackers';

const TITLE_FIELDS = ['title', 'full_name', 'name', 'subject', 'entry_title', 'applicant_name', 'business_name', 'equipment_name', 'message'];
const recordTitle = (r) => { for (const f of TITLE_FIELDS) { if (r?.[f]) return String(r[f]); } return 'Untitled record'; };

const D = (d) => d.toISOString().slice(0, 10);
const today = () => D(new Date());
const minusDays = (days) => D(new Date(Date.now() - days * 86400000));

// Which data each module screen audits.
export const MODULE_AUDIT_ENTITIES = {
  '/staff': [['StaffProfile', 'Staff profiles'], ['EmployeeDocument', 'Employee documents']],
  '/participants': [['ParticipantProfile', 'Participant profiles'], ['Goal', 'Goals']],
  '/documents': [['EmployeeDocument', 'Employee documents'], ['CompanyDocument', 'Company documents']],
  '/compliance': [['Checklist', 'Checklists'], ['ComplianceChecklistEntry', 'Completed checklists'], ['Audit', 'Audits']],
  '/checklists': [['Checklist', 'Checklists'], ['ComplianceChecklistEntry', 'Completed checklists']],
  '/training': [['TrainingModule', 'Training modules'], ['TrainingCompletion', 'Completed training']],
  '/certificates': [['Certificate', 'Certificates']],
  '/tasks': [['TodoTask', 'Tasks']],
  '/incidents': [['Incident', 'Incidents']],
  '/risks': [['Risk', 'Risk reports']],
  '/feedback': [['Feedback', 'Feedback'], ['Survey', 'Surveys']],
  '/assets': [['Asset', 'Assets']],
  '/invoicing': [['Invoice', 'Invoices']],
  '/quotes': [['Quote', 'Quotes']],
  '/receipts': [['Receipt', 'Receipts']],
  '/company-safe': [['Policy', 'Policies'], ['CompanyDocument', 'Company documents'], ['InsurancePolicy', 'Insurance policies']],
  '/emergency-response': [['SafetyCheck', 'Safety checks'], ['EmergencyDrill', 'Emergency drills'], ['EmergencyDocument', 'Emergency documents']],
  '/programs': [['Event', 'Programs & events'], ['Survey', 'Surveys']],
  '/communications': [['CommunicationEntry', 'Communication records']],
  '/intake': [['IntakeCase', 'Intake cases'], ['Intake', 'Intake & referrals']],
  '/goals': [['Goal', 'Goals'], ['GoalProgressNote', 'Progress notes']],
  '/quality': [['QualityItem', 'Quality & improvement items']],
  '/contacts': [['Contact', 'Key contacts']],
  '/volunteers': [['Volunteer', 'Volunteers']],
  '/roster': [['Shift', 'Shifts'], ['LeaveRequest', 'Leave requests']],
  '/rostering': [['Shift', 'Shifts'], ['LeaveRequest', 'Leave requests']],
  '/meetings': [['Meeting', 'Meetings']],
  '/equipment-manuals': [['EquipmentManual', 'Equipment manuals'], ['Chemical', 'MSDS library']],
  '/referrals': [['Referral', 'Referrals']],
  '/ndis-portal': [['Provider', 'Provider records'], ['LegalRequirement', 'Legal requirements']],
  '/ndis-updates': [['NdisUpdate', 'NDIS updates']],
  '/crm': [['Lead', 'Leads'], ['Contact', 'Contacts']],
  '/procurement': [['Supplier', 'Suppliers'], ['PurchaseOrder', 'Purchase orders']],
  '/projects': [['BusinessProject', 'Business projects']],
  '/visual-boards': [['VisualRoutine', 'Visual routines']],
  '/hr': [['LeaveRequest', 'Leave requests'], ['PerformanceReview', 'Performance reviews']],
};

// Route aliases so every URL of a module gets the same audit scope.
MODULE_AUDIT_ENTITIES['/key-contacts'] = MODULE_AUDIT_ENTITIES['/contacts'];
MODULE_AUDIT_ENTITIES['/volunteering-placements'] = MODULE_AUDIT_ENTITIES['/volunteers'];
MODULE_AUDIT_ENTITIES['/community-referral'] = MODULE_AUDIT_ENTITIES['/referrals'];

const COL = {
  green: [22, 163, 74],
  amber: [202, 138, 4],
  red: [220, 38, 38],
  slate: [100, 116, 139],
};

async function gatherTrackers(path) {
  const items = MODULE_TRACKERS[path] || [];
  const results = await Promise.allSettled(
    items.map((item) => base44.entities[item.entity].count(trackerQuery(item, item.dynamic))),
  );
  return items.map((item, i) => ({
    label: item.label,
    value: results[i].status === 'fulfilled' ? results[i].value : 0,
    mode: item.dynamic,
  }));
}

export async function gatherModuleAudit(path) {
  const list = MODULE_AUDIT_ENTITIES[path] || [];
  const entities = [];
  for (let i = 0; i < list.length; i += 6) {
    const batch = list.slice(i, i + 6);
    const results = await Promise.allSettled(
      batch.map(async ([entity, label]) => {
        const [total, recent] = await Promise.all([
          base44.entities[entity].count({}),
          base44.entities[entity].count({ created_date: { $gte: `${minusDays(30)}T00:00:00` } }),
        ]);
        return { entity, label, count: total, recent };
      }),
    );
    results.forEach((r) => { if (r.status === 'fulfilled') entities.push(r.value); });
  }

  let recentRecords = [];
  const primary = entities[0];
  if (primary) {
    try {
      const page = await base44.entities[primary.entity].filter({}, { sort: '-created_date', limit: 12 });
      recentRecords = (page.items || []).map((r) => ({ title: recordTitle(r), date: (r.created_date || '').slice(0, 10) }));
    } catch { recentRecords = []; }
  }

  return { path, entities, trackers: await gatherTrackers(path), recentRecords };
}

function trackerColour(mode, value) {
  if (!value) return COL.green;
  return mode === 'soon' ? COL.amber : COL.red;
}

function trackerStatus(mode, value) {
  if (!value) return 'In date';
  return mode === 'soon' ? 'Due soon' : 'Overdue';
}

function heading(doc, y, text) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(23, 78, 138);
  doc.text(text, 40, y);
  y += 4;
  doc.setDrawColor(191, 219, 254);
  doc.line(40, y, pageW - 40, y);
  return y + 16;
}

export async function downloadModuleAuditReport(audit, moduleLabel, { generatedBy = '' } = {}) {
  await loadCompanyBranding();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const generatedAt = new Date().toLocaleString('en-AU');
  let y = 64;

  drawCompanyBranding(doc, 40, y, { fontSize: 18 });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('INTERNAL AUDIT', pageW - 40, y, { align: 'right' });
  y += 42;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(30);
  doc.text(`Internal Audit Report: ${moduleLabel}`, 40, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text([generatedAt, generatedBy && `Prepared by ${generatedBy}`].filter(Boolean).join('  |  '), 40, y);
  y += 24;

  // Summary box
  const totalRecords = audit.entities.reduce((s, e) => s + (e.count || 0), 0);
  const recentTotal = audit.entities.reduce((s, e) => s + (e.recent || 0), 0);
  const alerts = audit.trackers.filter((t) => t.value > 0);
  doc.setFillColor(226, 240, 252);
  doc.roundedRect(40, y, pageW - 80, 58, 5, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(23, 78, 138);
  doc.text(`Summary: ${totalRecords.toLocaleString()} records  |  ${recentTotal} added in the last 30 days  |  ${alerts.length} live alert${alerts.length === 1 ? '' : 's'}`, 54, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(`Scope: ${audit.entities.length || 0} data register${audit.entities.length === 1 ? '' : 's'} in this module.`, 54, y + 37);
  doc.text(alerts.length ? `Live compliance tracker: ${alerts.map((a) => `${a.value} ${a.label}`).join(', ')}.` : 'Live compliance tracker: all items in date.', 54, y + 50);
  y += 76;

  // Live compliance tracker section
  if (audit.trackers.length) {
    y = heading(doc, y, 'Live Compliance Tracker');
    for (const t of audit.trackers) {
      if (y > pageH - 90) { doc.addPage(); y = 64; }
      const colour = trackerColour(t.mode, t.value);
      const status = trackerStatus(t.mode, t.value);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(50);
      doc.text(t.label, 40, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colour);
      const statusText = `${t.value} - ${status}`;
      doc.text(statusText, pageW - 40, y, { align: 'right' });
      y += 16;
    }
    y += 8;
  }

  // Data holdings table
  if (audit.entities.length) {
    y = heading(doc, y, 'Data Holdings (records on file)');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text('REGISTER', 40, y);
    doc.text('RECORDS', pageW * 0.6, y, { align: 'right' });
    doc.text('LAST 30 DAYS', pageW - 40, y, { align: 'right' });
    y += 12;
    doc.setDrawColor(210);
    doc.line(40, y, pageW - 40, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    for (const e of audit.entities) {
      if (y > pageH - 90) { doc.addPage(); y = 64; }
      doc.setFontSize(9);
      doc.setTextColor(50);
      doc.text(e.label, 40, y, { maxWidth: pageW * 0.45 });
      doc.text(String(e.count), pageW * 0.6, y, { align: 'right' });
      doc.setTextColor(e.recent ? 23 : 150);
      doc.setFont('helvetica', 'bold');
      doc.text(`+${e.recent}`, pageW - 40, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 16;
    }
    y += 8;
  }

  // Recent records from the primary register
  if (audit.recentRecords.length) {
    y = heading(doc, y, `Most Recent Records (${audit.entities[0]?.label || 'Primary register'})`);
    for (const r of audit.recentRecords) {
      if (y > pageH - 90) { doc.addPage(); y = 64; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50);
      doc.text(doc.splitTextToSize(r.title, pageW - 140)[0], 40, y);
      doc.setTextColor(130);
      doc.text(r.date, pageW - 40, y, { align: 'right' });
      y += 15;
    }
    y += 8;
  }

  // Audit statement
  y = heading(doc, y, 'Audit Statement');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(70);
  const statement = [
    `This report provides an internal audit snapshot of the ${moduleLabel} module as at ${generatedAt}.`,
    `It captures the data held across ${audit.entities.length || 0} register(s) (${totalRecords.toLocaleString()} records in total), recent activity in the last 30 days, and the live compliance tracker results for overdue and soon-due items.`,
    alerts.length
      ? `Attention required: ${alerts.map((a) => `${a.value} ${a.label}`).join(', ')}. Follow up these items and re-run this audit once resolved.`
      : 'No overdue or soon-due items were detected by the live compliance tracker for this module at the time of the audit.',
    'This report is logged to the Internal Audit Register as internal audit evidence and supports the NDIS audit evidence map.',
  ];
  for (const line of statement) {
    const wrapped = doc.splitTextToSize(line, pageW - 90);
    for (const w of wrapped) {
      if (y > pageH - 90) { doc.addPage(); y = 64; }
      doc.text(w, 40, y);
      y += 13;
    }
    y += 4;
  }

  drawDocumentFooter(doc, { title: `Internal Audit Report: ${moduleLabel}`, code: 'CM-MOD-AUDIT' });
  const safe = moduleLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`internal-audit-report-${safe}-${today()}.pdf`);

  try {
    await base44.entities.Register.create({
      register_type: 'Internal Audit Register',
      entry_title: `Internal Audit Report: ${moduleLabel}`,
      description: `Module audit generated for ${moduleLabel}: ${totalRecords.toLocaleString()} records across ${audit.entities.length || 0} register(s); ${alerts.length} live tracker alert(s).`,
      linked_entity_type: 'ModuleAuditReport',
      linked_entity_id: audit.path,
      status: alerts.length ? 'Attention required' : 'In date',
      recorded_date: today(),
      owner: generatedBy || 'Internal Audit',
    });
  } catch (e) { console.error('Audit register logging failed', e); }
}