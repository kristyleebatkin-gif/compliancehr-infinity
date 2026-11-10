import { jsPDF } from 'jspdf';
import { drawDocumentFooter, loadCompanyBranding } from '@/lib/companyBranding';
import {
  drawFormHeader, drawFormNotice, drawFieldRows, drawRegisterTable, drawDeclaration, drawSectionHeading, drawReviewSection,
} from '@/lib/formDocumentStyles';

/**
 * Official A4 PDF templates for the forms libraries. Every document is
 * generated fresh as a branded, subscriber-styled template (header from
 * Company Safe, guidance panel, structured body, declaration, signatures
 * and branded footer) instead of linking to the legacy office files.
 * Content is sourced from the current document registers (field labels,
 * tables) plus per-document template structure in TEMPLATE_META below.
 */

import { drawPdfParagraph as paragraph, drawPdfBullets as bulletList } from '@/lib/pdfFlowText';
import { ensurePdfSpace, PDF_MARGIN } from '@/lib/pdfPageLayout';
import { drawFormBreather } from '@/lib/pdfFormBreathers';
import { isIncidentReportForm, drawIncidentFirstPageSignoff } from '@/components/documents/incidentPdfSignoff';

function proseSections(doc, y, sections) {
  for (let s = 0; s < sections.length; s++) {
    const sec = sections[s];
    y = ensurePdfSpace(doc, y, 100);
    y = drawSectionHeading(doc, y, `${s + 1}. ${sec.heading}`);
    for (const text of sec.paragraphs || []) y = paragraph(doc, y, text);
    if (sec.bullets) y = bulletList(doc, y, sec.bullets);
    if (sec.fields) {
      y = drawFieldRows(doc, y, sec.fields.map((label) => ({ label })));
    }
    y += 4;
    if (s % 2 === 1 && s < sections.length - 1) y = drawFormBreather(doc, y, Math.floor(s / 2));
  }
  return y;
}

function signatureRows(doc, y, rows) {
  for (const pair of rows) y = drawFieldRows(doc, y, pair.map((label) => ({ label })));
  return y;
}

