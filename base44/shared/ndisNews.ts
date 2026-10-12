// Shared NDIS news fetching logic, used by both the user-triggered fetch
// (ndisNewsFetch) and the daily scheduled sync (ndisNewsSync).

export function cleanNdisItems(items) {
  return (items || [])
    .filter((it) => it && it.title && it.url)
    .map((it) => ({
      title: String(it.title),
      published_date: it.published_date || undefined,
      source: ['NDIS Commission', 'NDIS Agency'].includes(it.source) ? it.source : 'Other',
      news_type: ['News', 'Update', 'Newsletter', 'Consultation'].includes(it.news_type) ? it.news_type : 'News',
      category: it.category || undefined,
      summary: it.summary || undefined,
      url: String(it.url),
    }));
}

export async function fetchNdisItems(core) {
  return await core.InvokeLLM({
    add_context_from_internet: true,
    prompt: `Using web search, find the most recent NDIS news and provider-facing updates published on the official NDIS websites ndis.gov.au (NDIA) and ndiscommission.gov.au (NDIS Commission). Include:
- The latest news items and media releases affecting registered NDIS providers
- Pricing Arrangements and Price Guide updates, including any recent pricing changes
- Provider registration, practice standards, provider obligations and compliance/enforcement updates
- Open consultations relevant to providers
- The most recent newsletters and provider bulletins (e.g. NDIS Commission newsletters, NDIA provider eNews/bulletins)

For each item return:
- title: exact headline of the item
- published_date: date published in YYYY-MM-DD format (leave empty if genuinely unknown)
- source: "NDIS Commission" for ndiscommission.gov.au items, "NDIS Agency" for ndis.gov.au items, otherwise "Other"
- news_type: "News" for general news, "Update" for policy/pricing/practice updates, "Newsletter" for newsletters and bulletins, "Consultation" for open consultations
- category: short free text, e.g. "Pricing", "Registration", "Compliance", "Practice Standards", "Safeguards"
- summary: 2 to 4 plain-English sentences explaining what changed or what is announced and what providers need to know or do
- url: the direct link to the item on the official site

Only include real, currently published items you can verify from web search. Do not invent titles, dates, summaries or URLs. Return up to 15 of the newest and most provider-relevant items, newest first.`,
    response_json_schema: {
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
              source: { type: 'string', enum: ['NDIS Commission', 'NDIS Agency', 'Other'] },
              news_type: { type: 'string', enum: ['News', 'Update', 'Newsletter', 'Consultation'] },
              category: { type: 'string' },
              summary: { type: 'string' },
              url: { type: 'string' },
            },
            required: ['title', 'url'],
          },
        },
      },
      required: ['items'],
    },
  });
}