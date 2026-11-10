import { jsPDF } from 'jspdf';
import { drawDocumentFooter } from '@/lib/companyBranding';
import { drawFormHeader, drawFieldRows, drawSectionHeading } from '@/lib/formDocumentStyles';
import { ensurePdfSpace } from '@/lib/pdfPageLayout';
import { drawPdfParagraph as paragraph, drawPdfBullets as bullets } from '@/lib/pdfFlowText';
import { drawManagementSignoff } from '@/components/documents/managementSignoffPdf';

/**
 * High-quality, professionally styled master templates for the signature
 * intake documents: Participant Handbook, Service Agreement, Employment
 * Contract and Position Description. Written as general-purpose templates any
 * business can adopt, with the company branding, numbered clauses and
 * signature blocks of a real compliance document.
 */

const VIOLET = [76, 29, 149];
const MUTED = [100, 116, 139];
const INK = [30, 30, 40];

function startDocument(title, subtitle, code, docType = 'Form') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const y = drawFormHeader(doc, { title, code, subtitle, docType });
  return { doc, y };
}

function guard(doc, y, needed) {
  return ensurePdfSpace(doc, y, needed);
}

function section(doc, y, number, heading, body = {}) {
  y = drawSectionHeading(doc, y, `${number}. ${heading}`);
  for (const text of body.paragraphs || []) y = paragraph(doc, y, text);
  if (body.bullets) y = bullets(doc, y, body.bullets);
  if (body.fields) y = drawFieldRows(doc, y, body.fields.map((label) => ({ label, multiline: /duties|supports|terms|requirements/i.test(label) })));
  return y;
}

function signatures(doc, y, pairs) {
  y = drawSectionHeading(doc, y, 'Authorisation');
  for (const pair of pairs) y = drawFieldRows(doc, y, pair.map((label) => ({ label })));
  return y;
}

// --- Participant Handbook -------------------------------------------------
function buildParticipantHandbook(code) {
  const { doc, y: startY } = startDocument(
    'Participant Handbook',
    'Your rights, our commitments and how we work together',
    code,
    'Handbook',
  );
  let y = startY;

  y = section(doc, y, 1, 'Welcome', {
    paragraphs: [
      'Welcome. This handbook explains who we are, the supports we provide, your rights as an NDIS participant, and what you can expect from us at every step of your journey. Please read it together with your Service Agreement and Support Plan. If anything is unclear, ask us and we will explain it in the way that suits you best, including Easy Read, interpreters or an advocate.',
    ],
  });

  y = section(doc, y, 2, 'About our services', {
    paragraphs: [
      'We are a registered NDIS provider delivering person-centred supports, including personal care, community access, domestic assistance, respite, transport and skill-building supports. Every support is planned around your goals, your choices and your pace.',
    ],
  });

  y = section(doc, y, 3, 'Your rights', {
    bullets: [
      'To be treated with courtesy, dignity and respect for your culture, identity and beliefs.',
      'To make choices and decisions about your supports, and to say no without losing your other services.',
      'To receive safe, quality supports that meet the NDIS Practice Standards.',
      'To have your privacy respected and your personal information protected.',
      'To complain without fear, and to have your complaint taken seriously and acted on quickly.',
      'To involve an advocate, family member or friend in any decision about your supports.',
      'To be told, in advance and in writing, if we need to change how your supports are delivered or charged.',
    ],
  });

  y = section(doc, y, 4, 'Our commitment to you', {
    paragraphs: [
      'Our workers follow the NDIS Code of Conduct and the NDIS Practice Standards. They hold current NDIS worker screening clearances, are trained in your support plan, and treat you as the decision-maker in your own life. We listen to you, record what you tell us, and review your supports with you at least every six months or whenever your needs change.',
    ],
  });

  y = section(doc, y, 5, 'Getting started with your supports', {
    bullets: [
      'We complete an intake assessment with you and the people you trust.',
      'Together we prepare your Support Plan from the goals in your NDIS plan.',
      'You sign a Service Agreement that sets out the supports, costs and both of our responsibilities.',
      'We introduce you to your support workers and start your supports.',
    ],
  });

  y = section(doc, y, 6, 'Your responsibilities', {
    bullets: [
      'Treat our workers with respect and provide a safe working environment.',
      'Tell us when you cannot attend a shift, following the cancellation terms in your Service Agreement.',
      'Tell us when your contact details, medications, health needs or goals change.',
      'Let us know if a support is not working for you, so we can fix it together.',
    ],
  });

  y = section(doc, y, 7, 'Feedback and complaints', {
    paragraphs: [
      'We want to hear from you when something goes well and when it does not. You can give feedback or make a complaint at any time by phone, in person, in writing or through a person you trust. We will acknowledge your complaint quickly, keep you informed, and resolve it fairly. Nothing about your services will change because you complained.',
      'If you are not comfortable raising a concern with us, or you are unhappy with our response, you can contact the NDIS Quality and Safeguards Commission on 1800 035 544 or at www.ndiscommission.gov.au.',
    ],
  });

  y = section(doc, y, 8, 'Your privacy', {
    paragraphs: [
      'We collect only the information we need to provide your supports safely. It is stored securely, shared only with the people you have consented to, and only for the purpose you agreed to. You can ask to see your records or correct them at any time. You can withdraw your consent to share information whenever you like.',
    ],
  });

  y = section(doc, y, 9, 'Safety, incidents and emergencies', {
    paragraphs: [
      'Your safety comes first. Our workers are trained to prevent and respond to incidents, and serious incidents are reported to the NDIS Commission. You will always be told what happened and what we are doing about it. We keep a current emergency plan for you and practise it regularly, and we act on your risks and safeguards as they change.',
    ],
  });

  y = section(doc, y, 10, 'Advocacy and decision-making support', {
    paragraphs: [
      'You can involve an advocate, nominee or independent supporter at any time. We can help you find an independent advocate if you want one, and we will work with your advocate as if they were you, respecting your authority and consent decisions.',
    ],
  });

  y = section(doc, y, 11, 'Changing or ending your supports', {
    paragraphs: [
      'Either of us can change or end this relationship with reasonable notice, as set out in your Service Agreement. We will help you transition smoothly to another provider or arrangement and will pass on the information you consent to share, so your supports continue without disruption.',
    ],
  });

  y = signatures(doc, y, [
    ['Participant / Representative (Signature)', 'Date'],
    ['Received and explained by (Staff)', 'Handbook version'],
  ]);

  y = section(doc, y, 12, 'Acknowledgement', {
    paragraphs: [
      'I acknowledge that I have received this Participant Handbook, that it was explained to me in a way I understood, and that I know how to give feedback, make a complaint and contact the NDIS Commission.',
    ],
    fields: ['Participant name', 'Handbook version received', 'Signature date'],
  });

  y = drawManagementSignoff(doc, y);
  drawDocumentFooter(doc, { title: 'Participant Handbook', code });
  doc.save('Participant Handbook.pdf');
}

