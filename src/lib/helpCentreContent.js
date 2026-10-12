// Self-help knowledge base for the Help Centre.
export const HELP_CATEGORIES = ['Getting started', 'Documents & files', 'Automations', 'Finance & NDIS', 'Security & privacy', 'Troubleshooting'];

export const HELP_ARTICLES = [
  {
    title: 'Getting started: roles and what you can see',
    category: 'Getting started',
    tags: 'roles, permissions, access, admin, user',
    body: 'Your role controls which modules appear in the sidebar. Provider Administrator and Compliance Manager see everything; Administration runs day-to-day registers; Support Workers see participants, communications, incidents, risks and training; Participants see their own portal areas.\n\nRoles are set in Users & Permissions Hub by a Provider Administrator. If a module you need is missing, ask an administrator to check your role there.',
  },
  {
    title: 'Uploading and storing files safely',
    category: 'Documents & files',
    tags: 'upload, files, storage, private, attachments',
    body: 'Every upload across the app (documents, manuals, certificates, receipts, quotes, minutes) is stored privately: files can only be opened by signed, time-limited links generated through the app with your permissions.\n\nTo share a stored file, use the Download or Stored copy button on the record - it creates a fresh signed link. Never email files around separately; the record is the source of truth.',
  },
  {
    title: 'What runs automatically (automations and reminders)',
    category: 'Automations',
    tags: 'automation, reminders, schedule, daily, email',
    body: 'The platform runs these for you:\n- NDIS Updates & News: fetched automatically every morning around 7am (Sydney time).\n- Task due reminders: emailed as task due dates approach.\n- Training expiry alerts: emailed before certificates and training lapse.\n- Compliance kit reminders and compliance expiry scans: keep the audit trail current.\n- Shift reminder alerts, details check reminders and follow-up automations run on their schedules.\n\nYou do not need to start anything - just keep dates (due dates, expiries, review dates) accurate on your records.',
  },
  {
    title: 'Exports and audit evidence from every register',
    category: 'Documents & files',
    tags: 'export, csv, pdf, audit, evidence, download',
    body: 'Almost every register has an Export button (CSV spreadsheet) and many have a Print/Download PDF button that produces a branded document with your business details from Company Safe.\n\nFor audits: export the register you need, download the related PDFs (quotes, invoices, minutes, checklists) and attach them to the audit in Compliance & Report Centre.',
  },
  {
    title: 'Recording consents correctly',
    category: 'Security & privacy',
    tags: 'consent, privacy, audit, gdpr, ndis',
    body: 'Consents are recorded on the record where they apply: privacy and audit consent during Intake, audit consent on staff and participant profiles, and consent to share on referral forms.\n\nAlways capture who gave the consent, the date and the time - the forms capture this automatically when you tick and save.',
  },
  {
    title: 'Invoicing and the NDIS price guide',
    category: 'Finance & NDIS',
    tags: 'invoice, quote, price guide, ndis, rates',
    body: 'Rates come from the built-in NDIS price guide library used by the Quote Centre and Invoicing Centre. Quotes generate a branded PDF that is filed automatically to the participant\'s client file when you save.\n\nInvoices are built from approved, completed shifts. Check the participant\'s plan manager and billing details before sending.',
  },
  {
    title: 'Reportable incidents: when the NDIS Commission must be notified',
    category: 'Security & privacy',
    tags: 'incident, reportable, commission, notification, 000',
    body: 'Immediate safety first: call 000 for emergencies, 13HEALTH (13 43 25 84) for medical or medication concerns, and the Poisons Information Line (13 11 26) for exposure.\n\nReportable incidents (serious injury, abuse or neglect, unlawful restraint, unplanned hospital admission and others) must be notified to the NDIS Quality & Safeguards Commission on 1800 035 544 within 24 hours for registered providers. Log the incident in the Incident Clinic, mark it reportable and record the notification in the incident record.',
  },
  {
    title: 'Roster calendar feeds for your phone',
    category: 'Automations',
    tags: 'calendar, ics, feed, phone, subscribe',
    body: 'Rostering generates an ICS calendar feed you can subscribe to from any phone calendar app. Open Rostering, use the calendar sync dialog to copy your personal feed link and add it as a subscribed calendar - your shifts then update automatically.',
  },
  {
    title: 'Statuses cheat sheet',
    category: 'Getting started',
    tags: 'status, badge, colours, meaning',
    body: 'Badges use consistent colours across every module: blue/indigo = open or in progress, green = completed, approved or accepted, amber = pending, due soon or awaiting action, red = overdue, urgent, declined or expired, grey = closed, cancelled or draft.\n\nIf a record shows amber or red, open it - the module guide at the top of the page explains what to do next.',
  },
  {
    title: 'Login problems and password resets',
    category: 'Troubleshooting',
    tags: 'login, password, reset, access, email verification',
    body: 'Use Forgot password on the login screen to receive a reset email. New users receive a verification code by email after registering; enter it on screen to activate your account.\n\nIf your account shows "awaiting administrator approval", a Provider Administrator must approve it in Users & Permissions Hub before records open.',
  },
  {
    title: 'Bulk uploading documents to the vault',
    category: 'Documents & files',
    tags: 'bulk, upload, vault, documents, many files',
    body: 'The Document Vault has a bulk upload tool: select multiple files at once and they are filed into the library together. Afterwards, set review/expiry dates so the reminder automations can watch them.',
  },
  {
    title: 'Visual boards: accessible communication supports',
    category: 'Getting started',
    tags: 'visual, boards, accessibility, routine, communication',
    body: 'Visual Boards builds communication boards, routines, day/date and weather boards for participants with visual, speech or comprehension needs. Add routine steps with images and sign prompts, use the speech pad in-session, and print the board for the shift.',
  },
];