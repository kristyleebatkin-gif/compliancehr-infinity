import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateWorkflow, studioScopeKey } from '../src/lib/workflowStudioSafety.js';
import { validateWorkflow, summariseInstances, WORKFLOW_TEMPLATES, NODE_LIBRARY } from '../src/lib/workflowStudio.js';
const graph = [
 { id:'s', type:'START', label:'Start', next:'d' },
 { id:'d', type:'DECISION', label:'Route', yes_next:'t', no_next:'e' },
 { id:'t', type:'TASK', label:'Task', role:'Team Leader', next:'e' },
 { id:'e', type:'END', label:'End' }
];
test('simulation requires a branch and produces a deterministic hypothetical path', () => {
 assert.equal(simulateWorkflow(graph).status, 'Decision required');
 assert.deepEqual(simulateWorkflow(graph,{d:'approve'}).steps.map(s=>s.id),['s','d','t','e']);
 assert.deepEqual(simulateWorkflow(graph,{d:'reject'}).steps.map(s=>s.id),['s','d','e']);
 assert.equal(simulateWorkflow(graph,{d:'reject'}).status,'Reached end (simulation only)');
});
test('missing routes and loops never claim completion', () => {
 assert.equal(simulateWorkflow(graph.map(n=>n.id==='t'?{...n,next:'missing'}:n),{d:'approve'}).status,'Broken route');
 assert.equal(simulateWorkflow(graph.map(n=>n.id==='t'?{...n,next:'d'}:n),{d:'approve'},8).status,'Step limit reached');
});
test('all system adapters stop simulation instead of claiming an action occurred', () => {
 for(const type of ['AI_REVIEW','API_CALL','WEBHOOK','WAIT','NOTIFICATION','CONTROL_CHECK','STANDARD_CHECK','EVIDENCE_VALIDATION','SUB_WORKFLOW','SLA_CHECK','UNKNOWN']) {
  const g=[{id:'s',type:'START',label:'s',next:'x'},{id:'x',type,label:'adapter',next:'e'},{id:'e',type:'END',label:'e'}];
  assert.equal(simulateWorkflow(g).status,'Adapter required (not executed)');
 }
});
test('simulation rejects malformed graphs and bounds malicious limits', () => {
 for(const g of [null,[],[null],[...graph,graph[0]]]) assert.equal(simulateWorkflow(g).status,'Invalid');
 assert.equal(simulateWorkflow(graph,{d:'approve'},Infinity).steps.length<=240,true);
});
test('validation rejects malformed and dangling graphs', () => {
 for(const g of [null,[null],graph.map(n=>n.id==='t'?{...n,next:'missing'}:n),graph.map(n=>n.id==='t'?{...n,type:'UNKNOWN'}:n)]) assert.equal(validateWorkflow(g).valid,false);
});
test('empty and historically unverified data never yields perfect SLA compliance', () => {
 const empty=summariseInstances([]);
 assert.equal(empty.completionRate,null); assert.equal(empty.slaCompliance,null); assert.equal(empty.averageHours,null);
 const sample=summariseInstances([{state:'Completed',started_at:'2026-01-01T00:00:00Z',completed_at:'2026-01-01T02:00:00Z',sla_state:'Closed'},{state:'Failed',started_at:'2026-01-01T00:00:00Z',completed_at:'2026-01-03T00:00:00Z'}]);
 assert.equal(sample.averageHours,2); assert.equal(sample.completionRate,50); assert.equal(sample.slaCompliance,null);
});
test('identity, tenant and approval changes invalidate studio render scope', () => {
 const user={id:'a',tenant_id:'t',role:'Team Leader',account_status:'Active',access_approved:true};
 for(const patch of [{id:'b'},{tenant_id:'b'},{role:'Employee'},{account_status:'Suspended'},{access_approved:false}]) assert.notEqual(studioScopeKey(user),studioScopeKey({...user,...patch}));
});
test('catalogue is descriptive and uses all 33 owner requested types', () => {
 assert.equal(NODE_LIBRARY.length,33); assert.equal(new Set(NODE_LIBRARY.map(n=>n.type)).size,33);
 assert.equal(WORKFLOW_TEMPLATES.length,10);
});
