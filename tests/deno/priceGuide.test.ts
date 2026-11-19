// NDIS price guide rules: catalogue parsing, price diff, and which shifts an approval may re-price.
import { assertEquals } from 'jsr:@std/assert@1';
import { normaliseCatalogueRow, diffCatalogues, shiftsToReprice } from '../../base44/shared/priceGuide.ts';

Deno.test('catalogue rows parse with NDIA headings and Queensland price', () => {
  const r = normaliseCatalogueRow({ 'Support Item Number': '01_011_0107_1_1', 'Support Item Name': 'Assistance With Self-Care - Weekday Daytime', Unit: 'H', QLD: '$70.23', Remote: '98.32', Quote: 'N', 'Start date': '2025-07-01' });
  assertEquals(r?.support_item_number, '01_011_0107_1_1');
  assertEquals(r?.national_price, 70.23);
  assertEquals(r?.remote_price, 98.32);
  assertEquals(r?.quote_required, false);
  assertEquals(normaliseCatalogueRow({ 'Support Item Number': 'Notes' }), null);
});

Deno.test('diff finds increases, decreases, new and removed items', () => {
  const a = [{ support_item_number: '01_011_0107_1_1', national_price: 70 }, { support_item_number: '01_002_0107_1_1', national_price: 60 }, { support_item_number: '04_104_0125_6_1', national_price: 50 }];
  const b = [{ support_item_number: '01_011_0107_1_1', national_price: 72 }, { support_item_number: '01_002_0107_1_1', national_price: 58 }, { support_item_number: '15_056_0128_1_3', national_price: 200 }];
  const d = diffCatalogues(a, b);
  assertEquals(d.map((x) => `${x.support_item_number}:${x.change}`), ['01_002_0107_1_1:decrease', '01_011_0107_1_1:increase', '04_104_0125_6_1:removed', '15_056_0128_1_3:new']);
});

Deno.test('only future, un-invoiced shifts on changed items are re-priced', () => {
  const changes = diffCatalogues([{ support_item_number: '01_011_0107_1_1', national_price: 70 }], [{ support_item_number: '01_011_0107_1_1', national_price: 72 }]);
  const shifts = [
    { id: 'before', date: '2026-06-30', support_item_number: '01_011_0107_1_1', billable_rate: 70 },
    { id: 'future', date: '2026-07-02', support_item_number: '01_011_0107_1_1', billable_rate: 70 },
    { id: 'invoiced', date: '2026-07-02', support_item_number: '01_011_0107_1_1', billable_rate: 70, invoiced: true },
    { id: 'other', date: '2026-07-02', support_item_number: '07_001_0106_8_3', billable_rate: 100 },
  ];
  assertEquals(shiftsToReprice(shifts, changes, '2026-07-01').map((s) => [s.shift_id, s.old_rate, s.new_rate]), [['future', 70, 72]]);
});
