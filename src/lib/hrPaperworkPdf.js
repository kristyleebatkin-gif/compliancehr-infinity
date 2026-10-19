import { jsPDF } from 'jspdf';
import { drawFormHeader, drawSectionHeading, drawFieldRows, drawSignatures } from '@/lib/formDocumentStyles';
import { drawDocumentFooter } from '@/lib/companyBranding';

import { drawPdfParagraph, drawPdfBullets } from '@/lib/pdfFlowText';

function drawParagraph(doc, y, text) { return drawPdfParagraph(doc, y, text); }
function drawBullets(doc, y, text) { return drawPdfBullets(doc, y, String(text || '').split('\n').map((line) => line.trim()).filter(Boolean)); }

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
  y = drawParagraph(doc, y, `This employment agreement ("Agreement") is made between ${company}${abn}, of ${address} ("the Employer"), and ${data.employee_name || 'the Employee'} ("the Employee"). The Employer delivers disability and community support services and the Employee agrees to work for the Employer on the completed terms set out in this Agreement. This Agreement cannot exclude or reduce entitlements under the National Employment Standards or an applicable award or enterprise agreement.`);

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
    ? `Any agreed probation period ends ${fmt(data.probation_end_date)}. The Employer will provide induction, feedback and review. Probation does not remove statutory entitlements or change the statutory minimum employment period. Any extension must be lawful, agreed where required, and recorded in writing.`
    : `Any probation period must be agreed and recorded before issue. The Employer will provide induction, feedback and review. Probation does not remove statutory entitlements or change the statutory minimum employment period.`);

  y = drawSectionHeading(doc, y, '6. NDIS and Worker Compliance Requirements');
  y = drawParagraph(doc, y, `As a condition of employment, the Employee must at all times hold and maintain a current NDIS Worker Screening Check, a current Working With Children Check where required, and current First Aid and CPR certifications as applicable to their role. The Employee must comply with the NDIS Code of Conduct, the NDIS Practice Standards, and all company policies, procedures and training requirements. The Employee must immediately notify the Employer if any of these clearances or certifications expires, is suspended or is cancelled.`);

  y = drawSectionHeading(doc, y, '7. Confidentiality and Privacy');
  y = drawParagraph(doc, y, `The Employee must not, during or after their employment, disclose or use any confidential information about the Employer, its clients, participants or staff, except in the proper performance of their duties. The Employee must comply with the Privacy Act 1988 (Cth), the NDIS Act 2013 (Cth) and the company's privacy policies in handling all personal and sensitive information.`);

  y = drawSectionHeading(doc, y, '8. Policies, Code of Conduct and Workplace Behaviour');
  y = drawParagraph(doc, y, `The Employee must comply with all company policies, procedures and the code of conduct, as amended from time to time. The Employee must treat participants, colleagues and members of the public with respect, and support a safe, inclusive workplace. Breaches of policy or the code of conduct may result in disciplinary action, including termination of employment.`);

  y = drawSectionHeading(doc, y, '9. Termination');
  y = drawParagraph(doc, y, `Employment may be terminated by either party by giving notice in accordance with the Award and the National Employment Standards. The Employer may terminate employment without notice in cases of serious misconduct. The Employee must return all company property, records and participant information upon termination.`);

  y = drawSectionHeading(doc, y, '10. Superannuation');
  y = drawParagraph(doc, y, 'The Employer will make superannuation guarantee contributions at the statutory rate, on the required earnings and by the required dates. The Employee may provide a valid fund choice; otherwise the applicable stapled-fund or default-fund process will be followed. Minimum superannuation obligations are not absorbed into a stated hourly wage.');

  y = drawSectionHeading(doc, y, '11. Leave and Minimum Entitlements');
  y = drawParagraph(doc, y, 'Leave, public-holiday entitlements and other minimum conditions apply in accordance with the National Employment Standards and the applicable industrial instrument. Permanent employees receive the paid leave applicable to their employment. Casual employees receive the entitlements applicable to casual employment, including applicable unpaid leave and paid family and domestic violence leave. Casual loading does not remove statutory rights.');

  y = drawSectionHeading(doc, y, '12. Rostering, Travel and Safe Work');
  y = drawParagraph(doc, y, 'Rosters, breaks, minimum engagements, overtime, penalty rates, broken shifts, sleepovers and allowances must comply with the industrial instrument that applies to the actual work. Record agreed part-time hours and work patterns in writing where required. Record and reimburse authorised work-related travel and expenses as required. Follow participant plans, fatigue controls, infection-control procedures and safe manual-handling practices, and promptly report incidents, hazards and safeguarding concerns. Do not perform specialist or medication tasks outside assessed competence and authorisation.');

  y = drawSectionHeading(doc, y, '13. Agreement and Review');
  y = drawParagraph(doc, y, 'Before issue, the Employer must confirm the employment basis, award coverage, classification, pay, hours and any fixed-term restrictions, provide required information statements and obtain appropriate HR/legal review. The Employee must have an opportunity to ask questions and seek independent advice. An acknowledgement or signature does not waive minimum statutory rights.');
  y = drawParagraph(doc, y, `The parties agree that this Agreement records the entire terms of the employment relationship as at the commencement date, and that it may be varied in writing by mutual agreement.`);

  if (data.signature) {
    y = drawSectionHeading(doc, y, 'Recorded Electronic Signature');
    y = drawParagraph(doc, y, `${data.signature}. Employee signed: ${fmt(data.employee_signed_date)}.`);
  }
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