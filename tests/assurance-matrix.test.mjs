import test from 'node:test';
import assert from 'node:assert/strict';
import { INDICATORS, CONTROLS, EVIDENCE_REQUIREMENTS, AUDIT_CHECKPOINTS, AUDIT_DOMAINS } from '../src/lib/masterAssuranceCatalogue.js';
import { resolveAuditMatrix, ratingFor, matrixCsv, MATRIX_COLUMNS } from '../src/lib/auditMatrixScoring.js';

test('catalogue ranges are complete with unique internal codes and valid draft references', () => {
  for (const [rows, count, prefix, field] of [[INDICATORS,150,'IND','code'],[CONTROLS,50,'CTRL','code'],[EVIDENCE_REQUIREMENTS,350,'EVD','code'],[AUDIT_CHECKPOINTS,356,'AUD','audit_code']]) {
    assert.equal(rows.length,count); assert.equal(new Set(rows.map(r=>r[field])).size,count);
    rows.forEach((row,i)=>assert.equal(row[field],`${prefix}-${String(i+1).padStart(3,'0')}`));
  }
  assert.equal(AUDIT_DOMAINS.reduce((sum,d)=>sum+d.count,0),356);
  for (const row of AUDIT_CHECKPOINTS) {
    assert.ok(INDICATORS.some(i=>i.code===row.indicator_code));
    assert.ok(CONTROLS.some(i=>i.code===row.control_code));
    assert.ok(EVIDENCE_REQUIREMENTS.some(i=>i.code===row.evidence_code));
    assert.equal(row.catalogue_status,'Draft'); assert.equal(row.mapping_status,'Unverified proposal');
    for (const field of ['standard_code','risk_id','inherent_risk_score','residual_risk_score','verification_date','closure_date']) assert.equal(row[field],null);
  }
});

test('shared standard records never assure generated checkpoint proposals or invent zero scores', () => {
  const result=resolveAuditMatrix({ controls:[{id:'c1',standard_code:'NDIS Core 2'}], evidence:[{id:'e1',standard_code:'NDIS Core 2',status:'Verified'}], findings:[] });
  assert.equal(result.enterprise.percent,null); assert.equal(result.enterprise.rating.label,'Not assessed');
  assert.equal(result.counts.assured,0); assert.equal(result.counts.openFindings,null);
  assert.ok(result.rows.every(r=>r.compliance_percentage===null && r.achieved_points===null && r.state==='unassessed'));
});

test('rating handles unknown, fractional boundaries and invalid values', () => {
  for(const value of [null,undefined,NaN,Infinity,-1,101,'95']) assert.equal(ratingFor(value).label,'Not assessed');
  for(const [value,label] of [[0,'Major Non-Conformance'],[69.9,'Major Non-Conformance'],[70,'Improvement Required'],[79.99,'Improvement Required'],[80,'Partially Compliant'],[89.99,'Partially Compliant'],[90,'Substantially Compliant'],[94.99,'Substantially Compliant'],[95,'Fully Compliant'],[100,'Fully Compliant']]) assert.equal(ratingFor(value).label,label);
});

test('matrix CSV includes all requested fields, draft status and safe spreadsheet text', () => {
  const csv=matrixCsv([{audit_code:'AUD-001',audit_name:'=HYPERLINK("external")',catalogue_status:'Draft',compliance_percentage:null}]);
  assert.equal(csv.split('\n')[0],MATRIX_COLUMNS.join(','));
  assert.ok(csv.includes("'=HYPERLINK")); assert.ok(csv.includes('Draft'));
  for(const key of ['audit_date','actions_count','weighted_score','created_at','updated_at']) assert.ok(MATRIX_COLUMNS.includes(key));
});
