import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const REGULATORS = [
  { key: 'ndis-commission', name: 'NDIS Quality and Safeguards Commission', site: 'ndiscommission.gov.au' },
  { key: 'aged-care-commission', name: 'Aged Care Quality and Safety Commission', site: 'agedcarequality.gov.au' },
  { key: 'fair-work', name: 'Fair Work Ombudsman', site: 'fairwork.gov.au' },
  { key: 'worksafe-qld', name: 'WorkSafe Queensland', site: 'worksafe.qld.gov.au' },
];

const regulatorKeys = REGULATORS.map((regulator) => regulator.key);

const GENERIC_TITLES = [
  'fair work ombudsman',
  'worksafe queensland',
  'workSafe qld',
  'ndis quality and safeguards commission',
  'aged care quality and safety commission',
  'news',
  'news and events',
  'newsroom',
  'media releases',
  'regulatory bulletins',
];

const isHomepage = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/\/+$/, '') === '';
  } catch {
    return true;
  }
};

const cleanPosters = (items) => (items || [])
  .filter((item) => item && item.title && item.url && regulatorKeys.includes(item.regulator))
  .filter((item) => !GENERIC_TITLES.includes(String(item.title).trim().toLowerCase()) && !isHomepage(String(item.url)))
  .map((item) => ({
    regulator: item.regulator,
    title: String(item.title).slice(0, 240),
    summary: item.summary ? String(item.summary).slice(0, 900) : '',
    category: item.category ? String(item.category).slice(0, 80) : '',
    published_date: item.published_date ? String(item.published_date).slice(0, 10) : '',
    url: String(item.url),
  }))
  .slice(0, 12);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const regulatorList = REGULATORS
      .map((regulator) => `- regulator: "${regulator.key}" — ${regulator.name} (${regulator.site})`)
      .join('\n');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      add_context_from_internet: true,
      prompt: `Using web search only on official regulator websites, find the newest published announcements, news, updates and changes from each of these Australian regulators:

${regulatorList}

For each regulator find up to 3 of the most recent and most relevant items for a registered NDIS and aged care provider that also employs staff in Queensland. Prioritise: regulatory changes, practice standards and audit changes, pricing or funding changes, compliance and enforcement action, consultations, wage and award changes, and work health and safety alerts.

For each item return:
- regulator: exactly one of ${regulatorKeys.map((key) => `"${key}"`).join(', ')}
- title: the exact published headline
- published_date: publication date in YYYY-MM-DD format, or an empty string if genuinely unknown
- category: a short label such as "Practice standards", "Pricing", "Enforcement", "Consultation", "Award pay rates", "Safety alert"
- summary: 2 to 3 plain-English sentences stating what changed and what a provider or employer must do about it
- url: the direct link to that specific item on the regulator's official website. Never use a news index, section landing page or homepage when the article's own page is available, and never link to news aggregators.

Only include real, currently published items you can verify from web search. Never invent titles, dates, summaries or URLs. Cover all four regulators, with at least one item each. Order newest first.`,
      response_json_schema: {
        type: 'object',
        properties: {
          posters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                regulator: { type: 'string', enum: regulatorKeys },
                title: { type: 'string' },
                published_date: { type: 'string' },
                category: { type: 'string' },
                summary: { type: 'string' },
                url: { type: 'string' },
              },
              required: ['regulator', 'title', 'url'],
            },
          },
        },
        required: ['posters'],
      },
    });

    return Response.json({ fetched_date: new Date().toISOString(), posters: cleanPosters(result?.posters) });
  } catch (error) {
    return Response.json({ error: error.message || 'Regulator news feed failed.' }, { status: 500 });
  }
}