// --- Service Agreement ----------------------------------------------------
function buildServiceAgreement(code) {
  const { doc, y: startY } = startDocument(
    'Service Agreement',
    'NDIS service agreement between the provider and the participant',
    code,
    'Agreement',
  );
  let y = startY;

  y = section(doc, y, 1, 'Purpose of this agreement', {
    paragraphs: [
      'This agreement sets out how the provider and the participant will work together. It is made under the National Disability Insurance Scheme Act 2013 and follows the NDIS Price Guide and NDIS Practice Standards. It explains the supports, the cost, and each party\'s rights and responsibilities.',
    ],
  });

  y = section(doc, y, 2, 'The parties', {
    fields: ['Participant name', 'NDIS number', 'Provider legal name and ABN', 'Agreement start date', 'Agreement end date'],
  });

  y = section(doc, y, 3, 'Supports to be provided', {
    paragraphs: [
      'The provider will deliver the supports listed below, delivered by suitably qualified and screened workers, in line with the participant\'s Support Plan and NDIS plan goals.',
    ],
    fields: ['Supports, schedule and service locations'],
  });

  y = section(doc, y, 4, 'Fees and charges', {
    bullets: [
      'Supports are charged at the rates in the current NDIS Pricing Arrangements and Price Limits.',
      'Travel is charged in line with the NDIS Price Guide for the actual time and distance travelled.',
      'The provider will give at least 14 days\' written notice before changing any price or charge.',
    ],
  });

  y = section(doc, y, 5, 'Payment and invoicing', {
    bullets: [
      'Invoices are issued for the supports delivered and payment is due within 14 days.',
      'Payment may be made by the participant, a plan manager or the NDIA, as set out above.',
      'Fees and charges are GST free where the support is GST-free under NDIS rules.',
    ],
  });

  y = section(doc, y, 6, 'Cancellations and changes to bookings', {
    paragraphs: [
      'Cancellations and short-notice changes are handled in line with the NDIS Pricing Arrangements. The provider and participant will discuss changes to the schedule as soon as either of them becomes aware of the need, and changes are recorded in writing.',
    ],
  });

  y = section(doc, y, 7, 'Responsibilities of the provider', {
    bullets: [
      'Provide supports that respect the participant\'s right to dignity, respect and choice.',
      'Deliver supports safely and competently, following the NDIS Practice Standards and Code of Conduct.',
      'Keep the participant\'s information private and only share it with consent.',
      'Listen to feedback and complaints and respond to them promptly and fairly.',
      'Tell the participant in writing if a scheduled support needs to change or be cancelled.',
    ],
  });

  y = section(doc, y, 8, 'Responsibilities of the participant', {
    bullets: [
      'Provide a safe and respectful environment for workers delivering supports.',
      'Give reasonable notice when a support cannot proceed, or pay the cancellation charge that applies.',
      'Tell the provider about changes to personal details, health needs, medications or goals.',
      'Raise concerns early so they can be resolved quickly.',
    ],
  });

  y = section(doc, y, 9, 'Complaints, incidents and safeguarding', {
    paragraphs: [
      'Complaints can be made directly to the provider and, at any time, to the NDIS Quality and Safeguards Commission on 1800 035 544. Incidents affecting the participant are recorded, acted on and, where required, reported to the NDIS Commission. The provider follows child-safe, abuse-prevention and restrictive-practices requirements at all times.',
    ],
  });

  y = section(doc, y, 10, 'Privacy and confidentiality', {
    paragraphs: [
      'Both parties agree to keep personal information confidential, to use it only to deliver these supports, and to handle it in line with the Australian Privacy Principles and the provider\'s privacy policy.',
    ],
  });

  y = section(doc, y, 11, 'Reviewing and ending this agreement', {
    bullets: [
      'This agreement is reviewed with the participant every 12 months, or sooner if needs change.',
      'Either party may end this agreement by giving the other 14 days\' written notice.',
      'Either party may end this agreement immediately if the other seriously breaches it.',
      'On ending, the provider will support a smooth transition of the participant\'s records and supports.',
    ],
  });

  y = signatures(doc, y, [
    ['Participant / Representative (Signature)', 'Date'],
    ['Provider Representative (Signature)', 'Date'],
  ]);

  y = section(doc, y, 12, 'Agreement to the terms above', {
    paragraphs: [
      'By signing below, the participant (or their representative) agrees to the supports, fees and responsibilities set out in this Service Agreement, and confirms they received a copy and had the terms explained in a way they understood.',
    ],
    fields: ['Participant / representative agreement', 'Supports, fees and cancellations confirmed on'],
  });

  y = drawManagementSignoff(doc, y);
  drawDocumentFooter(doc, { title: 'Service Agreement', code });
  doc.save('Service Agreement.pdf');
}

