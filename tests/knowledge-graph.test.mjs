import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = (await readFile(new URL('../src/lib/knowledgeGraph.js', import.meta.url), 'utf8'))
  .replace("import { base44 } from '@/api/base44Client';", 'const base44 = {};')
  .replace("import { hasApprovedAccess, canAccessNav } from '@/lib/roles';", `import { hasApprovedAccess, canAccessNav } from '${new URL('../src/lib/roleMatrix.js', import.meta.url).href}';`);
const { loadGraphUniverse, buildGraph } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
function client(filter, user = { id: 'manager', role: 'Management', account_status: 'Active', access_approved: true, tenant_id: 'business-a' }) {
  return { auth: { me: async () => user }, entities: new Proxy({}, { get: (_, name) => ({ filter: query => filter(name, query) }) }) };
}
test('graph reads only the selected business and handles both SDK collection shapes', async () => {
  const calls = [];
  const result = await loadGraphUniverse(client((name, query) => {
    calls.push(query);
    return name === 'Risk' ? [{ id: 'risk-a', tenant_id: 'business-a' }] : { items: [] };
  }));
  assert.equal(calls.length, 12);
  assert.ok(calls.every(query => query.tenant_id === 'business-a'));
  assert.equal(result.recordsByType.risk.length, 1);
});
test('graph refuses missing business before any entity reads', async () => {
  await assert.rejects(loadGraphUniverse(client(() => { throw Error('must not read'); }, {role:'Management',account_status:'Active',access_approved:true})), /Choose a business/);
});
test('failed graph reads cannot become empty registers or successful health scores', async () => {
  await assert.rejects(loadGraphUniverse(client(name => {
    if (name === 'Risk') throw Error('Risk unavailable');
    return { items: [] };
  })), /Risk unavailable/);
  await assert.rejects(loadGraphUniverse(client(() => ({}))), /unavailable register/);
});
test('graph reports pagination limits and unresolved endpoints cannot create graph edges', async () => {
  const result = await loadGraphUniverse(client(() => ({ items: [], has_more: true })));
  assert.equal(result.truncated, true);
  const graph = buildGraph({ standard: [{ id: 's1', standard_code: '1', framework: 'NDIS' }] }, [
    { id: 'x', from_type: 'standard', from_id: 's1', to_type: 'risk', to_id: 'unknown', relationship: 'RELATES_TO' },
  ]);
  assert.equal(graph.edges.length, 0);
});
test('duplicate standard codes across frameworks do not create arbitrary references', () => {
  const graph = buildGraph({ standard: [
    { id: 's1', standard_code: '1', framework: 'NDIS' },
    { id: 's2', standard_code: '1', framework: 'Aged Care' },
  ], control: [{ id: 'c1', standard_code: '1', framework: 'Aged Care' }] });
  assert.equal(graph.edges.length, 1);
  assert.equal(graph.edges[0].to, 'standard:s2');
});

test('unapproved or revoked graph users are denied before any entity access',async()=>{
 for(const user of [null,{role:'Management',tenant_id:'business-a',account_status:'Pending',access_approved:false},{role:'Support Worker',tenant_id:'business-a',account_status:'Active',access_approved:true}]){
  let calls=0;
  await assert.rejects(loadGraphUniverse(client(()=>{calls++;return [];},user)),/Approved knowledge graph access required/);
  assert.equal(calls,0);
 }
});
test('foreign or untagged graph rows fail closed rather than entering the graph',async()=>{
 for(const tenant_id of ['business-b',undefined])await assert.rejects(loadGraphUniverse(client(()=>[{id:'foreign',tenant_id}])),/scope mismatch/);
});
