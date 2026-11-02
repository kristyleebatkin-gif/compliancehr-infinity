import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCsv, fetchAllRecords } from '../src/lib/csvExport.js';
const cols = [{ key: 'value', label: 'Value' }];
test('CSV quotes comma, double quote, CR and LF', () => {
  assert.equal(buildCsv(cols, [{ value: 'a,b' }, { value: 'a"b' }, { value: 'a\rb' }, { value: 'a\nb' }]), 'Value\n"a,b"\n"a""b"\n"a\rb"\n"a\nb"');
});
test('CSV neutralises text formulas while preserving actual numbers', () => {
  for (const value of ['=1+1', '+SUM(1)', '-1+2', '@SUM(1)', '  =1', '\t=1', '\r=1']) {
    const cell = buildCsv(cols, [{ value }]).split('\n').slice(1).join('\n');
    assert(cell.startsWith("'") || cell.startsWith('"\''), JSON.stringify(value));
  }
  assert.equal(buildCsv(cols, [{ value: -5 }, { value: 'ordinary' }, { value: null }]), 'Value\n-5\nordinary\n');
  assert.equal(buildCsv([{ key: 'value', label: '=bad' }], []), "'=bad");
});
test('all-record export follows pages and forwards query options', async () => {
  const calls=[];const entity={filter:async(q,o)=>{calls.push([q,o]);return o.cursor?{items:[{id:2}],next_cursor:null}:{items:[{id:1}],next_cursor:'next'}}};
  assert.deepEqual(await fetchAllRecords(entity,{status:'Open'},'date',2),[{id:1},{id:2}]);
  assert.equal(calls[1][1].cursor,'next');assert.equal(calls[0][0].status,'Open');
});
test('all-record export refuses malformed pages', async () => {
  await assert.rejects(fetchAllRecords({filter:async()=>({items:null})}), /page/i);
});
test('all-record export refuses a repeating cursor rather than looping forever', async () => {
  let calls=0;
  await assert.rejects(fetchAllRecords({filter:async()=>{calls++;return {items:[],next_cursor:'same'}}}), /cursor/i);
  assert.equal(calls,2);
});
