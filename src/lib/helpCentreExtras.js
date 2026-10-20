// Help Centre extras: common problems, assistant abilities, self-checks and support resources.
export const COMMON_PROBLEMS = [
  {
    problem: 'A module opens then bounces me straight back to the Dashboard',
    tag: 'Access',
    fix: [
      'Your account role does not have that module yet — access is per role, and it is a settings fix.',
      'Ask your administrator to open the Users & Permissions Hub and set your role there.',
      'Administrators (the platform admin account) now always have access to every module.',
    ],
  },
  {
    problem: 'A document in the vault will not open',
    tag: 'Documents',
    fix: [
      'Private document links are time-limited for security — close it and click View again for a fresh link.',
      'Check the document has an actual file attached (some register rows are metadata only).',
      'Still stuck? Ask an administrator to re-upload the file to the record.',
    ],
  },
  {
    problem: 'The page says my account is awaiting administrator approval',
    tag: 'Access',
    fix: [
      'New accounts wait in a pending queue until an administrator approves them.',
      'An administrator approves (or declines) requests in the Users & Permissions Hub.',
      'Once approved, sign out and back in to refresh your access.',
    ],
  },
  {
    problem: 'The verification or password reset email never arrived',
    tag: 'Sign-in',
    fix: [
      'Check your spam or junk folder first — it is the most common place they land.',
      'On the Register page you can resend the verification code; sign-in issues use Forgot password.',
      'Still nothing after two tries? Raise a Technical support request so it can be checked.',
    ],
  },
  {
    problem: 'An export comes out empty or is missing rows',
    tag: 'Exports',
    fix: [
      'Exports capture exactly what the register on screen shows — clear filters and search, then export again.',
      'Some registers are role-restricted, so you only ever see (and export) your own records.',
      'Use the module\'s own Export button rather than the browser print for complete rows.',
    ],
  },
  {
    problem: 'No reminder email for a task, meeting or expiry',
    tag: 'Reminders',
    fix: [
      'Task and expiry reminders run each morning around 7am Sydney time — they are daily, not instant.',
      'Tasks need a due date and a responsible person to be chased; meetings email attendees 24 and 12 hours ahead.',
      'Check the notification bell for alerts that were raised in-app instead of by email.',
    ],
  },
  {
    problem: 'My changes will not save',
    tag: 'Data',
    fix: [
      'Look for a required field marked with an asterisk — saving is blocked until it is filled.',
      'Finalised or approved records are read-only; the status badge tells you which.',
      'Some fields are restricted to management roles by design — ask an administrator if it should be open.',
    ],
  },
  {
    problem: 'Search is not finding a record I know exists',
    tag: 'Search',
    fix: [
      'Search matches titles and text — try fewer, exact words rather than a whole sentence.',
      'Use the module\'s own filter and status dropdowns, which search every record in that module.',
      'Global search covers what your role can see; records outside your access never appear.',
    ],
  },
  {
    problem: 'Payroll totals look wrong',
    tag: 'Payroll',
    fix: [
      'Re-sync staff details from the payroll tab — rates and bank details are pulled from staff profiles.',
      'Check the shifts in the period are marked Completed, with breaks and travel recorded.',
      'Payslips can be regenerated for the period once the underlying details are corrected.',
    ],
  },
  {
    problem: 'A page is stuck loading or the spinner will not stop',
    tag: 'Performance',
    fix: [
      'Refresh the page first — a stale session is the most common cause.',
      'Check the System Health tab: if a service is down it is already visible there.',
      'Try a different browser or device; if it persists, raise a Technical support request with the module name.',
    ],
  },
];

export const SELF_CHECKS = [
  'Open the System Health tab — if a service is down it is shown there before you report it.',
  'Check your role in My Profile; many "missing" features are simply not part of your role yet.',
  'Read the guide for the module at the top of the page — most questions are answered there.',
  'Check the notification bell: alerts, expiry warnings and system messages land there.',
  'Try a different browser or device, or a hard refresh, before assuming something is broken.',
  'Ask the AI troubleshooter, naming the module and exactly what you clicked.',
];

