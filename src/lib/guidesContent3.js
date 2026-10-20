// Extensive user guide content — Part 3 (newer modules).
// Consumed by the User Guides module and the branded guide PDF generator.
export const GUIDES_PART_3 = {
  assistant: {
    tagline: 'Four AI helpers, one chat',
    purpose: 'The AI Assistant page brings together the app\u2019s built-in AI helpers: the Compliance Agent, the Personal Assistant (Harper), the Receipt Finder and the Roster Assistant. Each reads the records you are allowed to see and answers questions, suggests next steps and teaches fixes — but never changes anything.',
    features: [
      { name: 'Compliance Agent', detail: 'Reads incidents, risks, investigations, training, certificates, policies, NDIS deadlines, audits, reviews and KPIs to answer status questions and find gaps.' },
      { name: 'Personal Assistant (Harper)', detail: 'Role-aware guidance for whatever you are working on, including step-by-step fixes for the most common problems.' },
      { name: 'Receipt Finder', detail: 'Finds receipts by supplier, employee, participant, date, amount, reference or status.' },
      { name: 'Roster Assistant', detail: 'Spots coverage gaps, unassigned shifts, double bookings and missing shift details.' },
      { name: 'Safe by design', detail: 'Assistants only see what you can see, never create, edit, delete or approve anything, and give no legal advice.' },
    ],
    steps: [
      'Open the AI Assistant page from the sidebar, or the Personal Assistant button in the top bar.',
      'Ask a question in plain language — name the module you are working in for the best answer.',
      'Use the Compliance Agent for status questions, expiry lists and audit-gap summaries.',
      'Use Harper when you are stuck or want next steps for the page you are on.',
      'Use the Receipt Finder and Roster Assistant for targeted lookups in their areas.',
      'Act on the guidance yourself — assistants never change records.',
    ],
    tools: [
      { name: 'Assistant chat', detail: 'One chat page with the helpers behind it.' },
      { name: 'Role-aware context', detail: 'Every answer is tailored to your role and current module.' },
      { name: 'Help Centre assistant guide', detail: 'Full ability lists and example questions per helper.' },
    ],
    tips: [
      'The more specific the question, the better the answer — include the module, person or period.',
      'Assistants draft and advise; you remain the author of anything you record.',
    ],
  },

  'emergency-response': {
    tagline: 'Ready before anything happens',
    purpose: 'The Emergency Response module keeps every emergency resource, plan and drill in one place: evacuation and fire safety plans, drills with attendance and outcomes, safety checks, MSDS records, visitor sign in/out, quick-dial contacts and live weather and fire warnings checked before every outing.',
    features: [
      { name: 'Emergency documents library', detail: 'Evacuation plans, diagrams, MSDS, personal emergency plans and checklists with review dates.' },
      { name: 'Drill register', detail: 'Log drills with date, scenario, participants, time to evacuate and improvements identified.' },
      { name: 'Safety checks log', detail: 'Smoke alarm, extinguisher, first aid kit and equipment checks with next-due tracking.' },
      { name: 'Visitor sign in/out', detail: 'A live visitor log for the site, exportable for audits.' },
      { name: 'Quick dial', detail: 'One-tap call panel for 000, 13HEALTH, Poisons and management contacts.' },
      { name: 'Live alerts', detail: 'Current weather and fire warnings for your area, checked before outings.' },
      { name: 'Automated reminders', detail: 'Drills, safety checks and document reviews are chased automatically when due.' },
    ],
    steps: [
      'Keep every plan, diagram and checklist current in the documents library, with review dates set.',
      'Run and log drills; record what worked and what to improve.',
      'Complete safety checks on schedule and log each one.',
      'Check live alerts before every community outing and record the check.',
      'Use visitor sign in/out whenever someone is on site.',
      'In a real emergency, use quick dial first and report in the Incident Clinic afterwards.',
    ],
    tools: [
      { name: 'Quick dial', detail: 'Instant calling of emergency numbers.' },
      { name: 'Live alerts', detail: 'Weather and fire warnings for the local area.' },
      { name: 'Drill and check registers', detail: 'Exportable evidence for auditors.' },
    ],
    tips: [
      'Log the drill the day it happens — a drill that is not logged did not happen as far as an auditor is concerned.',
      'Review emergency documents after every change to the site, roster or participant mix.',
    ],
  },
};