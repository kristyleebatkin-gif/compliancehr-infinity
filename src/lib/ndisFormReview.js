// Review references checked 18 October 2026. These are alignment aids, not certification.
export const NDIS_FORM_REFERENCES = [
  { label: 'Participant rights, privacy and informed choice', url: 'https://www.ndiscommission.gov.au/rules-and-standards/ndis-practice-standards/core-module-rights-and-responsibilities' },
  { label: 'Assessment, support planning and service agreements', url: 'https://www.ndiscommission.gov.au/rules-and-standards/ndis-practice-standards/core-module-provision-supports' },
  { label: 'Records, workforce, incidents and complaints', url: 'https://www.ndiscommission.gov.au/rules-and-standards/ndis-practice-standards/core-module-provider-governance-and-operational' },
  { label: 'Medication, mealtimes and safe environments', url: 'https://www.ndiscommission.gov.au/rules-and-standards/ndis-practice-standards/core-module-provision-supports-environment' },
  { label: 'Current NDIS Code of Conduct', url: 'https://www.ndiscommission.gov.au/rules-and-standards/ndis-code-conduct' },
  { label: 'Reportable incident categories and notification timeframes', url: 'https://www.ndiscommission.gov.au/rules-and-standards/reportable-incidents-and-incident-management/reportable-incidents' },
];
const note = (label) => ({ label, multiline: true, lines: 4, optional: true });
export const NDIS_PARTICIPANT_REVIEW_FIELDS = {
  'Participant Support Plan': [
    note('Participant involvement in developing and reviewing this plan'), note('Decision-making support and consent for planning'),
    note('Dependence on supports for daily living'), note('Health and safety impact if supports are disrupted'), note('Agreed backup supports during disruption'),
    note('Preventative health supports'), note('Preferred workers and personal care preferences'),
    { label: 'Next support plan review date', help: 'Review at least annually, earlier when needs or circumstances change.' },
    note('How the participant and workers access this plan'), note('Consent for sharing the plan with the support network'),
    note('Risk-control effectiveness review'),
  ],
  'Service Agreement': [
    note('Emergency and disaster continuity arrangements'), note('How agreement terms were explained accessibly'),
    { label: 'Participant received a copy of the signed agreement', type: 'single', options: ['Yes', 'No', 'Participant chose not to sign'] },
    note('Reason a signed copy was not provided'), note('Agreed notice period for ending supports'),
  ],
  'Consent to Share Information': [note('How information is stored and protected'), note('How to access or correct records'), note('When disclosure may be required or authorised by law')],
  'Mealtime Management Plan': [
    { label: 'Qualified health practitioner name' }, { label: 'Practitioner profession / credentials' }, { label: 'Nutrition assessment date' }, { label: 'Swallowing assessment date' },
    note('Participant involvement and informed consent'), note('Food texture prescribed by practitioner'), note('Fluid consistency prescribed by practitioner'),
    note('Food amounts and pacing'), note('Fluid amounts and pacing'), note('Utensils and equipment'), note('Oral care instructions'), note('Required alertness before meals'),
    note('Participant food preferences'), note('Prohibited foods and allergy controls'), note('Meal preparation and texture checking'), note('Meal identification and storage'),
    note('Choking response and escalation instructions'), { label: 'Next practitioner review date', help: 'At least annually, or earlier as advised or when needs change.' }, note('Worker training and plan access'),
  ],
  'Incident Reports': [
    { label: 'Date provider became aware' }, { label: 'Time provider became aware' }, { label: 'Reportable incident decision maker' },
    { label: 'NDIS Commission notification required', type: 'single', options: ['Yes', 'No', 'Under assessment'] },
    { label: 'Commission notification due date' }, { label: 'Commission notification due time' }, { label: 'Commission notification date' }, { label: 'Commission notification time' }, { label: 'Commission reference' },
    { label: 'Five-business-day follow-up due date' }, note('Participant support and involvement after incident'), note('Actions to prevent recurrence'),
  ],
  'Feedback and Complaints': [note('Advocacy and communication assistance offered'), note('Acknowledgement provided to complainant'), note('Outcome communicated to complainant'), note('External review options explained'), note('Service improvements arising from complaint')],
  'Individual Risk Assessment': [note('Participant involvement and dignity-of-risk choices'), note('Dependence on services and disruption risks'), note('Effectiveness of controls and review triggers')],
};