/** Per-document template structure sourced from the current documents. */
export const TEMPLATE_META = {
  'Participant Handbook': {
    docType: 'Handbook',
    purpose: 'Issued to every participant at intake. Explains our services, the participant\'s rights, our commitments, and how feedback, privacy, safety and advocacy work.',
    signoff: [['Participant / Representative (Signature)', 'Date'], ['Received and explained by (Staff)', 'Handbook version']],
    sections: [
      { heading: 'Welcome', paragraphs: ['Welcome. This handbook explains who we are, the supports we provide, your rights as an NDIS participant, and what you can expect from us at every step of your journey. Please read it together with your Service Agreement and Support Plan. If anything is unclear, ask us and we will explain it in the way that suits you best, including Easy Read, interpreters or an advocate.'] },
      { heading: 'About our services', paragraphs: ['We are a registered NDIS provider delivering person-centred supports, including personal care, community access, domestic assistance, respite, transport and skill-building supports. Every support is planned around your goals, your choices and your pace.'] },
      { heading: 'Your rights', bullets: ['To be treated with courtesy, dignity and respect for your culture, identity and beliefs.', 'To make choices and decisions about your supports, and to say no without losing your other services.', 'To receive safe, quality supports that meet the NDIS Practice Standards.', 'To have your privacy respected and your personal information protected.', 'To complain without fear, and to have your complaint taken seriously and acted on quickly.', 'To involve an advocate, family member or friend in any decision about your supports.', 'To be told, in advance and in writing, if we need to change how your supports are delivered or charged.'] },
      { heading: 'Our commitment to you', paragraphs: ['Our workers follow the NDIS Code of Conduct and the NDIS Practice Standards. They hold current NDIS worker screening clearances, are trained in your support plan, and treat you as the decision-maker in your own life. We listen to you, record what you tell us, and review your supports with you at least every six months or whenever your needs change.'] },
      { heading: 'Getting started with your supports', bullets: ['We complete an intake assessment with you and the people you trust.', 'Together we prepare your Support Plan from the goals in your NDIS plan.', 'You sign a Service Agreement that sets out the supports, costs and both of our responsibilities.', 'We introduce you to your support workers and start your supports.'] },
      { heading: 'Your responsibilities', bullets: ['Treat our workers with respect and provide a safe working environment.', 'Tell us when you cannot attend a shift, following the cancellation terms in your Service Agreement.', 'Tell us when your contact details, medications, health needs or goals change.', 'Let us know if a support is not working for you, so we can fix it together.'] },
      { heading: 'Feedback and complaints', paragraphs: ['We want to hear from you when something goes well and when it does not. You can give feedback or make a complaint at any time by phone, in person, in writing or through a person you trust. We will acknowledge your complaint quickly, keep you informed, and resolve it fairly. Nothing about your services will change because you complained.', 'If you are not comfortable raising a concern with us, or you are unhappy with our response, you can contact the NDIS Quality and Safeguards Commission on 1800 035 544 or at www.ndiscommission.gov.au.'] },
      { heading: 'Your privacy', paragraphs: ['We collect only the information we need to provide your supports safely. It is stored securely, shared only with the people you have consented to, and only for the purpose you agreed to. You can ask to see your records or correct them at any time. You can withdraw your consent to share information whenever you like.'] },
      { heading: 'Safety, incidents and emergencies', paragraphs: ['Your safety comes first. Our workers are trained to prevent and respond to incidents, and serious incidents are reported to the NDIS Commission. You will always be told what happened and what we are doing about it. We keep a current emergency plan for you and practise it regularly, and we act on your risks and safeguards as they change.'] },
      { heading: 'Advocacy and decision-making support', paragraphs: ['You can involve an advocate, nominee or independent supporter at any time. We can help you find an independent advocate if you want one, and we will work with your advocate as if they were you, respecting your authority and consent decisions.'] },
      { heading: 'Changing or ending your supports', paragraphs: ['Either of us can change or end this relationship with reasonable notice, as set out in your Service Agreement. We will help you transition smoothly to another provider or arrangement and will pass on the information you consent to share, so your supports continue without disruption.'] },
      { heading: 'Acknowledgement', paragraphs: ['I acknowledge that I have received this Participant Handbook, that it was explained to me in a way I understood, and that I know how to give feedback, make a complaint and contact the NDIS Commission.'], fields: ['Participant name', 'Handbook version received', 'Signature date'] },
    ],
  },
  'Participant Easy Read Handbook': {
    docType: 'Handbook',
    purpose: 'Easy Read version of the participant handbook, explained simply with an acknowledgement for the participant and the person who explained it.',
    signoff: [['Participant (Signature)', 'Date'], ['Explained by (Staff)', 'Easy Read version']],
    sections: [
      { heading: 'This book is about you', paragraphs: ['This book tells you about our services and your rights. You can ask someone you trust to read it with you. You can ask us to explain anything at any time.'] },
      { heading: 'Your rights', bullets: ['You are treated with respect.', 'You choose your supports. You can say no.', 'You are safe when we support you.', 'Your information stays private.', 'You can complain. We will listen and fix it.', 'You can have an advocate help you.'] },
      { heading: 'What we do', paragraphs: ['We support you with things like personal care, getting out in the community, cooking, cleaning, transport and learning new skills. You tell us what you want. We make a plan with you.'] },
      { heading: 'If something goes wrong', paragraphs: ['Tell us if something goes wrong. We will listen to you and fix the problem. You can also call the NDIS Commission on 1800 035 544.'] },
      { heading: 'Your information', paragraphs: ['We keep your information safe. We only share it with people you say yes to. You can ask to see your information at any time.'] },
    ],
  },
  'Service Agreement': {
    docType: 'Agreement',
    purpose: 'Service agreement between the provider and the participant, made under the NDIS Act 2013. Sets out the supports, costs and each party\'s responsibilities.',
    signoff: [['Participant / Representative (Signature)', 'Date'], ['Provider Representative (Signature)', 'Date']],
    sections: [
      { heading: 'Purpose of this agreement', paragraphs: ['This agreement sets out how the provider and the participant will work together. It is made under the National Disability Insurance Scheme Act 2013 and follows the NDIS Price Guide and NDIS Practice Standards. It explains the supports, the cost, and each party\'s rights and responsibilities.'] },
      { heading: 'Supports to be delivered', bullets: ['Supports are delivered as agreed in the participant\'s Support Plan.', 'Supports, schedules and service locations are recorded in the schedule attached to this agreement.', 'Supports are delivered by trained workers with current clearances.', 'Any change to supports is agreed in writing before it takes effect.'] },
      { heading: 'Fees and payment', paragraphs: ['Fees are charged at the rates in the current NDIS Price Guide. Invoices are issued with the agreed payment terms. NDIS supports are GST free. The participant or their plan manager pays the fees as set out in the schedule.'] },
      { heading: 'Provider responsibilities', bullets: ['Deliver supports safely, respectfully and in line with the NDIS Practice Standards.', 'Keep the participant\'s information private and secure.', 'Give notice before changing scheduled supports or rates.', 'Keep clear records of every support delivered.'] },
      { heading: 'Participant responsibilities', bullets: ['Treat workers with respect and provide a safe place to work.', 'Tell the provider when unable to attend a shift, within the cancellation notice period.', 'Tell the provider when contact details, health needs or goals change.', 'Pay for supports as agreed in this agreement.'] },
      { heading: 'Cancellations and changes', paragraphs: ['Cancellations follow the notice periods in the NDIS Price Guide. The provider gives advance written notice before changing how supports are delivered or charged.'] },
      { heading: 'Feedback, complaints and disputes', paragraphs: ['Feedback and complaints can be made at any time by phone, in person or in writing, or through an advocate. Complaints are acknowledged quickly, kept confidential and resolved fairly. Unresolved concerns can be taken to the NDIS Quality and Safeguards Commission on 1800 035 544.'] },
      { heading: 'Changing or ending this agreement', paragraphs: ['Either party may change or end this agreement with reasonable notice, in line with the notice period in this agreement. The provider will support a smooth transition so supports continue without disruption.'] },
    ],
  },
  'Participant Intake Form': {
    docType: 'Form',
    purpose: 'Completed for every new participant at first contact. Records personal details, NDIS plan information, requested supports, communication needs and health information.',
  },
  'Participant Intake Assessment': {
    docType: 'Form',
    purpose: 'Completed with the participant at intake. Records the referral reason, current supports, goals, risks and the assessment outcome agreed with the participant.',
  },
  'Referral Form': {
    docType: 'Form',
    purpose: 'Completed by the referrer or intake officer. Records referrer and participant details, the reason for referral, requested services and any urgent risks.',
  },
  'Authority to Act as Advocate': {
    docType: 'Form',
    purpose: 'Completed when the participant appoints an advocate or representative. Records the advocate\'s details, the participant\'s consent and the limits of the authority.',
  },
  'Provider Declaration': {
    docType: 'Declaration',
    purpose: 'Formal declaration completed by the provider about service delivery, compliance and the supports provided to the participant.',
    signoff: [['Declared by (Provider Representative)', 'Date']],
  },
  'Participant Support Plan': {
    docType: 'Plan',
    purpose: 'Developed with the participant from their NDIS plan goals. Records the supports to be delivered, schedules, roles and review dates.',
  },
  'Individual Risk Assessment': {
    docType: 'Form',
    purpose: 'Completed at intake and whenever risks change. Records hazards, existing controls, likelihood and consequence ratings, and agreed safeguards.',
  },
  'Home Risk Assessment': {
    docType: 'Form',
    purpose: 'Completed at the participant\'s home before supports start and reviewed at least annually. Records observed hazards, controls and agreed actions.',
  },
  'Personal Emergency Form': {
    docType: 'Plan',
    purpose: 'Personal emergency management plan for the participant. Records evacuation, transport and safe location arrangements, support roles and drill dates.',
  },
  'Progress Notes': {
    docType: 'Record',
    purpose: 'Service delivery record. Record every support shift, observation and progress against goals. File a copy on the participant record after each shift.',
    signoff: [['Recorded by (Staff Signature)', 'Date']],
  },
  'Progress Reports': {
    docType: 'Report',
    purpose: 'Periodic progress report prepared for the participant, plan manager and support coordinator, summarising progress against each goal.',
  },
  'Satisfaction Survey': {
    docType: 'Form',
    purpose: 'Completed by the participant or their representative at least annually. Ratings and feedback feed the provider\'s quality improvement system.',
  },
  'Participant Money Register': {
    docType: 'Register',
    purpose: 'Register of money and property handled on behalf of the participant. Every transaction is recorded, receipted and countersigned.',
    declaration: false,
    signoff: [['Handled by (Staff Signature)', 'Countersigned by']],
  },
  'Incident Reports': {
    docType: 'Report',
    purpose: 'Incident report completed for every incident, near miss or allegation. Provide a factual account and notify management immediately. Serious incidents are reported to the NDIS Commission.',
    signoff: [['Completed by (Staff Signature)', 'Date'], ['Reviewed by (Manager)', 'Date']],
  },
  'Mealtime Management Plan': {
    docType: 'Plan',
    purpose: 'Mealtime support plan prepared with speech pathology input where required. Records texture, risks, support techniques and review dates.',
  },
  'Medication Administration Record': {
    docType: 'Record',
    purpose: 'Medication administration record. Record each dose administered, including the time, dose, and the staff member who administered it.',
    signoff: [['Administered by (Staff Signature)', 'Date']],
  },
  'Medication Consent': {
    docType: 'Consent',
    purpose: 'Consent for medication administration, completed by the participant or their representative before any medication is administered.',
  },
  'SAM Medication Assessment': {
    docType: 'Assessment',
    purpose: 'Self-Assessment of Medication (SAM) tool completed with the participant to assess their medication management capability and support needs.',
  },
  'Participant Exit Form': {
    docType: 'Form',
    purpose: 'Completed when supports end. Records the exit reason, final supports delivered, handover arrangements and feedback from the participant.',
  },
  'Participant Consent Form': {
    docType: 'Consent',
    purpose: 'Records the participant\'s informed consent for supports, services and information sharing, including any limits and how consent can be withdrawn.',
  },
  'Consent to Share Information': {
    docType: 'Consent',
    purpose: 'Records the participant\'s consent to share specified information with named people or organisations, and how the consent can be withdrawn.',
  },
  'Participant Consent for Audits': {
    docType: 'Consent',
    purpose: 'Records the participant\'s consent for their file and records to be reviewed as part of internal or NDIS Commission audits.',
  },
  'Feedback and Complaints': {
    docType: 'Form',
    purpose: 'Record of feedback or a complaint. Every complaint is acknowledged, investigated and resolved, with the outcome communicated to the participant.',
    signoff: [['Received by (Staff Signature)', 'Date']],
  },
  'Investigation Form': {
    docType: 'Form',
    purpose: 'Formal investigation record for incidents or complaints, including findings, evidence, root cause and corrective actions.',
  },
  'Behaviour Support Plan': {
    docType: 'Plan',
    purpose: 'Behaviour support plan developed with the participant and behaviour support practitioners. Records triggers, strategies and safeguards.',
  },
  'Restrictive Practices Record': {
    docType: 'Record',
    purpose: 'Register of regulated restrictive practices used, authorised and reported to the NDIS Commission every month.',
    declaration: false,
    signoff: [['Recorded by (Staff Signature)', 'Authorised by']],
  },
  'Participant File Audit Checklist': {
    docType: 'Checklist',
    purpose: 'Audit checklist verifying the participant file is complete, current and compliant with the provider\'s record-keeping requirements.',
    declaration: false,
    signoff: [['Audited by', 'Date']],
  },
  'Fire Drill Form': {
    docType: 'Record',
    purpose: 'Record of fire drills completed at the participant\'s residence or service location, including timing, participation and follow-up actions.',
    declaration: false,
    signoff: [['Conducted by (Staff Signature)', 'Date']],
  },
  'Medication Evaluation': {
    docType: 'Assessment',
    purpose: 'Evaluation of the participant\'s medication regimen, side effects and administration risks, reviewed with a pharmacist or GP as required.',
  },
  'Medication Record Sheet': {
    docType: 'Record',
    purpose: 'Daily medication record sheet for the participant. Record every dose given, omitted or refused, with the staff member and time.',
    declaration: false,
    signoff: [['Administered by (Staff Signature)', 'Checked by']],
  },
};

