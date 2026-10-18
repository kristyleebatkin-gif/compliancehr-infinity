import { jsPDF } from 'jspdf';
import { drawFormHeader, drawSectionHeading, drawFieldRows, drawSignatures } from '@/lib/formDocumentStyles';
import { drawDocumentFooter } from '@/lib/companyBranding';

const MARGIN = 40;

function drawParagraph(doc, y, text) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 45);
  const lines = doc.splitTextToSize(String(text || ''), pageW - MARGIN * 2);
  for (const line of lines) {
    if (y > pageH - 64) { doc.addPage(); y = 54; }
    doc.text(line, MARGIN, y);
    y += 13;
  }
  return y + 8;
}

function drawBullets(doc, y, text) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 45);
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, pageW - MARGIN * 2 - 14);
    for (let i = 0; i < wrapped.length; i++) {
      if (y > pageH - 64) { doc.addPage(); y = 54; }
      if (i === 0) {
        doc.setFillColor(124, 58, 237);
        doc.circle(MARGIN + 3, y - 3, 1.6, 'F');
      }
      doc.text(wrapped[i], MARGIN + 12, y);
      y += 13;
    }
    y += 2;
  }
  return y + 6;
}

const fmt = (d) => (d ? String(d).slice(0, 10) : 'Not set');

/** Branded employment contract with full professional clauses. */
export function downloadContractPdf(data, business = {}, completedBy = '') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const company = business.business_name || 'the Employer';
  const abn = business.abn ? ` (ABN ${business.abn})` : '';
  const address = [business.address_line, business.suburb, business.state, business.postcode].filter(Boolean).join(', ') || 'the registered address of the Employer';
  const award = data.industrial_instrument || 'the applicable industrial instrument';
  let y = drawFormHeader(doc, { title: 'Employment Contract', code: 'HR-CON', subtitle: company, completedBy, docType: 'Form' });

  y = drawSectionHeading(doc, y, 'Parties');
  y = drawParagraph(doc, y, `This employment agreement ("Agreement") is made between ${company}${abn}, of ${address} ("the Employer"), and ${data.employee_name || 'the Employee'} ("the Employee"). The Employer operates a National Disability Insurance Scheme (NDIS) registered provider business and the Employee agrees to work for the Employer on the terms set out in this Agreement.`);

  y = drawSectionHeading(doc, y, 'Employment Details');
  y = drawFieldRows(doc, y, [
    { label: 'Position Title' }, { label: 'Employment Type' }, { label: 'Classification / Level' },
    { label: 'Award / Agreement' }, { label: 'Manager / Supervisor' }, { label: 'Commencement Date' },
    { label: 'Probation End Date' }, { label: 'Ordinary Weekly Hours' }, { label: 'Hourly Rate ($)' }, { label: 'End Date (Fixed Term only)' },
  ], {
    'Position Title': data.position_title,
    'Employment Type': data.employment_type,
    'Classification / Level': data.classification,
    'Award / Agreement': data.industrial_instrument,
    'Manager / Supervisor': data.manager_name,
    'Commencement Date': fmt(data.commencement_date),
    'Probation End Date': fmt(data.probation_end_date),
    'Ordinary Weekly Hours': data.ordinary_weekly_hours ? `${data.ordinary_weekly_hours} hours` : '',
    'Hourly Rate ($)': data.hourly_rate ? `$${data.hourly_rate} per hour` : '',
    'End Date (Fixed Term only)': fmt(data.end_date),
  });

  y = drawSectionHeading(doc, y, '1. Position and Duties');
  y = drawParagraph(doc, y, `The Employee is employed in the position of ${data.position_title || 'the agreed position'}. The Employee will perform the duties set out below, together with any other reasonable duties consistent with the position that the Employer directs from time to time.`);
  y = drawBullets(doc, y, data.position_duties);

  y = drawSectionHeading(doc, y, '2. Type of Employment and Award');
  y = drawParagraph(doc, y, `The Employee is engaged as a ${data.employment_type || 'Part Time'} employee. This Agreement is governed by the ${award} ("the Award") and the National Employment Standards. Where this Agreement is silent, the Award and the National Employment Standards apply.`);

  y = drawSectionHeading(doc, y, '3. Hours of Work');
  y = drawParagraph(doc, y, data.ordinary_weekly_hours
    ? `The Employee's ordinary hours of work are ${data.ordinary_weekly_hours} hours per week, rostered in accordance with operational needs, the Award and the National Employment Standards. The Employee may be required to work reasonable additional hours in accordance with the Award.`
    : `The Employee's hours of work will be rostered in accordance with operational needs, the Award and the National Employment Standards. The Employee may be required to work reasonable additional hours in accordance with the Award.`);

  y = drawSectionHeading(doc, y, '4. Remuneration');
  y = drawParagraph(doc, y, data.hourly_rate
    ? `The Employee will be paid $${data.hourly_rate} per hour, plus any applicable Award penalties, loadings and allowances for the shifts worked. Wages are paid fortnightly into the Employee's nominated bank account, less any deductions authorised by law or by the Employee in writing.`
    : `The Employee will be paid at the rate applicable to their classification under the Award, plus any applicable penalties, loadings and allowances for the shifts worked. Wages are paid fortnightly into the Employee's nominated bank account, less any deductions authorised by law or by the Employee in writing.`);

  y = drawSectionHeading(doc, y, '5. Probationary Period');
  y = drawParagraph(doc, y, data.probation_end_date
    ? `The Employee's employment is subject to a probationary period ending ${fmt(data.probation_end_date)}. During or at the end of this period the Employer may confirm the appointment, extend probation or end employment in accordance with the National Employment Standards.`
    : `The Employee's employment is subject to a probationary period of up to six (6) months. During or at the end of this period the Employer may confirm the appointment, extend probation or end employment in accordance with the National Employment Standards.`);

  y = drawSectionHeading(doc, y, '6. NDIS and Worker Compliance Requirements');
  y = drawParagraph(doc, y, `As a condition of employment, the Employee must at all times hold and maintain a current NDIS Worker Screening Check, a current Working With Children Check where required, and current First Aid and CPR certifications as applicable to their role. The Employee must comply with the NDIS Code of Conduct, the NDIS Practice Standards, and all company policies, procedures and training requirements. The Employee must immediately notify the Employer if any of these clearances or certifications expires, is suspended or is cancelled.`);

  y = drawSectionHeading(doc, y, '7. Confidentiality and Privacy');
  y = drawParagraph(doc, y, `The Employee must not, during or after their employment, disclose or use any confidential information about the Employer, its clients, participants or staff, except in the proper performance of their duties. The Employee must comply with the Privacy Act 1988 (Cth), the NDIS Act 2013 (Cth) and the company's privacy policies in handling all personal and sensitive information.`);

  y = drawSectionHeading(doc, y, '8. Policies, Code of Conduct and Workplace Behaviour');
  y = drawParagraph(doc, y, `The Employee must comply with all company policies, procedures and the code of conduct, as amended from time to time. The Employee must treat participants, colleagues and members of the public with respect, and support a safe, inclusive workplace. Breaches of policy or the code of conduct may result in disciplinary action, including termination of employment.`);

  y = drawSectionHeading(doc, y, '9. Termination');
  y = drawParagraph(doc, y, `Employment may be terminated by either party by giving notice in accordance with the Award and the National Employment Standards. The Employer may terminate employment without notice in cases of serious misconduct. The Employee must return all company property, records and participant information upon termination.`);

  y = drawSectionHeading(doc, y, '10. Agreement');
  y = drawParagraph(doc, y, `The parties agree that this Agreement records the entire terms of the employment relationship as at the commencement date, and that it may be varied in writing by mutual agreement.`);

  y = drawSignatures(doc, y, {
    heading: 'Execution',
    left: `Employee: ${data.employee_name || ''} (Signature / Date)`,
    right: 'Employer: Authorised Officer (Signature / Date)',
    completedBy,
    completedAt: fmt(data.completed_date || new Date().toISOString().slice(0, 10)),
  });

  drawDocumentFooter(doc, { title: 'Employment Contract', code: 'HR-CON' });
  doc.save(`Employment Contract - ${data.employee_name || 'Employee'}.pdf`);
}