export const ASSISTANT_ABILITIES = [
  {
    key: 'compliance',
    name: 'Compliance Agent',
    tagline: 'Your audit-readiness analyst',
    icon: 'bot',
    tone: 'from-indigo-600 to-blue-500',
    can: [
      'Answers status questions across incidents, risks and investigations',
      'Summarises training, certificates, policies and NDIS deadlines',
      'Explains audit readiness: what is overdue, expiring or missing',
      'Reads internal audits, improvement actions, participant reviews and complaints',
      'Reads KPIs, assets, maintenance and the audit log to answer "how are we tracking?"',
      'Drafts summaries you can paste into board or audit reports',
    ],
    examples: [
      '"Which certificates expire in the next 30 days?"',
      '"Summarise all open high-severity incidents."',
      '"What compliance deadlines are due this quarter?"',
      '"Where are our biggest audit gaps right now?"',
    ],
  },
  {
    key: 'personal',
    name: 'Personal Assistant (Harper)',
    tagline: 'Guidance for whatever you are working on',
    icon: 'sparkles',
    tone: 'from-purple-600 to-violet-500',
    can: [
      'Sees the module, page and your role, and tailors every answer to it',
      'Gives short, numbered next steps for the task at hand',
      'Suggests useful checks: evidence, consent, review dates, signatures, uploads',
      'Teaches you how to fix the most common problems, step by step',
      'Summarises your open tasks and notifications when you ask "what should I do next?"',
      'Explains any module in plain language when you are new to it',
    ],
    examples: [
      '"I am stuck on this shift record — what do I do next?"',
      '"A module bounced me back to the dashboard. Why?"',
      '"What are my open tasks this week?"',
      '"How do I record a complaint properly?"',
    ],
  },
  {
    key: 'receipts',
    name: 'Receipt Finder',
    tagline: 'Finds any receipt, fast',
    icon: 'receipt',
    tone: 'from-emerald-600 to-teal-500',
    can: [
      'Searches receipts by supplier or business name',
      'Filters by employee or participant the receipt relates to',
      'Finds receipts by date, amount or payment reference',
      'Narrows by status, such as unreconciled or claimed',
    ],
    examples: [
      '"Find last month\'s receipts from Bunnings."',
      '"Which receipts over $200 are unreconciled?"',
      '"Show receipts for participant Sarah M in September."',
    ],
  },
  {
    key: 'roster',
    name: 'Roster Assistant',
    tagline: 'A second pair of eyes on the roster',
    icon: 'calendar',
    tone: 'from-sky-600 to-cyan-500',
    can: [
      'Finds coverage gaps and shifts with no staff assigned',
      'Flags double bookings for the same person',
      'Spots unmatched participant shift details',
      'Checks for missing shift instructions or notes',
      'Explains how to copy the roster forward for repeating shifts',
    ],
    examples: [
      '"Which shifts next week have no one assigned?"',
      '"Any double bookings this fortnight?"',
      '"Which shifts are missing instructions?"',
    ],
  },
];

export const SUPPORT_RESOURCES = [
  { label: 'User Guides library', detail: 'Every module, every feature, downloadable PDFs', path: '/user-guides' },
  { label: 'AI Troubleshooter', detail: 'Describe the problem, get a diagnosis', path: '/help' },
  { label: 'Users & Permissions Hub', detail: 'Roles and module access (administrators)', path: '/users' },
  { label: 'System Health', detail: 'Live status of integrations and services', path: '/help' },
];

export const SUPPORT_MODULES = [
  'Dashboard', 'Intake Centre', 'Document Vault', 'Company Safe', 'Staff Profiles', 'Participant Profiles',
  'Visual Boards', 'Communication Centre', 'Incident Clinic', 'Risk Reporting', 'Compliance & Report Centre',
  'Training Centre', 'Certificates', 'Asset Management', 'Rostering', 'Invoicing Centre', 'Goal Progress',
  'Emergency Response', 'Meeting Centre', 'Data Control Panel', 'Users & Permissions Hub', 'Receipt Hub',
  'Equipment & MSDS', 'Referral & Support', 'NDIS Provider Portal', 'NDIS Updates & News', 'Quote Centre',
  'Program Design Centre', 'Key Personnel Contacts', 'Volunteering & Student Placement', 'Task Dashboard',
  'Feedback & Surveys', 'Quality & Improvement', 'Help Centre', 'Payroll', 'CRM & Leads', 'Procurement', 'AI Assistant',
];

export const TECH_TOPICS = [
  'Something is broken or not working',
  "I can't access something",
  'Help with data, reports or exports',
  'Training or guidance needed',
  'Suggest a feature',
  'Something else',
];