import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const REGULATORS = [
  { key: 'ndis-commission', name: 'NDIS Quality and Safeguards Commission', site: 'ndiscommission.gov.au' },
  { key: 'aged-care-commission', name: 'Aged Care Quality and Safety Commission', site: 'agedcarequality.gov.au' },
  { key: 'fair-work', name: 'Fair Work Ombudsman', site: 'fairwork.gov.au' },
  { key: 'worksafe-qld', name: 'WorkSafe Queensland', site: 'worksafe.qld.gov.au' },
];

const GENERIC_TITLES = [
  'fair work ombudsman',
  'worksafe queensland',
  'worksafe qld',
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
    return new URL(url).pathname.replace(/\/+$/, '') === '';
  } catch {
    return true;
  }
};

const cleanItems = (items) => (items || [])
  .filter((item) => item && item.title && item.url)
  .filter((item) => !GENERIC_TITLES.includes(String(item.title).trim().toLowerCase()) && !isHomepage(String(item.url)))
  .map((item) => ({
    title: String(item.title).slice(0, 240),
    summary: item.summary ? String(item.summary).slice(0, 900) : '',
    category: item.category ? String(item.category).slice(0, 80) : '',
    published_date: item.published_date ? String(item.published_date).slice(0, 10) : '',
    url: String(item.url),
  }))
  .slice(0, 2);

const promptFor = (regulator) => `Use web search on the official ${regulator.name} website (${regulator.site}) only. Find up to 2 of the newest published news items, announcements, regulatory changes or consultations relevant to an NDIS and aged care provider that also employs staff in Queensland.

Return for each item:
- title: the exact published headline of the item
- published_date: publication date in YYYY-MM-DD format, or an empty string if genuinely unknown
- category: a short label such as "Practice standards", "Pricing", "Enforcement", "Consultation", "Award pay rates", "Safety alert"
- summary: 2 to 3 plain-English sentences stating what changed and what a provider or employer must do about it
- url: the direct link to that specific item on ${regulator.site}, never the homepage

Only return items that are real and currently published and that you found through web search. Never use the organisation's name as a title, never invent headlines, dates, summaries or links. If you cannot verify a current item, return an empty list.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    posts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          published_date: { type: 'string' },
          category: { type: 'string' },
          summary: { type: 'string' },
          url: { type: 'string' },
        },
        required: ['title', 'url'],
      },
    },
  },
  required: ['posts'],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const results = await Promise.allSettled(
      REGULATORS.map((regulator) => base44.asServiceRole.integrations.Core.InvokeLLM({
        add_context_from_internet: true,
        prompt: promptFor(regulator),
        response_json_schema: RESPONSE_SCHEMA,
      }))
    );

    const byRegulator = results.map((result, index) => (
      result.status === 'fulfilled'
        ? cleanItems(result.value?.posts).map((post) => ({ ...post, regulator: REGULATORS[index].key }))
        : []
    ));

    // Interleave so every regulator that returned something is represented near the top.
    const posters = [];
    for (let round = 0; round < 2; round += 1) {
      byRegulator.forEach((items) => { if (items[round]) posters.push(items[round]); });
    }

    if (!posters.length) {
      return Response.json({ error: 'No verified regulator updates were found just now.' }, { status: 502 });
    }
    return Response.json({ fetched_date: new Date().toISOString(), posters: posters.slice(0, 12) });
  } catch (error) {
    return Response.json({ error: error.message || 'Regulator news feed failed.' }, { status: 500 });
  }
}