// --- Employment Contract --------------------------------------------------
function buildEmploymentContract(code) {
  const { doc, y: startY } = startDocument(
    'Employment Contract',
    'Employment agreement between the employer and the employee',
    code,
    'Contract',
  );
  let y = startY;

  y = section(doc, y, 1, 'The parties', {
    paragraphs: [
      'The employer agrees to employ the employee, and the employee agrees to be employed, on the terms of this contract. This contract takes effect from the commencement date and continues until ended by either party in line with clause 9.',
    ],
    fields: ['Employee full name', 'Employer legal name', 'Commencement date'],
  });

  y = section(doc, y, 2, 'Position and duties', {
    paragraphs: [
      'The employee is employed in the position below, and must perform the duties in the attached Position Description, together with other duties reasonably directed by the employer that are within the employee\'s skills and training.',
    ],
    fields: ['Position and classification', 'Employment type (full time / part time / casual)'],
  });

  y = section(doc, y, 3, 'Hours of work', {
    paragraphs: [
      'Hours of work are set by roster or as agreed with the employee. The employee may be required to work reasonable additional hours in line with the applicable award and the National Employment Standards.',
    ],
    fields: ['Hours of work'],
  });

  y = section(doc, y, 4, 'Remuneration', {
    bullets: [
      'The employee is paid at least the rate, and the allowances, set by the applicable award or enterprise agreement for their classification.',
      'Wages are paid fortnightly into the employee\'s nominated bank account.',
      'Employer superannuation contributions are paid to the employee\'s nominated superannuation fund as required by law.',
    ],
    fields: ['Hourly rate and allowances'],
  });

  y = section(doc, y, 5, 'Probationary period', {
    paragraphs: [
      'The first six months of employment are a probationary period, during which the employee\'s performance, conduct and suitability are assessed against the Position Description.',
    ],
  });

  y = section(doc, y, 6, 'Screening, checks and mandatory requirements', {
    bullets: [
      'The employee must hold and keep current an NDIS worker screening clearance before starting worker-facing duties.',
      'The employee must hold any other checks their role requires, such as a working with children check, first aid and CPR certificates.',
      'The employee must complete the NDIS Worker Orientation Module and all mandatory training by the due dates set by the employer.',
    ],
  });

  y = section(doc, y, 7, 'Policies, procedures and conduct', {
    paragraphs: [
      'The employee must follow the employer\'s policies, procedures and Staff Handbook, the NDIS Code of Conduct, and all applicable legislation, including work health and safety, child protection and privacy laws. Breaches may result in disciplinary action, up to and including termination of employment.',
    ],
  });

  y = section(doc, y, 8, 'Confidentiality and privacy', {
    paragraphs: [
      'The employee must keep all participant, business and staff information confidential during and after employment, and use it only for the purpose of their duties. This obligation continues after employment ends.',
    ],
  });

  y = section(doc, y, 9, 'Ending employment', {
    bullets: [
      'The employee must give the employer the notice in the applicable award, in writing.',
      'The employer gives the employee notice in line with the National Employment Standards, or payment instead of notice.',
      'Either party may end employment immediately for serious misconduct, following a fair process.',
      'On the final day, the employee returns all property, records and access, and final entitlements are paid.',
    ],
  });

  y = signatures(doc, y, [
    ['Employee (Signature)', 'Date'],
    ['Employer Representative (Signature)', 'Date'],
  ]);

  y = section(doc, y, 10, 'Acceptance of employment terms', {
    paragraphs: [
      'I accept employment on the terms above, confirm I have read the attached Position Description and Staff Handbook, and consent to the employer collecting and using my personal information for employment purposes.',
    ],
    fields: ['Employee signature and date', 'Employer signature and date'],
  });

  y = drawManagementSignoff(doc, y);
  drawDocumentFooter(doc, { title: 'Employment Contract', code });
  doc.save('Employment Contract.pdf');
}

