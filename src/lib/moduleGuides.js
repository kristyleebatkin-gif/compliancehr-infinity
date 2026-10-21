// One user guide per module: the recommended order of documents and process steps.
// Keyed by the first segment of the page path.
export const moduleGuides = {
  '/dashboard': {
    title: 'Dashboard',
    purpose: 'Your daily starting point. Everything urgent, overdue and happening today is surfaced here first.',
    steps: [
      'Check the attention panel for overdue compliance, incidents and risks first.',
      'Review today and this week in the roster, tasks and due reminders.',
      'Act on notifications from the bell icon (required documents, alerts).',
      'Use quick-start tiles to jump straight into the busiest modules.',
    ],
  },
  '/intake': {
    title: 'Intake Centre',
    purpose: 'Bring a new participant or employee into the service in a safe, auditable order.',
    steps: [
      'Open Participant Intake or Employee Intake and complete every section of the form.',
      'Attach intake documents: consents, identifications, screening checks and agreements.',
      'Record privacy and audit consents, referees and emergency contacts.',
      'Set status to Ready for Review and complete the service-fit / eligibility decision.',
      'On approval, convert the case to a live profile and log any outstanding actions.',
    ],
  },
  '/documents': {
    title: 'Document Vault',
    purpose: 'The single home for every policy, form and file, with expiry tracking.',
    steps: [
      'Upload new documents into the right library (company, staff or participant).',
      'Complete fillable forms from the forms library and attach them to profiles.',
      'Set review/expiry dates so reminders fire before documents lapse.',
      'Export the vault list or individual files for audits.',
    ],
  },
  '/company-safe': {
    title: 'Company Safe',
    purpose: 'Your business identity, registrations and branding used across every document.',
    steps: [
      'Enter business identity: name, ABN, NDIS registration number and contacts.',
      'Upload registrations, insurance certificates and compliance documents.',
      'Set the mission, vision, values and goals used in email footers and PDFs.',
      'Keep banking and payment terms current so quotes and invoices are correct.',
    ],
  },
  '/our-employees': {
    title: 'Staff Profiles',
    purpose: 'Every employee record, from onboarding through exit.',
    steps: [
      'Convert approved Employee Intake cases into staff profiles.',
      'Verify checks: WWCC, NDIS Worker Screening, First Aid and driver licence.',
      'Complete details, banking, super and emergency contacts; set app access role.',
      'Record training completions, surveys and details-check dates.',
      'Keep the change log current; archive (never delete) on exit.',
    ],
  },
  '/our-participants': {
    title: 'Participant Profiles',
    purpose: 'The living record of each participant and their supports.',
    steps: [
      'Convert approved Participant Intake cases into participant profiles.',
      'Record diagnosis, medication, triggers, risks and control measures.',
      'Build the support team and rostered shifts.',
      'Track goals, progress notes and 10-weekly copies to families.',
      'Review the file against the participant file matrix each quarter.',
    ],
  },
  '/visual-boards': {
    title: 'Visual Boards',
    purpose: 'Accessible communication boards for participants with visual or speech needs.',
    steps: [
      'Choose the participant and board type (communication, routine, weather, day/date).',
      'Build routine steps with images and sign prompts.',
      'Use the speech pad and translator for live conversations.',
      'Print or display the board during shifts.',
    ],
  },
  '/communications': {
    title: 'Communication Centre',
    purpose: 'Every conversation, note and message in one auditable diary.',
    steps: [
      'Record a shift note after every shift, grouped by goal and support type.',
      'Log employee and participant diary entries; they route automatically to Incidents, Risk, Feedback and Tasks.',
      'Send professional emails or bulk messages from the central log.',
      'Follow up pending communications in the inbox and task board.',
    ],
  },
  '/incidents': {
    title: 'Incident Clinic',
    purpose: 'Report, respond to and close out every incident with the mandatory escalation path.',
    steps: [
      'Make people safe first: call 000 for emergencies, 13HEALTH for medical/medication, Poisons 13 11 26 for exposure.',
      'Log the incident within 24 hours using the incident form.',
      'Complete the response and notify the NDIS Commission if reportable.',
      'Investigate, add corrective actions and track them to completion.',
      'Close with sign-off and review trends for prevention.',
    ],
  },
  '/risks': {
    title: 'Risk Reporting',
    purpose: 'Identify, assess and treat risks, hazards and near misses before they cause harm.',
    steps: [
      'Identify the risk, hazard or near miss and log it with a description.',
      'Assess likelihood and consequence to set the rating on the risk matrix.',
      'Add control measures (eliminate, isolate, minimise, train).',
      'Schedule the assessment cycle and record review dates.',
      'Monitor until the risk is closed; export the register for audits.',
    ],
  },
  '/compliance': {
    title: 'Compliance & Report Centre',
    purpose: 'Everything an NDIS audit will ask for, in one place.',
    steps: [
      'Work through the master NDIS compliance checklist and keep answers current.',
      'Keep the staff and participant file matrices complete.',
      'Schedule internal audits and NDIS audit windows.',
      'Upload evidence to the vault and link it to the checklist.',
      'Run the compliance expiry scan and action anything due.',
    ],
  },
  '/training': {
    title: 'Training Centre',
    purpose: 'Assign, deliver and track training from induction to the training ladder.',
    steps: [
      'Assign a training template matched to the staff role.',
      'Complete LMS modules, quizzes and competency checklists.',
      'Upload certificates and set expiry dates so alerts fire in time.',
      'Review the training ladder and audit reports monthly.',
    ],
  },
  '/certificates': {
    title: 'Certificates',
    purpose: 'One register of every certificate and its expiry.',
    steps: [
      'Upload the certificate (stored privately).',
      'Record the holder, type and expiry date.',
      'Renew before the expiry alert, then replace the file.',
      'Export the register for audits.',
    ],
  },
  '/assets': {
    title: 'Asset Management',
    purpose: 'Track every company asset, its maintenance and disposal.',
    steps: [
      'Register the asset with purchase details and photos.',
      'Attach the receipt (converted to PDF automatically in Receipt Hub).',
      'Set the maintenance schedule and compliance review dates.',
      'Record service history; dispose with a signed disposal record.',
    ],
  },
  '/rostering': {
    title: 'Rostering',
    purpose: 'Match the right support worker to every shift, with approvals and payroll.',
    steps: [
      'Keep staff availability and patterns current.',
      'Create shifts from templates or patterns and confirm with staff.',
      'Fill open shifts and manage approvals.',
      'Export payroll and the ICS feed once shifts are approved.',
    ],
  },
  '/invoicing': {
    title: 'Invoicing Centre',
    purpose: 'Turn approved shifts into NDIS-compliant invoices.',
    steps: [
      'Confirm shifts are approved and completed.',
      'Build an invoice from shifts using the NDIS price guide rates.',
      'Check participant and plan-manager billing details.',
      'Send to the payer and track payment against terms.',
    ],
  },
  '/goals': {
    title: 'Goal Progress',
    purpose: 'Track every participant goal from plan to outcome.',
    steps: [
      'Record NDIS plan goals and the supports tied to each.',
      'Add progress notes from shift notes as they occur.',
      'Complete 3-monthly progress reports.',
      'Send 10-weekly copies to families and review outcomes.',
    ],
  },
  '/emergency-response': {
    title: 'Emergency Response',
    purpose: 'Be drill-ready: contacts, documents, drills and live warnings.',
    steps: [
      'Keep emergency contacts and after-hours numbers current.',
      'Store emergency plans and evacuation maps in the documents library.',
      'Run drills each period and log them in the Emergency Drill Register.',
      'Check safety checks and live weather/warnings before events.',
    ],
  },
  '/meetings': {
    title: 'Meeting Centre',
    purpose: 'Run meetings that end in actions, not minutes alone.',
    steps: [
      'Schedule the meeting with agenda and attendees.',
      'Record minutes during the meeting.',
      'Convert decisions into tasks with owners and due dates.',
      'Review previous minutes and outstanding actions before the next meeting.',
    ],
  },
  '/data-control': {
    title: 'Data Control Panel',
    purpose: 'Privacy obligations: activity, access and breach response.',
    steps: [
      'Review the activity log of record access.',
      'Keep the data asset register current.',
      'Assess and log any suspected breach within 30 days (Notifiable Data Breaches scheme).',
      'Review who can access what in Users & Permissions.',
    ],
  },
  '/users': {
    title: 'Users & Permissions Hub',
    purpose: 'Who can see and do what, across every module.',
    steps: [
      'Invite new users and approve pending access requests.',
      'Assign the app role that matches their job.',
      'Review the permissions matrix quarterly.',
      'Archive departed users rather than deleting them.',
    ],
  },
  '/receipts': {
    title: 'Receipt Hub',
    purpose: 'Every expense captured, converted and claimable.',
    steps: [
      'Scan or upload the receipt; it converts to PDF automatically (stored privately).',
      'Categorise the expense and add the claim reason.',
      'Link receipts to assets or programs where relevant.',
      'Export the register for BAS and finance review.',
    ],
  },
  '/equipment-manuals': {
    title: 'Equipment & MSDS',
    purpose: 'Equipment manuals and the chemical MSDS register, side by side in one module.',
    steps: [
      'Equipment: add each piece of equipment as a manual record, with instructions, safety notes and maintenance schedule.',
      'Equipment: upload the manufacturer manual (stored privately) or link it online, and set the review date.',
      'MSDS: search the built-in library of the 50 most common chemicals first.',
      'MSDS: add any new product as soon as it is received, with its SDS link and first aid measures.',
      'Keep review dates and SDS details current, then export the registers for audits.',
    ],
  },
  '/community-council': {
    title: 'Community & Council',
    purpose: 'Know your local council, services and community programs.',
    steps: [
      'Look up the local council for each service location.',
      'Save key community services and contacts.',
      'Log engagement with community programs.',
    ],
  },
  '/referrals': {
    title: 'Referral & Support',
    purpose: 'Connect people to the right service, with a clear paper trail.',
    steps: [
      'Identify the need and check crisis information first.',
      'Find local services and match to the person.',
      'Complete the referral form and send it with consent.',
      'Log the referral and follow up on the outcome.',
    ],
  },
  '/ndis-portal': {
    title: 'NDIS Provider Portal',
    purpose: 'Your registration details, obligations and deadlines in one view.',
    steps: [
      'Record your registration details and renewal dates.',
      'Track NDIS deadlines in the deadline register.',
      'Keep legal requirements and practice standards current.',
    ],
  },
  '/ndis-updates': {
    title: 'NDIS Updates & News',
    purpose: 'Daily automatic updates from the NDIS Commission and NDIA.',
    steps: [
      'Scan the newest items each morning; items are fetched daily at 7am automatically.',
      'Use search and type filters to find pricing, compliance or safeguarding changes.',
      'Open items at source and brief staff at meetings on anything that changes practice.',
      'Watch the "New" badges for items from the last 14 days.',
    ],
  },
  '/quotes': {
    title: 'Quote Centre',
    purpose: 'Branded NDIS quotes, filed to the client automatically.',
    steps: [
      'Capture the client and participant details and funding type.',
      'Build the quote from NDIS price guide line items.',
      'Save: a branded PDF is generated and filed to the participant\'s client file automatically.',
      'Email the quote and track its status to accepted.',
      'Convert accepted quotes into service agreements.',
    ],
  },
  '/programs': {
    title: 'Program Design Centre',
    purpose: 'Design programs and events, advertise them and invite attendees.',
    steps: [
      'Plan the program or event with dates, venue, cost and organiser.',
      'View the calendar to balance the schedule.',
      'Build an advertisement (AI image) and prepare the invite list.',
      'Invite users by email and track attendance.',
      'Mark outcomes when the event completes.',
    ],
  },
  '/key-contacts': {
    title: 'Key Personnel Contacts',
    purpose: 'Every contact you might need, in an emergency or otherwise.',
    steps: [
      'Record each contact with organisation, role and hours.',
      'Flag emergency and medical contacts clearly.',
      'Keep after-hours numbers current and review quarterly.',
    ],
  },
  '/volunteering-placements': {
    title: 'Volunteering & Student Placement',
    purpose: 'Onboard volunteers and students safely and track their placement.',
    steps: [
      'Record the volunteer or student and their placement details.',
      'Collect checks, agreements and induction documents.',
      'Assign a supervisor and log hours.',
      'Review outcomes and provide feedback at the end of placement.',
    ],
  },
  '/tasks': {
    title: 'Task Dashboard',
    purpose: 'Everything that must be done, owned by someone, done on time.',
    steps: [
      'Capture the task with a due date and responsible staff.',
      'Share it to the to-do board so it is visible.',
      'Complete it, recording time taken and completion details.',
      'Review the progress chart and leaderboard to keep on track.',
      'Export completed tasks for audits.',
    ],
  },
  '/feedback': {
    title: 'Feedback & Surveys',
    purpose: 'Hear from participants, families and staff, and prove you acted.',
    steps: [
      'Log every feedback item, complaint or survey response in the register.',
      'Acknowledge within one business day.',
      'Investigate and record the response and outcome.',
      'Feed themes into Quality & Improvement and close the loop with the person.',
    ],
  },
  '/quality': {
    title: 'Quality & Improvement',
    purpose: 'A living continuous improvement system for the whole service.',
    steps: [
      'Log improvement ideas and audit findings as quality items.',
      'Prioritise by impact and risk.',
      'Plan actions with owners and due dates.',
      'Implement, measure the result and record it in the Continuous Improvement Register.',
      'Report progress in management meetings.',
    ],
  },
};