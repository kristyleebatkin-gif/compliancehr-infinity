// Shared regulator news fetching for the NDIS & Aged Care Updates module, used by the user-triggered
// fetch (ndisNewsFetch) and the daily scheduled sync (ndisNewsSync). Every model call is recorded
// in the AI audit trail through loggedInvokeLLM.
import { loggedInvokeLLM } from './aiAudit.ts';

const TYPES = ['News', 'Update', 'Newsletter', 'Consultation'];
const NDIS_SOURCES = ['NDIS Commission', 'NDIS Agency'];
const AGED_CARE_SOURCES = ['Aged Care Commission', 'Department of Health'];

function clean(items: any[], sector: 'NDIS' | 'Aged Care', sources: string[]) {
  return (items || [])
    .filter((it) => it && it.title && it.url)
    .map((it) => ({
      title: String(it.title),
      published_date: it.published_date || undefined,
      source: sources.includes(it.source) ? it.source : 'Other',
      sector,
      news_type: TYPES.includes(it.news_type) ? it.news_type : 'News',
      category: it.category || undefined,
      summary: it.summary || undefined,
      url: String(it.url),
    }));
}

export const cleanNdisItems = (items: any[]) => clean(items, 'NDIS', NDIS_SOURCES);
export const cleanAgedCareItems = (items: any[]) => clean(items, 'Aged Care', AGED_CARE_SOURCES);

function schema(sources: string[]) {
  return {
    type: 'object',
    properties: {
      fetched_date: { type: 'string' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            published_date: { type: 'string' },
            source: { type: 'string', enum: [...sources, 'Other'] },
            news_type: { type: 'string', enum: TYPES },
            category: { type: 'string' },
            summary: { type: 'string' },
            url: { type: 'string' },
          },
          required: ['title', 'url'],
        },
      },
    },
    required: ['items'],
  };
}

const RULES = `For each item return:
- title: exact headline of the item
- published_date: date published in YYYY-MM-DD format (leave empty if genuinely unknown)
- news_type: "News" for general news, "Update" for policy/pricing/practice updates, "Newsletter" for newsletters and bulletins, "Consultation" for open consultations
- category: short free text, e.g. "Pricing", "Registration", "Compliance", "Practice Standards", "Safeguards"
- summary: 2 to 4 plain-English sentences explaining what changed or what is announced and what providers need to know or do
- url: the direct link to the item on the official site

Only include real, currently published items you can verify from web search. Do not invent titles, dates, summaries or URLs. Return up to 15 of the newest and most provider-relevant items, newest first.`;

export async function fetchNdisItems(service: any, ctx: { feature: string; user?: any } = { feature: 'ndisNewsSync' }) {
  return await loggedInvokeLLM(service, { ...ctx, module: 'ndis-news' }, {
    add_context_from_internet: true,
    prompt: `Using web search, find the most recent NDIS news and provider-facing updates published on the official NDIS websites ndis.gov.au (NDIA) and ndiscommission.gov.au (NDIS Commission). Include:
- The latest news items and media releases affecting registered NDIS providers
- Pricing Arrangements and Price Guide updates, including any recent pricing changes
- Provider registration, practice standards, provider obligations and compliance/enforcement updates
- Open consultations relevant to providers
- The most recent newsletters and provider bulletins (e.g. NDIS Commission newsletters, NDIA provider eNews/bulletins)

Also return source: "NDIS Commission" for ndiscommission.gov.au items, "NDIS Agency" for ndis.gov.au items, otherwise "Other".

${RULES}`,
    response_json_schema: schema(NDIS_SOURCES),
  });
}

export async function fetchAgedCareItems(service: any, ctx: { feature: string; user?: any } = { feature: 'ndisNewsSync' }) {
  return await loggedInvokeLLM(service, { ...ctx, module: 'aged-care-news' }, {
    add_context_from_internet: true,
    prompt: `Using web search, find the most recent aged care news and provider-facing updates published on the official Australian Government websites agedcarequality.gov.au (Aged Care Quality and Safety Commission) and health.gov.au (Department of Health, Disability and Ageing — aged care pages only). Include:
- Aged Care Act and Strengthened Aged Care Quality Standards changes, rules and commencement dates
- Support at Home and residential care pricing, funding and subsidy changes
- Provider registration, obligations, Serious Incident Response Scheme (SIRS), compliance and enforcement updates
- Open consultations relevant to aged care providers
- The most recent provider newsletters, bulletins and sector announcements

Also return source: "Aged Care Commission" for agedcarequality.gov.au items, "Department of Health" for health.gov.au items, otherwise "Other".

${RULES}`,
    response_json_schema: schema(AGED_CARE_SOURCES),
  });
}
