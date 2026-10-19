// Extensive user guide content — Part 2 (modules N–Z of the directory).
// Consumed by the User Guides module and the branded guide PDF generator.
export const GUIDES_PART_2 = {
  receipts: {
    tagline: 'Every expense captured, converted, claimable',
    purpose: 'The Receipt Hub captures every business expense end to end: scan or upload a receipt, automatic conversion to PDF (image scans become multi-page PDFs), categorisation, claim reasons, reconciliation and register exports. Receipts can link to assets, purchase orders and programs, so finance, BAS time and audits all trace from spend to purpose.',
    features: [
      { name: 'Receipt scanner', detail: 'Scan or upload a receipt; AI reads the details for review before filing.' },
      { name: 'Scan-to-PDF conversion', detail: 'Image-based receipts convert automatically to multi-page PDFs.' },
      { name: 'Categorisation', detail: 'Expense categories and claim reasons recorded per receipt.' },
      { name: 'Reconciliation', detail: 'Match receipts against purchase orders and bank statements.' },
      { name: 'Asset and PO linking', detail: 'Link receipts to assets, purchase orders and programs.' },
      { name: 'Reimbursement tracking', detail: 'Staff reimbursement claims tracked to payment.' },
      { name: 'Register exports', detail: 'Branded receipt register export for BAS and audit.' },
    ],
    steps: [
      'Scan or upload the receipt — it converts to PDF automatically (stored privately).',
      'Review the extracted details, then categorise the expense and add the claim reason.',
      'Link the receipt to an asset, purchase order or program where relevant.',
      'Reconcile against purchase orders and statements each period.',
      'Track reimbursements through to payment.',
      'Export the register for BAS and finance review.',
    ],
    tools: [
      { name: 'Receipt scanner', detail: 'AI extraction of supplier, date, total and GST.' },
      { name: 'Scan-to-PDF', detail: 'Multi-page PDF conversion for image scans.' },
      { name: 'Reconciliation view', detail: 'Receipts against orders, side by side.' },
    ],
    tips: [
      'Scan receipts the week they occur — paper fades and so does memory.',
      'Always add the claim reason; "miscellaneous" receipts are the ones auditors question.',
    ],
  },

  'equipment-manuals': {
    tagline: 'Manuals and MSDS, side by side',
    purpose: 'The Equipment & MSDS module pairs an equipment manual library with a chemical safety library. Every piece of equipment has a manual record with operating instructions, maintenance schedule and safety notes, plus its manufacturer manual on file. The MSDS side ships with a built-in library of the 50 most common workplace chemicals and accepts any new product with its SDS details.',
    features: [
      { name: 'Equipment manual records', detail: 'Manual title, equipment, category, manufacturer, model, version and review date.' },
      { name: 'Manual file storage', detail: 'Manufacturer manuals upload (stored privately) or link online.' },
      { name: 'Operating instructions', detail: 'On-screen instructions, safety notes and maintenance schedule per item.' },
      { name: 'Built-in MSDS library', detail: '50 common chemicals with GHS hazard class, first aid measures and storage notes.' },
      { name: 'Custom chemical entries', detail: 'Add any new product with CAS number, SDS link and hazard data.' },
      { name: 'Category filters', detail: 'Seven categories from cleaning to gases for fast lookup.' },
      { name: 'Review dates', detail: 'Manual and SDS review dates feed reminders and the expiry scan.' },
      { name: 'Register exports', detail: 'Branded chemical register and manual list exports.' },
    ],
    steps: [
      'Add each piece of equipment as a manual record with instructions, safety notes and maintenance schedule.',
      'Upload the manufacturer manual or link it online, and set the review date.',
      'For chemicals, search the built-in library of 50 common chemicals first.',
      'Add any new product as soon as it is received, with its SDS link and first aid measures.',
      'Keep review dates and SDS details current.',
      'Export the registers for audits and site inductions.',
    ],
    tools: [
      { name: 'Equipment manual PDF', detail: 'Branded manual summaries for site folders.' },
      { name: 'Chemical register PDF', detail: 'Branded MSDS register export.' },
      { name: 'Built-in chemical library', detail: 'Pre-loaded hazard data for 50 common chemicals.' },
    ],
    tips: [
      'Log the chemical when it arrives, not when it is first used — workers need the SDS before the first spray.',
      'Link manuals to their assets in Asset Management so maintenance and instructions stay together.',
    ],
  },

  'community-council': {
    tagline: 'Know your local area',
    purpose: 'The Community & Council module gives workers live knowledge of the communities participants live in: local council lookups, community programs, local service directories and engagement logging. It supports community access planning and connecting participants to mainstream services.',
    features: [
      { name: 'Council lookup', detail: 'Live lookup of the local council for any service location.' },
      { name: 'Community programs', detail: 'Local programs and activities recorded and searchable.' },
      { name: 'Local services directory', detail: 'Saved community services with contacts.' },
      { name: 'Engagement logging', detail: 'Record engagement with community programs over time.' },
      { name: 'Location support', detail: 'Coordinates and location data for outings planning.' },
    ],
    steps: [
      'Look up the local council for each service location.',
      'Save key community services and contacts to the directory.',
      'Log engagement with community programs as participants take part.',
      'Use the directory when planning community access outings.',
    ],
    tools: [
      { name: 'Council lookup engine', detail: 'Live council data for any Australian address.' },
      { name: 'Services directory', detail: 'Your saved local service list.' },
    ],
    tips: [
      'Save services after first contact, not before — a directory of unverified services erodes trust.',
      'Log engagement so plan reviews can show community participation outcomes.',
    ],
  },

  'community-referral': {
    tagline: 'Connect people to the right service',
    purpose: 'The Referral & Support module connects participants and employees to the right external services with a complete paper trail: a searchable national resource library, crisis information always on screen, local services, referral forms, referral PDFs and a referral log that tracks outcomes.',
    features: [
      { name: 'National resource library', detail: 'Searchable directory of national support services by category.' },
      { name: 'Crisis information', detail: 'Lifeline, Beyond Blue, 000 and crisis lines always visible.' },
      { name: 'Local services', detail: 'Your saved local service directory.' },
      { name: 'Referral form', detail: 'Structured referral with consent, reason and urgency.' },
      { name: 'Referral send dialog', detail: 'Send referrals with consent attached.' },
      { name: 'Referral PDF', detail: 'Branded referral document for the receiving service.' },
      { name: 'Referral log', detail: 'Every referral with status and outcome tracking.' },
    ],
    steps: [
      'Identify the need and check crisis information first when safety is involved.',
      'Find local and national services matched to the person and need.',
      'Complete the referral form and confirm consent to share.',
      'Send the referral and file the branded PDF to the record.',
      'Log the referral and follow up on the outcome.',
    ],
    tools: [
      { name: 'Resource library', detail: 'National service database with category search.' },
      { name: 'Crisis panel', detail: 'Immediate crisis numbers, always on screen.' },
      { name: 'Referral PDF generator', detail: 'Branded referral documents.' },
    ],
    tips: [
      'Consent first, refer second — the form records who consented and when.',
      'Close the loop: a referral without a logged outcome is an incomplete record.',
    ],
  },

  'ndis-provider': {
    tagline: 'Registration and obligations in one view',
    purpose: 'The NDIS Provider Portal holds your provider registration details, obligations and deadline tracking: registration numbers and renewals, the NDIS deadline register, legal requirements and practice standards references. It is the module that answers "when does our registration expire?" instantly.',
    features: [
      { name: 'Registration details', detail: 'Provider registration number, registration groups and renewal dates.' },
      { name: 'NDIS deadline register', detail: 'All NDIS-related deadlines tracked with due dates.' },
      { name: 'Legal requirements register', detail: 'Legal and practice-standard obligations recorded and reviewed.' },
      { name: 'Provider record', detail: 'Provider details linked to the Company Safe identity.' },
      { name: 'Renewal tracking', detail: 'Registration renewal dates feed reminders and the expiry scan.' },
    ],
    steps: [
      'Record your registration details and renewal dates.',
      'Track every NDIS deadline in the deadline register.',
      'Keep legal requirements and practice standards current with review dates.',
      'Review the portal monthly ahead of registration milestones.',
    ],
    tools: [
      { name: 'Deadline register', detail: 'Every NDIS date, one list.' },
      { name: 'Legal register', detail: 'Obligations with review cycles.' },
    ],
    tips: [
      'Set renewal reminders at least six months out — re-registration timelines are long.',
      'Cross-check the deadline register against the compliance calendar each quarter.',
    ],
  },

  'ndis-news': {
    tagline: 'Fresh NDIS news, every morning',
    purpose: 'NDIS Updates & News fetches the latest news from the NDIS Commission and NDIA automatically every morning at 7am, with search, type filters, source links and "new" badges. Pricing changes, safeguarding updates and consultation papers land in the app before they land in your inbox.',
    features: [
      { name: 'Automated daily fetch', detail: 'News items fetched automatically at 7am daily.' },
      { name: 'Search and filters', detail: 'Find pricing, compliance or safeguarding changes fast.' },
      { name: 'Type categorisation', detail: 'Items grouped by type — pricing, practice, consultation, alerts.' },
      { name: 'Source links', detail: 'Open items at the official source.' },
      { name: 'New badges', detail: 'Items from the last 14 days are flagged.' },
      { name: 'Deadline register link', detail: 'Actionable items can feed the NDIS deadline register.' },
    ],
    steps: [
      'Scan the newest items each morning — the fetch runs automatically.',
      'Use search and type filters to find changes relevant to your services.',
      'Open items at source for the full detail.',
      'Brief staff at meetings on anything that changes practice.',
      'Watch the "new" badges to keep up without re-reading everything.',
    ],
    tools: [
      { name: 'NDIS update list', detail: 'Chronological, filterable news feed.' },
      { name: 'Daily sync workflow', detail: 'Automatic 7am fetch and filing.' },
    ],
    tips: [
      'Make the morning scan a named role\u2019s job — news modules only work when someone owns them.',
      'Pricing changes belong in your invoicing review within the week they are published.',
    ],
  },

  quotes: {
    tagline: 'Branded quotes, filed automatically',
    purpose: 'The Quote Centre produces branded NDIS quotes with a live preview, builds them from price guide line items, files the PDF to the client automatically on save, tracks status from Draft to Accepted, and provides win-rate and expiring-soon analytics. Accepted quotes convert into service agreements and flow toward invoicing.',
    features: [
      { name: 'Quote builder', detail: 'Line items from the NDIS price guide with automatic totals and validity dates.' },
      { name: 'Live branded preview', detail: 'See the exact branded quote as you build it.' },
      { name: 'Auto-filing on save', detail: 'The PDF generates and files to the participant\u2019s client file automatically.' },
      { name: 'Status tracking', detail: 'Draft, Sent, Accepted, Declined and Expired with sent-at and sent-to records.' },
      { name: 'Duplicate and re-issue', detail: 'Duplicate expiring quotes and re-issue in seconds.' },
      { name: 'Win-rate analytics', detail: 'Acceptance rates and expiring-soon dashboards.' },
      { name: 'Terms from Company Safe', detail: 'Quote terms and validity days draw from business settings.' },
    ],
    steps: [
      'Capture the client and participant details and the biller type.',
      'Build the quote from NDIS price guide line items.',
      'Save: a branded PDF is generated and filed to the client file automatically.',
      'Email the quote and track its status to accepted or declined.',
      'Watch expiring-soon analytics and re-issue or follow up before validity lapses.',
      'Convert accepted quotes into service agreements.',
    ],
    tools: [
      { name: 'Quote preview', detail: 'Exact rendered quote, live.' },
      { name: 'Quote archive', detail: 'Every issued quote filed and searchable.' },
      { name: 'Win-rate dashboard', detail: 'Acceptance and expiry analytics.' },
    ],
    tips: [
      'The quote is filed the moment you save — check the preview before saving, not after.',
      'Re-issue expiring quotes rather than letting them lapse; an expired quote has to be rebuilt.',
    ],
  },

  programs: {
    tagline: 'Design, advertise, invite',
    purpose: 'The Program Design Centre plans programs and events end to end: program and event records, an event calendar, an AI-powered advertisement builder, branded ad PDFs, invite emails with tracking and outcome recording. Programs connect to participants and goals so community participation is evidenced.',
    features: [
      { name: 'Program and event records', detail: 'Dates, venue, cost, organiser and capacity for every program.' },
      { name: 'Event calendar', detail: 'Calendar view balancing the schedule across weeks.' },
      { name: 'AI ad builder', detail: 'Generate promotional images and copy for events.' },
      { name: 'Branded ad PDF', detail: 'Professional advertisement PDFs with business branding.' },
      { name: 'Invite dialog', detail: 'Email invitations to participants and staff with tracking.' },
      { name: 'Attendance tracking', detail: 'Record attendance and outcomes on completion.' },
      { name: 'Survey collection', detail: 'Post-event surveys link to the Feedback module.' },
    ],
    steps: [
      'Plan the program or event with dates, venue, cost and organiser.',
      'View the calendar to balance the schedule and avoid clashes.',
      'Build the advertisement with AI and download the branded PDF.',
      'Prepare the invite list and send invitations by email.',
      'Track attendance and record outcomes when the event completes.',
      'Collect feedback through the linked survey.',
    ],
    tools: [
      { name: 'Event ad builder', detail: 'AI imagery and copy generation.' },
      { name: 'Invite dialog', detail: 'Tracked email invitations.' },
      { name: 'Event calendar', detail: 'Whole-of-schedule visibility.' },
    ],
    tips: [
      'Generate the ad early — promotion needs lead time the calendar view will show you.',
      'Record outcomes on the same day the event ends; attendance data feeds plan reviews.',
    ],
  },

  'key-contacts': {
    tagline: 'Every contact, one dial away',
    purpose: 'Key Personnel Contacts holds every contact the organisation might need — staff, clinicians, suppliers, emergency and after-hours numbers — with delegated authority records. It is deliberately available to every role, because the contact you need at 9pm is rarely the one you planned for.',
    features: [
      { name: 'Contact records', detail: 'Name, organisation, role, phone, email and availability hours.' },
      { name: 'Emergency flagging', detail: 'Emergency and medical contacts flagged for instant recognition.' },
      { name: 'After-hours numbers', detail: 'Dedicated after-hours contacts for every critical service.' },
      { name: 'Delegated authority register', detail: 'Who is authorised to approve what, recorded.' },
      { name: 'Quick dial links', detail: 'Numbers link to the emergency quick dial.' },
    ],
    steps: [
      'Record each contact with organisation, role and availability hours.',
      'Flag emergency and medical contacts clearly.',
      'Keep after-hours numbers current and review quarterly.',
      'Record delegated authority so approvals are unambiguous.',
    ],
    tools: [
      { name: 'Contact directory', detail: 'Filterable, searchable contact list.' },
      { name: 'Delegated authority register', detail: 'Approval authority, recorded and auditable.' },
    ],
    tips: [
      'Quarterly review is the rule: a stale after-hours number is worse than none, because it feels reliable.',
      'Flag every GP and pharmacy for each participant location — medical contacts are used weekly.',
    ],
  },

  'volunteering-placements': {
    tagline: 'Safe onboarding for volunteers and students',
    purpose: 'Volunteering & Student Placement onboards volunteers and students safely and tracks their placement from interest to completion: interest register, checks and agreements, supervision, hours logging, training and end-of-placement reviews.',
    features: [
      { name: 'Volunteer and student records', detail: 'Placement details, role, supervisor and dates.' },
      { name: 'Interest register', detail: 'Volunteer and student interest captured before onboarding.' },
      { name: 'Checks and documents', detail: 'Screening checks, agreements and induction documents collected.' },
      { name: 'Training records', detail: 'Volunteer training assignments and completion tracking.' },
      { name: 'Hours logging', detail: 'Placement hours recorded and totalled.' },
      { name: 'End-of-placement review', detail: 'Outcome review and feedback at completion.' },
    ],
    steps: [
      'Record the volunteer or student and their placement details.',
      'Collect checks, agreements and induction documents before first shift.',
      'Assign a supervisor and log hours as they accrue.',
      'Assign volunteer training and track completion.',
      'Review outcomes and provide feedback at the end of the placement.',
    ],
    tools: [
      { name: 'Volunteer form', detail: 'Structured onboarding form.' },
      { name: 'Volunteer detail view', detail: 'Placement, documents, training and hours in one record.' },
    ],
    tips: [
      'Volunteers need the same screening evidence as staff before contact with participants — the module enforces the same order.',
      'Log hours weekly; reconstructing them at the end of placement never adds up.',
    ],
  },

  analytics: {
    tagline: 'The whole business, in numbers',
    purpose: 'Business Analytics turns platform data into decisions: business-wide KPIs, service trends, financial performance, rostering utilisation, compliance readiness and growth dashboards. It reads live from every module, so the numbers are always current — no spreadsheets, no month-end scramble.',
    features: [
      { name: 'KPI dashboards', detail: 'Headline metrics across service delivery, finance, compliance and people.' },
      { name: 'Service trends', detail: 'Shift volumes, service mix and utilisation over time.' },
      { name: 'Financial view', detail: 'Invoiced, received and outstanding trends.' },
      { name: 'Compliance analytics', detail: 'Readiness scores and overdue trends by module.' },
      { name: 'Growth dashboards', detail: 'Lead pipeline, conversion and quote win-rates for growth decisions.' },
      { name: 'Live data', detail: 'Aggregations run live against module data — always current.' },
    ],
    steps: [
      'Open the hub weekly and review the headline KPIs first.',
      'Drill into service trends to plan rostering capacity.',
      'Check financial trends against payment terms and chase outliers.',
      'Use compliance analytics to direct audit preparation effort.',
      'Review growth dashboards when planning marketing and intake targets.',
    ],
    tools: [
      { name: 'KPI cards', detail: 'Headline metrics with trend indicators.' },
      { name: 'Trend charts', detail: 'Time-series views per business area.' },
      { name: 'Growth dashboards', detail: 'CRM and quote analytics for business development.' },
    ],
    tips: [
      'Analytics is a weekly habit, not an annual report — trends only help if you catch them early.',
      'A KPI without an action owner is trivia: pair every review with a task in the Task Dashboard.',
    ],
  },

  'human-resources': {
    tagline: 'The complete HR record',
    purpose: 'The HR Hub manages the employee lifecycle beyond onboarding: leave requests and approvals, performance reviews and appraisals, HR registers and workforce records. It connects to Staff Profiles so reviews, leave and records live alongside the employment evidence.',
    features: [
      { name: 'Leave requests', detail: 'Leave applications with type, dates, coverage and approve/decline decisions.' },
      { name: 'Leave register', detail: 'All leave history per employee, exportable.' },
      { name: 'Performance reviews', detail: 'Scheduled reviews with ratings, goals and outcomes.' },
      { name: 'Appraisal records', detail: 'Appraisal history with reviewer sign-off.' },
      { name: 'HR registers', detail: 'Human Resource Register and archived employee register.' },
      { name: 'Workforce reporting', detail: 'Headcount, leave trends and review completion.' },
    ],
    steps: [
      'Receive and decide leave requests with coverage arranged before approving.',
      'Schedule performance reviews and record outcomes with reviewer sign-off.',
      'Keep the HR register current as employment details change.',
      'Use workforce reporting to plan reviews and manage leave patterns.',
    ],
    tools: [
      { name: 'Leave register', detail: 'Complete leave history and balances view.' },
      { name: 'Review schedule', detail: 'Review dates with overdue tracking.' },
      { name: 'HR register exports', detail: 'Branded HR data exports.' },
    ],
    tips: [
      'Decide leave with coverage, not just availability — rostering inherits your approval.',
      'Overdue reviews are a compliance finding in most audits; the schedule view exists to prevent that.',
    ],
  },

  crm: {
    tagline: 'Leads to clients, tracked properly',
    purpose: 'The CRM & Leads module tracks every prospective client from first contact to conversion: a lead pipeline with stages, sources and values, follow-up scheduling, conversion tracking and owner assignment. It links to the Quote Centre so proposals and pipeline live in the same funnel.',
    features: [
      { name: 'Lead pipeline', detail: 'New, Contacted, Proposal Sent, Negotiation, Won and Lost stages.' },
      { name: 'Source tracking', detail: 'Website, referral, plan manager, social and event sources.' },
      { name: 'Estimated value', detail: 'Deal value recorded for pipeline forecasting.' },
      { name: 'Follow-up dates', detail: 'Scheduled follow-ups with overdue visibility.' },
      { name: 'Owner assignment', detail: 'Each lead has a named owner.' },
      { name: 'Conversion tracking', detail: 'Won/lost rates and conversion value analytics.' },
      { name: 'Quote linkage', detail: 'Proposals connect to the Quote Centre.' },
    ],
    steps: [
      'Capture every enquiry as a lead with source, service interest and estimated value.',
      'Move leads through the pipeline as contact happens — stages are the record.',
      'Set follow-up dates and never let a lead go quiet without one.',
      'Send proposals from the Quote Centre and link them to the lead.',
      'Record won/lost with reasons; the reasons become your marketing intelligence.',
    ],
    tools: [
      { name: 'Pipeline view', detail: 'Stage-by-stage funnel of all leads.' },
      { name: 'Follow-up panel', detail: 'Overdue and upcoming follow-ups.' },
      { name: 'Conversion analytics', detail: 'Win rates by source and stage.' },
    ],
    tips: [
      'A lead without a follow-up date is a lead you have already lost.',
      'Log the lost reason — it is the cheapest market research you will ever collect.',
    ],
  },

  procurement: {
    tagline: 'Suppliers, orders, stock',
    purpose: 'The Procurement module manages supplier relationships and purchasing: supplier records, purchase orders from draft to received, receipt reconciliation through the Receipt Hub, receipts-to-asset filing and stock tracking. Every order traces from request to asset or consumable.',
    features: [
      { name: 'Supplier records', detail: 'Contacts, ABN, categories, website and active status.' },
      { name: 'Purchase orders', detail: 'PO lifecycle: Draft, Submitted, Approved, Received, Cancelled.' },
      { name: 'Approval workflow', detail: 'Approved-by records on every order.' },
      { name: 'Receipt reconciliation', detail: 'Receipts link to POs for three-way checking.' },
      { name: 'Receipts-to-assets', detail: 'Equipment purchases file to the Asset Register automatically.' },
      { name: 'Stock tracking', detail: 'Consumables and stock levels recorded.' },
      { name: 'Export reports', detail: 'PO and supplier register exports.' },
    ],
    steps: [
      'Register suppliers with full contact and ABN details.',
      'Raise purchase orders and route them for approval.',
      'On delivery, record receipt and link the invoice/receipt.',
      'File equipment purchases to the Asset Register.',
      'Track consumable stock and reorder before run-outs.',
      'Review supplier performance annually.',
    ],
    tools: [
      { name: 'PO register', detail: 'All orders with status and approval records.' },
      { name: 'Supplier directory', detail: 'Category-filtered supplier list.' },
      { name: 'Receipt linking', detail: 'Three-way trace: order, receipt, asset.' },
    ],
    tips: [
      'No PO, no payment — the approval workflow exists to protect the ABN holder, use it.',
      'Link the receipt the day it arrives; reconciliation is trivial when it is fresh.',
    ],
  },

  projects: {
    tagline: 'Business projects, visible and on track',
    purpose: 'The Projects Hub runs business improvement and growth projects with kanban-style status, milestones, owners, priorities and progress tracking. It is where strategy becomes tasks: each project holds its milestones, and progress rolls up for management review.',
    features: [
      { name: 'Project records', detail: 'Name, description, owner, status, priority and due date.' },
      { name: 'Status pipeline', detail: 'Planning, Active, On Hold and Complete with progress percentage.' },
      { name: 'Milestones', detail: 'Milestone lists per project for staged delivery.' },
      { name: 'Progress tracking', detail: 'Percent-complete with visual indicators.' },
      { name: 'Owner accountability', detail: 'Named owner per project.' },
      { name: 'Kanban board', detail: 'Status board view of all projects.' },
    ],
    steps: [
      'Register the project with a clear description, owner and due date.',
      'Break it into milestones and record them in order.',
      'Update status and progress as work proceeds.',
      'Move stalled projects to On Hold deliberately, with a reason.',
      'Review all projects at management meetings from the board view.',
    ],
    tools: [
      { name: 'Project board', detail: 'Kanban-style status view.' },
      { name: 'Milestone tracking', detail: 'Staged delivery per project.' },
      { name: 'Progress indicators', detail: 'Percent-complete visuals.' },
    ],
    tips: [
      'A project without milestones has no finish line — always define them at creation.',
      'Update progress weekly in the management meeting; stale percentages mislead decisions.',
    ],
  },

  tasks: {
    tagline: 'Everything that must be done',
    purpose: 'The Task Dashboard is the platform\u2019s to-do system: tasks with due dates and responsible staff, a shared board, completion records with time taken, due-date reminder emails, progress charts and a completion leaderboard. Tasks come from everywhere — meeting actions, follow-ups, compliance work — and land here in one list.',
    features: [
      { name: 'Task records', detail: 'Title, module, due date, responsible staff and how-to-complete guidance.' },
      { name: 'To-do board', detail: 'Shared board view so tasks are visible to the team.' },
      { name: 'Completion records', detail: 'Completed date, completed by and time taken recorded.' },
      { name: 'Due-date reminders', detail: 'Automated reminder emails to responsible staff.' },
      { name: 'Progress chart', detail: 'Completion trends over time.' },
      { name: 'Leaderboard', detail: 'Completion counts by staff member for engagement.' },
      { name: 'Task send dialog', detail: 'Assign tasks with email notification.' },
      { name: 'Task certificate PDF', detail: 'Completion certificates for significant tasks.' },
    ],
    steps: [
      'Capture the task with a due date, responsible staff and how-to-complete details.',
      'Share it to the board so the team can see it.',
      'Complete it, recording time taken and completion details.',
      'Respond to reminder emails before due dates pass.',
      'Review the progress chart and leaderboard to keep momentum.',
      'Export completed tasks for audits.',
    ],
    tools: [
      { name: 'Task dashboard', detail: 'Summary counts and quick filters.' },
      { name: 'Progress chart', detail: 'Completion trend visualisation.' },
      { name: 'Reminder workflow', detail: 'Automated due-date emails.' },
    ],
    tips: [
      'Write "how to complete" when you assign — it halves the follow-up questions.',
      'The leaderboard is motivation, not surveillance; use it in team meetings that way.',
    ],
  },

  feedback: {
    tagline: 'Listen, act, prove it',
    purpose: 'The Feedback & Surveys module captures the voice of participants, families and staff: a feedback and complaint register, complaint routing to investigations, branded survey campaigns with survey PDFs, acknowledgement tracking and outcome recording that closes the loop.',
    features: [
      { name: 'Feedback register', detail: 'Every feedback item, complaint and survey response in one register.' },
      { name: 'Complaint routing', detail: 'Complaints route to investigations and quality items.' },
      { name: 'Survey builder', detail: 'Branded survey PDFs with custom questions.' },
      { name: 'Survey register', detail: 'Survey campaigns with response tracking.' },
      { name: 'Detail dialog', detail: 'Full feedback record with response and outcome.' },
      { name: 'Acknowledgement tracking', detail: 'One-business-day acknowledgement evidence.' },
      { name: 'Theme reporting', detail: 'Feed themes into Quality & Improvement.' },
    ],
    steps: [
      'Log every feedback item, complaint or survey response in the register.',
      'Acknowledge within one business day — the log is the evidence.',
      'Investigate complaints and record the response and outcome.',
      'Feed themes into Quality & Improvement as improvement items.',
      'Close the loop with the person who gave the feedback.',
      'Run branded survey campaigns periodically and log responses.',
    ],
    tools: [
      { name: 'Survey register', detail: 'Campaign and response tracking.' },
      { name: 'Survey PDF', detail: 'Branded, printable surveys.' },
      { name: 'Feedback detail dialog', detail: 'Complete record per item.' },
    ],
    tips: [
      'Acknowledge fast even when you cannot resolve fast — acknowledgement is what the person remembers.',
      'Complaints are quality data: route them into the improvement register, not just the file.',
    ],
  },

  quality: {
    tagline: 'A living improvement system',
    purpose: 'Quality & Improvement is the continuous improvement engine: quality items from audits, feedback and observations; prioritisation by impact and risk; planned actions with owners; implementation and measurement recorded in the Continuous Improvement Register; and management reporting. It is the module that proves the organisation learns.',
    features: [
      { name: 'Quality item register', detail: 'Improvement ideas, audit findings and feedback themes as trackable items.' },
      { name: 'Quality item dialog', detail: 'Structured capture of impact, risk, actions and results.' },
      { name: 'Prioritisation', detail: 'Rank by impact and risk to focus effort.' },
      { name: 'Action planning', detail: 'Owners and due dates per improvement.' },
      { name: 'Continuous Improvement Register', detail: 'Formal register of completed improvements with results.' },
      { name: 'Quality reviews', detail: 'Periodic review of the improvement program.' },
      { name: 'Management reporting', detail: 'Progress reporting for management meetings.' },
    ],
    steps: [
      'Log improvement ideas, audit findings and feedback themes as quality items.',
      'Prioritise by impact and risk.',
      'Plan actions with owners and due dates.',
      'Implement, measure the result and record it in the Continuous Improvement Register.',
      'Report progress in management meetings.',
      'Review the improvement program quarterly and retire finished items.',
    ],
    tools: [
      { name: 'Quality item dialog', detail: 'Capture the full improvement lifecycle.' },
      { name: 'CI register export', detail: 'Branded register for audits — improvement evidence is a core NDIS expectation.' },
    ],
    tips: [
      'Record the measured result, not just the action — "we changed the roster" is less persuasive than "missed shifts fell from 7 to 1 a month".',
      'An improvement register with no entries in six months is itself an audit finding.',
    ],
  },

  help: {
    tagline: 'Answers, diagnostics, support',
    purpose: 'The Help Centre is the in-app support system: module guides, an AI troubleshooter that diagnoses problems from your description, a system health panel showing what is running and what is not, and the support desk for raising tickets. Start here before emailing anyone.',
    features: [
      { name: 'Module guides', detail: 'The in-module user guides with process steps for every module.' },
      { name: 'AI troubleshooter', detail: 'Describe the problem; the AI diagnoses and suggests fixes.' },
      { name: 'System health panel', detail: 'Live view of integrations, workflows and data services.' },
      { name: 'Support desk', detail: 'Raise tickets with priority, module and description.' },
      { name: 'Ticket tracking', detail: 'Track support responses and resolutions.' },
    ],
    steps: [
      'Open the guide for the module you are working in.',
      'Describe problems to the AI troubleshooter and try the suggested fixes.',
      'Check system health before reporting an outage — it may already be visible.',
      'Raise a support ticket with the module and a clear description when you need a human.',
      'Track the ticket to resolution and note the response.',
    ],
    tools: [
      { name: 'AI troubleshooter', detail: 'Diagnostic assistant for app problems.' },
      { name: 'System health', detail: 'Integration and workflow status.' },
      { name: 'Support tickets', detail: 'Ticket raise and tracking.' },
    ],
    tips: [
      'The troubleshooter gets better the more specific you are — name the module and what you clicked.',
      'Check the user guides first: most questions are answered there in less time than a ticket takes.',
    ],
  },

  'suggestions-hub': {
    tagline: 'Every register reviewed, every process covered',
    purpose: 'The Suggestions Hub reviews every register in the app and shows what to visualise, automate and refine for each one, backed by live record counts. It is also the central record of the app\u2019s automated process coverage: every register now has a scheduled process that chases overdue, expiring and due-soon items, so nothing in any section can sit unattended. Audit actions escalate through the audit escalation workflow, compliance checklist tasks are chased daily, and every reminder scan run is recorded in the status log with its results.',
    features: [
      { name: 'All-register review', detail: 'Live counts (total, open, overdue, due soon) for every register with visualise, automate and refine suggestions per module.' },
      { name: 'Daily register reminders', detail: 'A daily scan at 8:20am (Sydney) covering quality escalations, overdue invoices, quote expiry, certificate expiry, document reviews, asset maintenance, equipment and MSDS reviews, upcoming events, meeting actions, lead follow-ups, NDIS deadlines, supplier review and compliance checklist tasks.' },
      { name: 'Reminder coverage table', detail: 'Each register shows the automated processes already covering it, so gaps are visible at a glance.' },
      { name: 'Recorded results', detail: 'Every scan run is recorded in the status log with the items found, alerts posted and notifications sent; each item alert lands in the Communication Centre diary and admin notifications.' },
      { name: 'Idempotent alerting', detail: 'Items alert once per state — no duplicate reminders day after day — and re-alert automatically when an item\u2019s state changes.' },
    ],
    steps: [
      'Open the Suggestions Hub to see every register with live counts and its three categories of suggestions.',
      'Work overdue and due-soon items flagged by the daily reminders — each alert links back to its module.',
      'Check the Communication Centre diary for the system\u2019s register alerts and who they are directed to.',
      'Review the status log for each scan run\u2019s recorded results: items found, alerts posted, notifications sent.',
      'Use the weekly suggestions digest email for a management-level summary of everything the scans found.',
    ],
    tools: [
      { name: 'Register reminder scan', detail: 'Daily automated scan across all thirteen previously uncovered areas, plus audit action escalation and task due reminders.' },
      { name: 'Suggestions digest email', detail: 'Scheduled management email summarising register statistics and prioritised actions.' },
      { name: 'Communication Centre diary', detail: 'Where every system alert is recorded, with attention routing and timestamps.' },
      { name: 'Status log', detail: 'Permanent record of every reminder scan run and its results.' },
    ],
    tips: [
      'If a register shows no open items, the daily scan records a clean run — silence means everything is covered.',
      'Clear alerts from the oldest first: overdue items escalate in severity the longer they sit.',
      'New registers should always be added to the reminder scan so coverage stays complete.',
    ],
  },
};