/** Branded position description with acknowledgement panel. */
export function downloadPositionDescriptionPdf(data, business = {}, completedBy = '') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const company = business.business_name || 'ComplianceHR';
  let y = drawFormHeader(doc, { title: 'Position Description', code: 'HR-PD', subtitle: company, completedBy, docType: 'Form' });

  y = drawSectionHeading(doc, y, 'Position Details');
  y = drawFieldRows(doc, y, [
    { label: 'Employee Name' }, { label: 'Position Title' }, { label: 'Reports To' }, { label: 'Employment Type' },
  ], {
    'Employee Name': data.employee_name,
    'Position Title': data.position_title,
    'Reports To': data.reports_to,
    'Employment Type': data.employment_type,
  });

  y = drawSectionHeading(doc, y, 'Position Purpose');
  y = drawParagraph(doc, y, data.position_purpose);

  y = drawSectionHeading(doc, y, 'Key Responsibilities');
  y = drawBullets(doc, y, data.key_responsibilities);

  y = drawSectionHeading(doc, y, 'Essential Requirements');
  y = drawBullets(doc, y, data.essential_requirements);

  y = drawSectionHeading(doc, y, 'Qualifications and Experience');
  y = drawParagraph(doc, y, data.qualifications_experience);

  y = drawSectionHeading(doc, y, 'Performance Measures');
  y = drawBullets(doc, y, data.performance_measures);

  y = drawSignatures(doc, y, {
    heading: 'Acknowledgement',
    left: `Employee: ${data.employee_name || ''} (Signature / Date)`,
    right: 'Supervisor / Manager (Signature / Date)',
    completedBy,
    completedAt: fmt(data.acknowledged_date || new Date().toISOString().slice(0, 10)),
  });

  drawDocumentFooter(doc, { title: 'Position Description', code: 'HR-PD' });
  doc.save(`Position Description - ${data.employee_name || 'Employee'}.pdf`);
}