export function getTemplateMeta(docType) {
  return TEMPLATE_META[docType] || null;
}

/**
 * Builds a branded A4 template: subscriber header, doc-type badge, guidance
 * panel, template sections, register fields/tables, declaration, signatures
 * and the branded footer. All branding comes from Company Safe.
 */
export async function buildBrandedTemplatePdf({
  title,
  code,
  subtitle = 'ComplianceHR Form',
  docType = 'Form',
  purpose = '',
  sections = [],
  fields = [],
  columns,
  rows = 12,
  declaration = true,
  signoff = [['Participant / Representative (Signature)', 'Date']],
  values = {}, tableValues = [], completedBy = '', completedAt = '', signatureDataUrl = '', signerName = '', review = {},
}) {
  await loadCompanyBranding().catch(() => {});
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: columns ? 'landscape' : 'portrait' });

  const incidentForm = isIncidentReportForm(title);
  let y = drawFormHeader(doc, { title, code, docType, subtitle, completedBy, reserveFirstPageSignoff: incidentForm });
  y = drawFormNotice(doc, y, { purpose: purpose || `Use this form to record information for ${title}.` });
  if (sections.length) y = proseSections(doc, y, sections);
  if (fields.length) y = drawFieldRows(doc, y, fields, values);
  if (columns?.length) y = drawRegisterTable(doc, y, columns, { rows, values: tableValues });
  y = drawReviewSection(doc, y, review);
  if (declaration) y = drawDeclaration(doc, y);
  if (signatureDataUrl?.startsWith('data:image/')) {
    y = ensurePdfSpace(doc, y, 120);
    doc.setDrawColor(124, 58, 237); doc.setLineWidth(0.9);
    doc.roundedRect(PDF_MARGIN, y, 250, 80, 5, 5, 'S');
    doc.addImage(signatureDataUrl, signatureDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG', PDF_MARGIN + 6, y + 7, 238, 66);
    y += 94;
  }
  if (completedBy) {
    y = drawFieldRows(doc, y, [{ label: 'Completed by' }, { label: 'Completed on' }], { 'Completed by': completedBy, 'Completed on': completedAt });
  } else y = signatureRows(doc, y, signoff);

  if (incidentForm) drawIncidentFirstPageSignoff(doc, { name: signerName, date: signatureDataUrl ? completedAt : '', signature: signatureDataUrl });
  drawDocumentFooter(doc, { title, code });
  return doc;
}

export async function downloadBrandedTemplatePdf(options) {
  const doc = await buildBrandedTemplatePdf(options);
  doc.save(`${options.title}.pdf`);
}