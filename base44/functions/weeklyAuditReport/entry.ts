import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { collectComplianceScore, canViewComplianceScore } from '../../shared/complianceScoreCalc.ts';

// Automated weekly compliance audit: snapshots the live compliance score and
// every monitored control into an AuditReport record, saved directly to the
// Compliance Hub. Triggered weekly by a scheduled workflow, or on demand with
// "Generate now" from the Weekly Audit Reports tab.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canViewComplianceScore(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const service = base44.asServiceRole;

    const today = new Date().toISOString().slice(0, 10);

    // One automated report per day, maximum.
    const existing = await service.entities.AuditReport.filter({ audit_date: today }, { limit: 100, fields: ['generated_by'] });
    if ((existing.items || []).some((r) => r.generated_by === 'Automated weekly audit')) {
      return Response.json({ ok: true, skipped: true, reason: 'A weekly audit report for today already exists.' });
    }

    const result = await collectComplianceScore(service);

    // Map each monitored control onto a PDF-ready audit section.
    const sections = result.controls.map((c) => ({
      title: c.label,
      status: c.status === 'pass' ? 'Compliant' : c.status === 'attention' ? 'Needs Attention' : 'At Risk',
      readiness: Math.max(0, 100 - c.penalty),
      lines: [c.detail, `Source: ${c.source}`],
    }));

    const problems = result.controls.filter((c) => c.status !== 'pass');
    const findings = problems.length
      ? problems.map((c) => `${c.label}: ${c.detail}`).join('. ')
      : 'All monitored compliance controls were compliant at audit time.';

    const byKey = Object.fromEntries(result.controls.map((c) => [c.key, Math.max(0, 100 - c.penalty)]));

    const record = await service.entities.AuditReport.create({
      audit_date: today,
      readiness_score: result.score,
      staff_files_score: byKey.staff_docs ?? null,
      policies_score: byKey.documents ?? null,
      risk_score: byKey.risks ?? null,
      status: 'Generated',
      findings,
      generated_by: 'Automated weekly audit',
      notes: `Automated weekly compliance health audit, week ending ${today}. ${result.registers_monitored} registers monitored.`,
      metrics: JSON.stringify({
        score: result.score,
        penalty_total: result.penalty_total,
        registers_monitored: result.registers_monitored,
        generated_at: result.generated_at,
        sections,
      }),
    });

    return Response.json({
      ok: true,
      skipped: false,
      report_id: record?.id || null,
      score: result.score,
      sections_at_risk: sections.filter((s) => s.status === 'At Risk').length,
      sections_attention: sections.filter((s) => s.status === 'Needs Attention').length,
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}