// --- Position Description -------------------------------------------------
function buildPositionDescription(code) {
  const { doc, y: startY } = startDocument(
    'Position Description',
    'Duties, responsibilities and selection criteria for the position',
    code,
    'Position Description',
  );
  let y = startY;

  y = drawFieldRows(doc, y, ['Position title', 'Department / service', 'Reports to', 'Award and classification', 'Employment type', 'Date approved'].map((label) => ({ label })));

  y = section(doc, y, 1, 'Purpose of the position', {
    paragraphs: [
      'The purpose of this position is to deliver safe, high-quality, person-centred supports that help participants achieve their goals, and to uphold the provider\'s obligations under the NDIS Practice Standards, the NDIS Code of Conduct and all applicable laws.',
    ],
  });

  y = section(doc, y, 2, 'Key responsibilities and duties', {
    bullets: [
      'Deliver supports in line with each participant\'s Support Plan, risks and safeguards.',
      'Keep accurate, objective and timely records of every shift, including progress notes.',
      'Follow medication, mealtime and behaviour support plans exactly as written and trained.',
      'Report incidents, hazards, near misses and concerns immediately through the proper channels.',
      'Keep mandatory training, screening checks and certificates current.',
      'Treat participants, families and colleagues with dignity, respect and cultural sensitivity.',
      'Protect participant privacy and confidentiality at all times.',
      'Contribute to a safe workplace and follow all work health and safety procedures.',
    ],
    fields: ['Key responsibilities and duties'],
  });

  y = section(doc, y, 3, 'Selection criteria', {
    bullets: [
      'Demonstrated values aligned with person-centred, rights-based disability support.',
      'Current NDIS worker screening clearance (or ability to obtain before starting).',
      'Relevant qualifications, or willingness to work towards them.',
      'Sound written and verbal communication and record-keeping skills.',
      'Ability to work flexibly across shifts as rostered.',
    ],
    fields: ['Qualifications and experience required'],
  });

  y = section(doc, y, 4, 'Key working relationships', {
    paragraphs: [
      'This position works closely with participants and their families and advocates, support coordination and plan management contacts, allied health practitioners, rostering and compliance staff, and the wider support team.',
    ],
  });

  y = signatures(doc, y, [
    ['Approved by (Manager)', 'Date'],
    ['Acknowledged by (Employee)', 'Date'],
  ]);

  y = section(doc, y, 5, 'Approval and acknowledgement', {
    paragraphs: [
      'This position description is approved by the employer and acknowledged by the employee. It is reviewed with the employee at least annually and whenever the duties of the position materially change.',
    ],
    fields: ['Approved by and date'],
  });

  y = drawManagementSignoff(doc, y);
  drawDocumentFooter(doc, { title: 'Position Description', code });
  doc.save('Position Description.pdf');
}

export const SPECIAL_DOCUMENT_BUILDERS = {
  'Participant Handbook': buildParticipantHandbook,
  'Service Agreement': buildServiceAgreement,
  'Employment Contract': buildEmploymentContract,
  'Position Description': buildPositionDescription,
};