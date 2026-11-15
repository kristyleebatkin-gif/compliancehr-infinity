import JSZip from 'jszip';
import { MASTER_CATALOGUE, MASTER_ROLES, MASTER_WORKSPACE_ELEMENTS, MODULE_OUTPUTS, MASTER_TRACEABILITY, ARCHITECTURE_DECISIONS } from './enterpriseMasterScope.js';
import { enterprisePhaseMarkdown } from './enterprisePhases';
import { OPERATING_SYSTEMS, PLATFORM_AUDIT, ENTERPRISE_GAPS, SCHEMA_PLAN, API_PLAN } from './enterpriseOS';
import { ROLE_WORKSPACES } from './enterpriseRoleWorkspaces';
import { ASSIGNABLE_ROLES } from './roleMatrix';

export async function downloadEnterpriseReviewPackage() {
  const zip = new JSZip();
  const caveat = '# ComplianceHR Infinity Enterprise vNext\n\n15 November 2026. Source review and implementation planning only. Source presence is not functional, security, accessibility or regulatory acceptance. Full transformation remains open. No production publication established.\n\n';
  const systems = OPERATING_SYSTEMS.map(os => '## ' + os.label + '\n' + os.capabilities.map(cap => '- [' + (cap.state === 'live' ? 'source present; unverified' : cap.state) + '] ' + cap.label + (cap.note ? ': ' + cap.note : '')).join('\n')).join('\n\n');
  const gaps = ENTERPRISE_GAPS.map(item => '- P' + item.priority + ' ' + item.os + ': ' + item.gap).join('\n');
  const roles = ROLE_WORKSPACES.map(item => '- ' + item.role + ': ' + item.workspace + ' (' + (item.status === 'live' ? 'source mapping; unverified' : item.status) + '). ' + item.note).join('\n');
  const docs = {
    '01-platform-audit.md': '## Source inventory\n' + JSON.stringify(PLATFORM_AUDIT, null, 2) + '\n\n' + systems,
    '02-gap-analysis.md': gaps,
    '03-architecture.md': '## Extend existing layers\nTenant and identity → entity RLS → authorised backend functions → existing tasks, approvals and evidence → shared modules → role-filtered navigation.\n\nReuse existing entities before adding candidates. Preserve IDs, routes, 360 relationships and iPad Quick Access.\n\n' + systems,
    '04-database-expansion-plan.md': SCHEMA_PLAN.map(item => '- ' + item.scheme + ': ' + item.entities.join(', ') + ' (candidates; reconcile before migration)').join('\n') + '\n\nRequired contracts: UUID without replacing existing IDs, tenant ID, created/modified identity and date, audit metadata, soft deletion, server-enforced authorisation and migration/rollback evidence. Existing entities have not all been verified against this contract.',
    '05-api-expansion-plan.md': API_PLAN.map(item => '- ' + item.domain + ': ' + item.contract + ' (target contract; not delivered by this package)').join('\n') + '\n\nRequire authenticated role and tenant checks, validation, error contracts, pagination, audit events and negative access tests.',
    '06-missing-screens.md': '## Candidate screen and workflow gaps\n' + gaps,
    '07-missing-modules.md': '## Operating-system gaps\nDo not infer that an entire module is absent from a missing capability; reconcile existing modules first.\n\n' + gaps,
    '08-missing-workspaces-and-roles.md': roles + '\n\n## Currently assignable role labels\n' + ASSIGNABLE_ROLES.join(', ') + '\n\n## Requested labels requiring role-contract reconciliation\n' + ROLE_WORKSPACES.filter(item => !ASSIGNABLE_ROLES.includes(item.role)).map(item => '- ' + item.role).join('\n') + '\n\nMappings do not grant access or implement all nine required workspace elements.',
    '09-implementation-roadmap.md': enterprisePhaseMarkdown() + '\n\n## Latest master scope V2.0\n30 groups reserve 1,500 module numbers; individual modules are not yet defined.\n\n' + MASTER_CATALOGUE.map(group => '- ' + String(group.first).padStart(3, '0') + '–' + group.last + ': ' + group.name + ' (' + group.status + ')').join('\n') + '\n\n## V2 traceability\n' + MASTER_TRACEABILITY.join(' → ') + '\n\n## Required module outputs\n' + MODULE_OUTPUTS.map((name, i) => (i + 1) + '. ' + name).join('\n') + '\n\n## Target roles\n' + MASTER_ROLES.join(', ') + '\n\n## Workspace requirements\n' + MASTER_WORKSPACE_ELEMENTS.join(', ') + '\n\n## Architecture decisions\n' + ARCHITECTURE_DECISIONS.map(item => '- ' + item).join('\n') + '\n\n## Earlier source gap register\n' + OPERATING_SYSTEMS.map(os => '- P' + os.priority + ' ' + os.label + ': ' + os.gaps.join(' ')).join('\n') + '\n\nBefore each release: checkpoint, reconcile source and data, implement a complete authorised workflow, test denied access and tenant boundaries, verify browser/mobile behavior, then record acceptance and publication separately.',
    '10-upgrade-package-status.md': '## Implemented in this batch\nEnterprise OS console, source capability and role maps, gap register, twelve-phase roadmap, explicit tenant-scoped counts, board assurance metadata review, bounded exact-reference traceability review and the V2.0 master scope catalogue. CSV exports contain displayed metadata. Reserved ranges, proposed roles and target deliverables are not implemented modules or granted access.\n\n## Still open\nDedicated role workspaces, full schema/API/workflow expansion, domain copilots, report scheduling and remaining operating-system capabilities. Board evidence references are not verified approvals or exact versions.\n\nThis ZIP is the review and planning package, not a deployable full enterprise upgrade. Automated test results and checkpoints are recorded separately in MASTER_TODO.md.',
  };
  Object.entries(docs).forEach(([name, body]) => zip.file(name, caveat + body + '\n'));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'ComplianceHR_Infinity_Enterprise_vNext_Review_Package.zip';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
