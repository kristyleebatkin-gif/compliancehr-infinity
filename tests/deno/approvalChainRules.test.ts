import { buildStages, canDecide, requiredLevels, stageAt } from '../../base44/shared/approvalChainRules.ts';
function equal(actual, expected) { if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(JSON.stringify({actual, expected})); }
Deno.test('critical requests require five ordered approval stages and stop after the fifth', () => {
 const stages = buildStages('Risk acceptance', { riskLevel: 'Critical' });
 equal(stages.map(stage => stage.level), [1,2,3,4,5]);
 equal(stageAt(stages, 6), null);
 equal(requiredLevels('Expenditure', 50000, 'Low'), 5);
});
Deno.test('higher risk cannot be lowered by a small expenditure', () => {
 equal(requiredLevels('Expenditure', 1, 'Critical'), 5);
 equal(requiredLevels('Expenditure', 1, 'Low'), 2);
});
Deno.test('an unrelated employee cannot decide a manager stage and missing stages deny everyone', () => {
 const stage = buildStages('Risk acceptance', { riskLevel: 'High' })[1];
 equal(canDecide(stage, 'Employee'), false);
 equal(canDecide(stage, 'Compliance Manager'), true);
 equal(canDecide(null, 'admin'), false);
});
