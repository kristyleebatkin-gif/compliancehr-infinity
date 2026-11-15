import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ALLOWED_ROLES = [
  'admin',
  'Provider Administrator',
  'Compliance Manager',
  'Compliance Administrator',
  'Quality & Improvement Manager',
  'Management',
  'Administration',
];

const REVIEWS = {
  compliance_review: {
    label: 'Compliance review',
    module: 'Compliance',
    agent: 'Compliance Copilot',
    instruction:
      'Review coverage of the assurance chain. Identify controls with no verified evidence, standards that are unmapped or thinly evidenced, and where the chain from standard to evidence breaks. Judge each control against the obligation it carries.',
  },
  evidence_review: {
    label: 'Evidence review',
    module: 'Evidence',
    agent: 'Evidence Copilot',
    instruction:
      'Review the evidence register. Identify expired, expiring, unverified, unowned or untraceable evidence, and evidence whose confidence score is too weak to support its control. State what an assessor would reject and why.',
  },
  audit_readiness: {
    label: 'Audit readiness',
    module: 'Audit',
    agent: 'Audit Copilot',
    instruction:
      'Assess audit readiness. Score how an external auditor would find this provider today, name the standards most likely to raise a non-conformity, and list the specific records an auditor would ask to see that do not yet exist or are not current.',
  },
  risk_review: {
    label: 'Risk review',
    module: 'Risk',
    agent: 'Risk Copilot',
    instruction:
      'Convert assurance weaknesses into risk exposure. Identify which open findings, evidence gaps and overdue corrective actions create the greatest compliance, clinical, workforce or regulatory risk, and forecast what fails next if they are not addressed.',
  },
};

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    executive_summary: { type: 'string' },
    key_findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          finding: { type: 'string' },
          evidence: { type: 'string' },
          confidence: { type: 'number' },
        },
        required: ['finding'],
      },
    },
    standards_impacted: { type: 'array', items: { type: 'string' } },
    controls_impacted: { type: 'array', items: { type: 'string' } },
    associated_risks: { type: 'array', items: { type: 'string' } },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          priority: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] },
          confidence: { type: 'number' },
          reasoning: { type: 'string' },
          standards: { type: 'array', items: { type: 'string' } },
          controls: { type: 'array', items: { type: 'string' } },
        },
        required: ['action', 'priority', 'reasoning'],
      },
    },
    overall_priority: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] },
    confidence_score: { type: 'number' },
    traceability: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          relationship: { type: 'string' },
          to: { type: 'string' },
        },
        required: ['from', 'relationship', 'to'],
      },
    },
  },
  required: ['executive_summary', 'key_findings', 'recommendations', 'overall_priority', 'confidence_score'],
};

const clip = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '');

