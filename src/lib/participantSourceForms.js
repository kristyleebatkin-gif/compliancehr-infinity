// Reconstructed from the original intake, assessment and referral DOCX files.
// Sensitive identity information is voluntary, not an NDIS entry condition.
const text = (label, extra = {}) => ({ label, ...extra });
const note = (label, extra = {}) => text(label, { multiline: true, lines: 4, ...extra });
const choice = (label, options, extra = {}) => text(label, { type: 'single', options, ...extra });
const yes = (label, extra = {}) => choice(label, ['Yes', 'No', 'Not applicable'], extra);
const many = (label, options, extra = {}) => choice(label, options, { type: 'multiple', ...extra });
const contact = (prefix, optional = true) => ['name', 'relationship', 'phone', 'email'].map((part) => text(`${prefix} ${part}`, { optional }));
const identity = [text('Participant full name', { required: true }), text('Participant ID / NDIS number'), text('Date of birth'), text('Preferred name', { optional: true }), text('Gender (optional)', { optional: true }), text('Phone'), text('Mobile'), text('Email'), text('Residential address'), text('State'), text('Postcode'), text('Postal address (if different)', { optional: true })];
const funding = [text('NDIS plan start date'), text('NDIS plan end date'), choice('Funding type (Plan Managed / NDIA Managed / Self-Managed / Other)', ['Plan Managed', 'NDIA Managed', 'Self-Managed', 'Other']), text('Other funding details', { optional: true }), ...['name', 'phone', 'email'].map((part) => text(`Invoice contact ${part}`, { optional: true }))];
const communication = [text('Languages spoken'), text('Preferred language'), yes('Interpreter required (Yes/No)'), many('Preferred communication method', ['Face to face', 'Phone call', 'Text message', 'Email', 'Letter', 'Visual / AAC', 'Contact my advocate / representative', 'Other']), note('Communication and accessibility adjustments', { optional: true })];
const culture = [text('Country of birth', { optional: true }), choice('Aboriginal or Torres Strait Islander status', ['Aboriginal', 'Torres Strait Islander', 'Both', 'Neither', 'Prefer not to say'], { optional: true }), choice('Refugee or asylum seeker status', ['Refugee', 'Asylum seeker', 'Neither', 'Prefer not to say'], { optional: true }), text('Religion (optional)', { optional: true }), note('Cultural preferences relevant to my supports', { optional: true })];
const transition = [yes('Transition from another provider (Yes/No)'), ...['name', 'phone', 'email', 'representative name', 'representative phone', 'representative email'].map((part) => text(`Previous provider ${part}`, { optional: true })), note('Reasons for the transition', { optional: true })];
const health = [note('Disability and support needs'), note('Current medical conditions', { optional: true }), note('Current medications', { optional: true }), note('Known allergies and adverse reactions', { optional: true })];
const collection = [yes('Privacy and information collection explained in an accessible format'), choice('Consent to collect and use information for assessment and support delivery', ['Consent given', 'Consent declined', 'Decision pending']), note('Consent limitations or conditions', { optional: true }), note('People or organisations authorised to receive information', { optional: true }), text('Consent review date', { optional: true }), text('Person completing form name'), text('Person completing form relationship'), text('Person completing form phone'), text('Person completing form email')];
const services = ['Community Access', 'Assistance with Personal Activities', 'Self-Care', 'Life Skills Development', 'House Cleaning', 'Gardening and Yard Maintenance', 'Innovative Community Participation', 'Supported Independent Living', 'Other'];
export const PARTICIPANT_SOURCE_FORMS = {
  'Participant Intake Form': [
    ...identity, ...contact('Alternative contact'), ...contact('Emergency contact 1'), ...contact('Emergency contact 2'),
    ...funding, ...transition, ...contact('Representative'), text('Representative authority / evidence', { optional: true }),
    ...communication, ...culture, ...['name', 'phone', 'email', 'address'].map((part) => text(`GP ${part}`, { optional: true })),
    note('Other current service providers', { optional: true }), note('Services received from other providers', { optional: true }), note('Other provider contact details', { optional: true }),
    many('Requested services', services), note('Requested supports'), note('Additional service information', { optional: true }), ...health,
    yes('NDIS plan copy received'), ...collection,
  ],
  'Referral Form': [
    ...identity, ...contact('Alternative contact 1'), ...contact('Alternative contact 2'), ...funding, text('NDIS plan review date', { optional: true }),
    ...culture, text('Sex (optional)', { optional: true }), text('Gender identity (optional)', { optional: true }), text('Sexual orientation (optional)', { optional: true }), text('Intersex status (optional)', { optional: true }), ...communication,
    ...health, yes('Medication prompting required'), yes('Medication assistance required'), yes('Current medication list attached'), ...contact('Representative'),
    many('Requested service types (select all that apply)', services), note('Requested service details'), choice('Referral urgency', ['Routine', 'Urgent', 'Immediate safety concern']), note('Immediate safety concerns', { optional: true }),
    text('Referrer name'), text('Referrer phone'), text('Referrer email'), text('Referrer relationship'), text('Referrer organisation', { optional: true }), text('Referrer position title', { optional: true }), text('Referral date'), note('Reasons for referral'), ...collection,
  ],
  'Participant Intake Assessment': [
    ...identity, ...contact('Support person'), text('Initial assessment date'), text('Assessor name'), text('Assessor position title'),
    many('Primary support needs', ['Daily Living Support', 'Community Participation', 'Behaviour Support', 'Therapeutic Services', 'Respite Care', 'Other']),
    note('Short-term goals (6–12 months)'), note('Long-term goals (1–3 years)'), yes('Goals aligned with available services'), note('Goal alignment comments', { optional: true }),
    many('Participant expectations', ['Daily support', 'Skill development', 'Increased independence', 'Enhanced social interaction', 'Other']), note('Participant expectation comments', { optional: true }),
    many('Existing support services', ['NDIS-funded supports', 'Informal supports', 'Other community services', 'None']), note('Existing support service details', { optional: true }), choice('Satisfaction with current supports', ['Satisfied', 'Neutral', 'Dissatisfied', 'Not applicable']), note('Current support satisfaction comments', { optional: true }),
    note('Primary carer role', { optional: true }), choice('Family / carer involvement', ['High', 'Moderate', 'Low', 'Not applicable']), yes('Current support network adequate'), note('Support network comments', { optional: true }),
    choice('Behavioural concerns', ['None', 'Mild', 'Moderate', 'Severe']), note('Behavioural concern details', { optional: true }), yes('Current behaviour support plan'), note('Effective behaviour support strategies', { optional: true }), choice('Risk to staff or other participants', ['Low', 'Moderate', 'High']), note('Risk assessment details'),
    yes('Complex health needs identified'), note('Complex health need details', { optional: true }), ...health,
    many('Relevant risk history', ['Aggression', 'Self-harm', 'Substance use', 'Leaving without agreed support', 'None']), note('Relevant risk history details', { optional: true }),
    choice('Decision-making support needed', ['No additional support', 'Some assistance', 'Significant support']), note('Decision-making supports used', { optional: true }), many('Communication modes', ['Verbal', 'Non-verbal', 'AAC / other support']), note('Communication support details', { optional: true }),
    choice('Motivation to engage', ['High', 'Moderate', 'Low']), note('Engagement comments', { optional: true }), choice('Home environment suitability', ['Suitable', 'Minor adjustments needed', 'Major adjustments needed']), note('Home adjustment details', { optional: true }), choice('Transport assistance', ['Independent', 'Assistance required']), note('Transport support details', { optional: true }),
    ...['Eligibility criteria met', 'Service availability confirmed', 'Needs and goals match service scope', 'Support beyond service scope required', 'Required supports can be delivered safely', 'Risks manageable with available staffing'].map((label) => yes(label)),
    note('Eligibility assessment comments'), yes('Accept participant into service'), note('Reasons if service is declined', { optional: true }), choice('Recommended next steps', ['Proceed with service planning', 'Refer to another provider', 'Further assessment', 'Other']), note('Next-step details', { optional: true }), yes('Waiting list placement'), text('Waiting list date', { optional: true }),
    note('Participant involvement in this assessment'), note('Service-disruption risks and agreed backup supports'), text('Assessment review date'),
  ],
};