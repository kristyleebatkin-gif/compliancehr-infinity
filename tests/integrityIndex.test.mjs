import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { integrityDimensions, scoreDimension, scoreIntegrityIndex, integrityBand, businessToday } from '../src/lib/integrityIndex.js';
import { loadIntegrityIndex, INTEGRITY_SOURCE_PERMISSIONS } from '../src/lib/loadIntegrityIndex.js';
import { ALL_ROLES, canAccessNav } from '../src/lib/roleMatrix.js';
import { canReadExecutiveMetrics } from '../src/lib/executiveMetrics.js';

const today = '2026-11-17';
const dimensions = integrityDimensions(today);
const user = { id: 'test-user', role: 'Provider Administrator', tenant_id: 'tenant-a', account_status: 'Active', access_approved: true };
const allCounts = () => Object.fromEntries(dimensions.flatMap(d => d.measures.map(m => [m.key, m.side === 'good' ? 3 : 1])));

test('owner weights match all ten dimensions exactly', () => {
  assert.deepEqual(dimensions.map(d => [d.key, d.weight]), [
    ['governance',15], ['compliance',15], ['risk',10], ['audit',10], ['evidence',10],
    ['workforce',10], ['clinical',10], ['trust',10], ['assurance',5], ['strategic',5],
  ]);
  assert.equal(dimensions.reduce((sum, d) => sum + d.weight, 0), 100);
});

test('complete dimension uses the documented indicator ratio', () => {
  const result = scoreDimension(dimensions[0], { govActive:30, govOverdue:10, boardApproved:20, boardOverdue:0 });
  assert.equal(result.score, 83);
  assert.equal(result.coverage, 100);
});

test('missing, failed and malformed reads cannot inflate a dimension', () => {
  for (const bad of [undefined, null, -1, 1.5, Infinity, NaN, '0', { count:0 }]) {
    const result = scoreDimension(dimensions[0], { govActive:10, govOverdue:bad, boardApproved:10, boardOverdue:0 });
    assert.equal(result.score, null);
    assert.equal(result.contribution, null);
  }
});

test('partial dimensions cannot be renormalised into a full enterprise score', () => {
  const result = scoreIntegrityIndex(dimensions, { govActive:9, govOverdue:1, boardApproved:0, boardOverdue:0 });
  assert.equal(result.dimensions[0].score, 90);
  assert.equal(result.coverage, 15);
  assert.equal(result.score, null);
});

test('an empty business is unmeasured even when all reads succeed', () => {
  const counts = Object.fromEntries(Object.keys(allCounts()).map(k => [k,0]));
  const result = scoreIntegrityIndex(dimensions, counts);
  assert.equal(result.score, null);
  assert.equal(result.coverage, 0);
});

test('complete composite retains the fixed 100-point denominator', () => {
  const result = scoreIntegrityIndex(dimensions, allCounts());
  const expected = Math.round(result.dimensions.reduce((sum,d) => sum + d.score*d.weight, 0)/100);
  assert.equal(result.score, expected);
  assert.equal(result.coverage, 100);
  assert.equal(result.measuredDimensions, 10);
  assert.doesNotMatch(result.band.label, /assured|verified|compliant|exemplary/i);
});

test('bands do not claim verified assurance and business date is Brisbane', () => {
  assert.equal(integrityBand(null).tone,'unmeasured');
  assert.equal(businessToday(new Date('2026-11-17T15:00:00Z')), '2026-11-18');
  assert.throws(() => integrityDimensions('17/11/2026'), /business date/i);
});

test('every count predicate uses actual schema fields and enum values', () => {
  for (const d of dimensions) for (const m of d.measures) {
    const schema = JSON.parse(fs.readFileSync(new URL('../base44/entities/'+m.entity+'.jsonc', import.meta.url),'utf8'));
    assert.ok(INTEGRITY_SOURCE_PERMISSIONS[m.entity], m.entity);
    for (const [field, condition] of Object.entries(m.query)) {
      assert.ok(schema.properties[field], m.entity+'.'+field);
      const allowed = schema.properties[field].enum;
      if (allowed) for (const value of typeof condition === 'object' ? condition.$in || [] : [condition]) assert.ok(allowed.includes(value), m.entity+'.'+field+': '+value);
    }
  }
});

test('loader rejects ineligible identities before reading any entity', async () => {
  const entities = new Proxy({}, { get() { throw new Error('must not read'); } });
  for (const patch of [{id:null},{tenant_id:null},{access_approved:false},{account_status:'Suspended'},{role:'Participant'}]) {
    const result = await loadIntegrityIndex({entities,user:{...user,...patch},today});
    assert.equal(result.score,null);
    assert.deepEqual(result.counts,{});
  }
});

test('loader binds every count to the current business including nested identities', async () => {
  for (const person of [user, {...user,tenant_id:undefined,data:{tenant_id:'tenant-b'}}]) {
    let calls=0;
    const entities = new Proxy({}, { get: () => ({count: async query => { calls++; assert.equal(query.tenant_id,person.tenant_id || person.data.tenant_id); return 1; }})});
    const result = await loadIntegrityIndex({entities,user:person,today});
    assert.equal(calls, dimensions.flatMap(d=>d.measures).length);
    assert.equal(result.unavailableReads,0);
  }
});

test('async failures, synchronous SDK errors and malformed counts are unavailable', async () => {
  const entities = new Proxy({}, { get: (_,name) => {
    if(name==='Risk') throw new Error('SDK access failed');
    return {count: async () => { if(name==='GovernanceObject') throw new Error('denied'); return name==='AssuranceEvidence' ? {count:4} : 1; }};
  }});
  const result=await loadIntegrityIndex({entities,user,today});
  assert.equal(result.score,null);
  assert.ok(result.unavailableReads>0);
  assert.equal(result.counts.riskHigh,null);
  assert.equal(result.counts.govActive,null);
  assert.equal(result.counts.evidenceVerified,null);
  assert.equal(result.counts.certCurrent,1);
});

test('loader requests only allowed source modules across the current role matrix', async () => {
  for (const role of ALL_ROLES) {
    const person={...user,role};
    let calls=0;
    const entities=new Proxy({}, {get:(_,name)=>({count:async()=>{ calls++; assert.equal(canAccessNav(role,INTEGRITY_SOURCE_PERMISSIONS[name]),true); return 1; }})});
    const result=await loadIntegrityIndex({entities,user:person,today});
    if (!canReadExecutiveMetrics(person)) {
      assert.equal(calls,0,role);
      assert.equal(result.score,null);
    } else assert.ok(calls>0,role);
  }
});