function buildContext(controls, evidence, findings, standards) {
  const controlsByCode = new Map(controls.map((control) => [control.id, control]));

  const evidenceByControl = new Map();
  evidence.forEach((item) => {
    if (!item.control_id) return;
    evidenceByControl.set(item.control_id, [...(evidenceByControl.get(item.control_id) || []), item]);
  });

  return {
    standards: standards.map((standard) => ({
      code: standard.standard_code,
      title: clip(standard.standard_title, 90),
      framework: standard.framework,
      area: standard.module_area,
    })),
    controls: controls.map((control) => {
      const linked = evidenceByControl.get(control.id) || [];
      return {
        code: control.standard_code,
        standard: clip(control.standard_title, 70),
        framework: control.framework,
        statement: clip(control.control_statement, 180),
        obligation: clip(control.obligation, 140),
        requirement: clip(control.requirement, 140),
        owner: control.owner || null,
        frequency: control.frequency,
        status: control.status,
        next_test_date: control.next_test_date || null,
        evidence_count: linked.length,
        verified_evidence_count: linked.filter((item) => item.verification_status === 'Verified').length,
      };
    }),
    evidence: evidence.map((item) => ({
      title: clip(item.title, 90),
      type: item.evidence_type,
      control: controlsByCode.get(item.control_id)?.standard_code || null,
      status: item.verification_status,
      valid_to: item.valid_to || null,
      confidence: item.confidence ?? null,
      owner: item.owner || null,
    })),
    findings: findings.map((item) => ({
      title: clip(item.title, 110),
      rating: item.rating,
      source: item.source,
      status: item.status,
      due_date: item.due_date || null,
      control: item.standard_code || controlsByCode.get(item.control_id)?.standard_code || null,
      has_corrective_action: Boolean(item.corrective_action),
      owner: item.owner || null,
    })),
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!ALLOWED_ROLES.includes(user.role)) {
      return Response.json({ error: 'You do not have access to the AI copilots.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const review = REVIEWS[body.action];
    if (!review) {
      return Response.json({ error: 'Choose a review the copilot can run.' }, { status: 400 });
    }
    const question = clip(typeof body.question === 'string' ? body.question : '', 500).trim();

    const startedAt = Date.now();
    const tenantId = user?.data?.tenant_id || '';

    const [standardsPage, controlsPage, evidencePage, findingsPage] = await Promise.all([
      base44.entities.RegulatoryStandard.filter({}, { limit: 60, sort: 'standard_code' }),
      base44.entities.ComplianceControl.filter({}, { limit: 60 }),
      base44.entities.AssuranceEvidence.filter({}, { limit: 80, sort: '-updated_date' }),
      base44.entities.AssuranceFinding.filter({}, { limit: 40, sort: '-updated_date' }),
    ]);

    const standards = standardsPage.items || [];
    const controls = controlsPage.items || [];
    const evidence = evidencePage.items || [];
    const findings = findingsPage.items || [];

    if (!controls.length) {
      return Response.json(
        { error: 'There are no controls registered yet, so there is nothing for the copilot to review.' },
        { status: 400 }
      );
    }

    const context = buildContext(controls, evidence, findings, standards);

    const prompt = [
      'You are the ComplianceHR Infinity intelligence layer for an Australian disability and aged care provider.',
      review.instruction,
      '',
      'Rules:',
      '- Only use the records supplied below. Never invent a standard, control, evidence item, person or date.',
      '- If the records do not support a conclusion, say so in the finding and lower the confidence.',
      '- Confidence is 0-100 and reflects how strongly the supplied records support the conclusion.',
      '- Recommendations must be specific, assignable actions a manager could carry out this week.',
      '- Use Australian English and plain language. Refer to standards by their code.',
      '- Do not claim the provider is compliant or non-compliant. Describe evidence position only.',
      '',
      question ? `Additional request from the user: ${question}` : '',
      '',
      `STANDARDS (${context.standards.length}):`,
      JSON.stringify(context.standards),
      '',
      `CONTROLS (${context.controls.length}):`,
      JSON.stringify(context.controls),
      '',
      `EVIDENCE (${context.evidence.length}):`,
      JSON.stringify(context.evidence),
      '',
      `FINDINGS (${context.findings.length}):`,
      JSON.stringify(context.findings),
    ]
      .filter(Boolean)
      .join('\n');

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: RESPONSE_SCHEMA,
    });

    const durationMs = Date.now() - startedAt;
    const summary = clip(analysis?.executive_summary || 'Review completed.', 600);
    const overallConfidence = Number(analysis?.confidence_score) || 0;
    const recommendations = Array.isArray(analysis?.recommendations) ? analysis.recommendations.slice(0, 5) : [];
    const traceability = Array.isArray(analysis?.traceability) ? analysis.traceability.slice(0, 12) : [];

    const created = [];
    for (const item of recommendations) {
      const record = await base44.entities.AiRecommendation
        .create({
          tenant_id: tenantId,
          title: clip(item.action, 140),
          module: review.module,
          agent_name: review.agent,
          recommendation_type: review.label,
          recommendation: item.action,
          reasoning: clip(item.reasoning, 1500),
          executive_summary: summary,
          confidence: Number(item.confidence) || overallConfidence,
          priority: item.priority || analysis?.overall_priority || 'Medium',
          status: 'Awaiting review',
          standard_refs: (item.standards || analysis?.standards_impacted || []).join(', '),
          control_refs: (item.controls || analysis?.controls_impacted || []).join(', '),
          risk_refs: (analysis?.associated_risks || []).join('; '),
          evidence_refs: (analysis?.key_findings || [])
            .map((finding) => finding.evidence)
            .filter(Boolean)
            .slice(0, 6)
            .join('; '),
          traceability: traceability.map((link) => `${link.from} ${link.relationship} ${link.to}`).join(' → '),
        })
        .catch(() => null);
      if (record) created.push(record);
    }

    const interaction = await base44.asServiceRole.entities.AiInteraction
      .create({
        tenant_id: tenantId,
        agent_name: review.agent,
        module: review.module,
        interaction_type: review.label,
        model: 'automatic',
        user_email: user.email || '',
        question: question || review.instruction,
        response_summary: summary,
        confidence: overallConfidence,
        source_count: controls.length + evidence.length + findings.length,
        duration_ms: durationMs,
        flagged: false,
        override: false,
      })
      .catch(() => null);

    return Response.json({
      review: {
        label: review.label,
        agent: review.agent,
        module: review.module,
        executive_summary: summary,
        key_findings: analysis?.key_findings || [],
        standards_impacted: analysis?.standards_impacted || [],
        controls_impacted: analysis?.controls_impacted || [],
        associated_risks: analysis?.associated_risks || [],
        recommendations,
        overall_priority: analysis?.overall_priority || 'Medium',
        confidence_score: overallConfidence,
        traceability,
      },
      registers: {
        standards: standards.length,
        controls: controls.length,
        evidence: evidence.length,
        findings: findings.length,
      },
      duration_ms: durationMs,
      recommendation_ids: created.map((record) => record.id),
      interaction_id: interaction?.id || null,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'The copilot could not complete this review.' }, { status: 500 });
  }
}