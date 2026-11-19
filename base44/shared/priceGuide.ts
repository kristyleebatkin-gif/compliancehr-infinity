// NDIS price guide (Support Catalogue) rules. Pure functions, no database access, so they can be tested.
// Agreed with the owner: an update shows an impact preview before approval; approval applies new prices
// from their effective date; shifts already invoiced (and invoices already sent or claimed) never change;
// every change is logged for audit.

export type CatalogueItem = {
  support_item_number: string;
  support_item_name?: string;
  registration_group_number?: string;
  registration_group_name?: string;
  support_category_number?: string;
  support_category_name?: string;
  unit?: string;
  national_price?: number | null;
  remote_price?: number | null;
  very_remote_price?: number | null;
  quote_required?: boolean;
  effective_from?: string;
  effective_to?: string;
};

const money = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
};

// Accepts one row of the NDIS Support Catalogue, keyed by its column headings, in any of the
// heading spellings the NDIA has used. Queensland prices are used as the standard price for this provider.
export function normaliseCatalogueRow(row: Record<string, any>, state = 'QLD'): CatalogueItem | null {
  const get = (...names: string[]) => {
    for (const key of Object.keys(row)) {
      const k = key.trim().toLowerCase();
      if (names.some((n) => k === n.toLowerCase())) return row[key];
    }
    return undefined;
  };
  const number = String(get('Support Item Number', 'support_item_number') ?? '').trim();
  if (!/^\d{2}_\d{3}_\d{4}_\d_\d/.test(number)) return null;
  const quote = String(get('Quote', 'Quote Required', 'quote_required') ?? '').trim().toLowerCase();
  return {
    support_item_number: number,
    support_item_name: String(get('Support Item Name', 'support_item_name') ?? '').trim(),
    registration_group_number: String(get('Registration Group Number') ?? '').trim() || undefined,
    registration_group_name: String(get('Registration Group Name') ?? '').trim() || undefined,
    support_category_number: String(get('Support Category Number', 'Support Category Number (PACE)') ?? '').trim() || undefined,
    support_category_name: String(get('Support Category Name', 'Support Category Name (PACE)') ?? '').trim() || undefined,
    unit: String(get('Unit', 'Unit of Measure') ?? '').trim() || undefined,
    national_price: money(get(state, 'National', 'national_price', 'Price Limit')),
    remote_price: money(get('Remote', 'remote_price')),
    very_remote_price: money(get('Very Remote', 'very_remote_price')),
    quote_required: quote === 'y' || quote === 'yes' || quote === 'true',
    effective_from: String(get('Start date', 'Start Date', 'effective_from') ?? '').slice(0, 10) || undefined,
    effective_to: String(get('End Date', 'End date', 'effective_to') ?? '').slice(0, 10) || undefined,
  };
}

export type PriceChange = {
  support_item_number: string;
  support_item_name: string;
  old_price: number | null;
  new_price: number | null;
  change: 'increase' | 'decrease' | 'new' | 'removed';
};

export function diffCatalogues(current: CatalogueItem[], next: CatalogueItem[]): PriceChange[] {
  const before = new Map(current.map((i) => [i.support_item_number, i]));
  const after = new Map(next.map((i) => [i.support_item_number, i]));
  const out: PriceChange[] = [];
  for (const [num, item] of after) {
    const old = before.get(num);
    const np = item.national_price ?? null;
    if (!old) { out.push({ support_item_number: num, support_item_name: item.support_item_name || '', old_price: null, new_price: np, change: 'new' }); continue; }
    const op = old.national_price ?? null;
    if (op !== np && op !== null && np !== null) {
      out.push({ support_item_number: num, support_item_name: item.support_item_name || '', old_price: op, new_price: np, change: np > op ? 'increase' : 'decrease' });
    }
  }
  for (const [num, item] of before) {
    if (!after.has(num)) out.push({ support_item_number: num, support_item_name: item.support_item_name || '', old_price: item.national_price ?? null, new_price: null, change: 'removed' });
  }
  return out.sort((a, b) => a.support_item_number.localeCompare(b.support_item_number));
}

// Which shifts an approved release would re-price: dated on or after the release's effective date,
// claimed under an item whose price changed, and not yet invoiced. Everything else stays as it is.
export function shiftsToReprice(shifts: any[], changes: PriceChange[], effectiveFrom: string) {
  const priced = new Map(changes.filter((c) => c.new_price !== null && c.change !== 'new').map((c) => [c.support_item_number, c]));
  return shifts
    .filter((s) => s && s.support_item_number && priced.has(s.support_item_number))
    .filter((s) => String(s.date || '').slice(0, 10) >= effectiveFrom)
    .filter((s) => s.invoiced !== true && !s.invoice_id)
    .map((s) => ({
      shift_id: s.id,
      date: s.date,
      participant_name: s.participant_name || '',
      support_item_number: s.support_item_number,
      old_rate: s.billable_rate ?? null,
      new_rate: priced.get(s.support_item_number)!.new_price,
    }))
    .filter((r) => r.old_rate !== r.new_rate);
}
