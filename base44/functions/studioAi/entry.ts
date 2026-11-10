import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { authorizeAndLogAiAction } from '../../shared/aiGovernance.ts';
import { ALL_ROLES } from '../../shared/roleMatrix.ts';

// Narrow AI helper for Sherelle's Today workbench.
// One hardcoded Core method, a whitelisted task list and bounded inputs only.

const TASKS = ['chat', 'copy', 'crm', 'meeting'];
const clip = (value: any, max: number) => String(value ?? '').trim().slice(0, max);

const VOICE = `You write for ComplianceHR Infinity, an Australian NDIS and aged care provider platform run by Sherelle (Administration Lead).
Rules: Australian English spelling; warm, clear, professional; no corporate filler; never invent facts, names, figures, dates, legislation or clinical detail; no square-bracket placeholders; keep it practical.`;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const task = String(body.task || 'chat');

    if (!TASKS.includes(task)) {
      return Response.json({ error: 'Unsupported task.' }, { status: 400 });
    }

    const gate = await authorizeAndLogAiAction(base44, {
      feature: 'studioAi',
      allowedRoles: ALL_ROLES,
      recordTitle: `Today workbench — ${task}`,
    });
    if (!gate.authorized) return gate.response;

    if (task === 'chat') {
      const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
      const turns = messages
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && clip(m.content, 2000))
        .map((m: any) => `${m.role === 'user' ? 'Sherelle' : 'Assistant'}: ${clip(m.content, 2000)}`);

      if (!turns.length) {
        return Response.json({ error: 'Ask a question first.' }, { status: 400 });
      }

      const context = clip(body.context, 600);
      const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `${VOICE}

You are Sherelle's in-app assistant inside her daily operations dashboard. Answer in plain conversational text (short paragraphs or simple dash-dot lists). Be concise unless asked for detail. If she asks for a document, draft it in full. If something needs a human decision or compliance sign-off, say so plainly.

Today's dashboard snapshot: ${context || 'no snapshot available'}

Conversation so far:
${turns.join('\n')}

Assistant:`,
      });

      await gate.logSuccess(`Assistant reply for "${clip(body.messages?.slice(-1)?.[0]?.content, 80)}"`);
      return Response.json({ reply: String(reply || '').trim() });
    }

    if (task === 'copy') {
      const brief = clip(body.brief, 600);
      if (!brief) return Response.json({ error: 'Describe what the design is for.' }, { status: 400 });
      const format = clip(body.format, 60) || 'social post';

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `${VOICE}

Write copy for a ${format} promoting this: ${brief}

Keep the headline under 60 characters, the subhead under 140 characters and the contact line under 90 characters.`,
        response_json_schema: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            subhead: { type: 'string' },
            footer: { type: 'string' },
          },
          required: ['headline', 'subhead', 'footer'],
        },
      });

      await gate.logSuccess(`Design copy drafted for "${clip(brief, 60)}"`);
      return Response.json(result);
    }

    if (task === 'crm') {
      const lead = body.lead && typeof body.lead === 'object' ? body.lead : {};
      const name = clip(lead.name, 120);
      if (!name) return Response.json({ error: 'Select a lead first.' }, { status: 400 });

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `${VOICE}

You are advising on an NDIS/aged care pipeline enquiry.
Organisation or person: ${name}
Contact: ${clip(lead.contact, 120) || 'not recorded'}
Interested in: ${clip(lead.interest, 240) || 'not recorded'}
Stage: ${clip(lead.stage, 40) || 'New'}
Estimated value: ${clip(lead.value, 20) || 'not recorded'}
Follow-up date: ${clip(lead.followUp, 20) || 'not set'}
Notes: ${clip(lead.notes, 800) || 'none recorded'}

Give the single best next step, then a ready-to-send follow-up email (subject and body). The email must be short, specific and honest, and must not promise pricing or services that are not recorded above.`,
        response_json_schema: {
          type: 'object',
          properties: {
            next_step: { type: 'string' },
            email_subject: { type: 'string' },
            email_body: { type: 'string' },
          },
          required: ['next_step', 'email_subject', 'email_body'],
        },
      });

      await gate.logSuccess(`CRM guidance for "${name}"`);
      return Response.json(result);
    }

    const transcript = clip(body.transcript, 30000);
    if (transcript.length < 40) {
      return Response.json({ error: 'Add or record a longer transcript first.' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${VOICE}

Summarise this meeting transcript. Only use what is in the transcript; if an owner or date is not stated, leave that field as an empty string.

Transcript:
${transcript}`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Two to four sentences of what was discussed and agreed' },
          decisions: { type: 'string', description: 'Decisions made, one per line, or empty string' },
          actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                owner: { type: 'string' },
                due: { type: 'string' },
              },
              required: ['action'],
            },
          },
        },
        required: ['summary', 'actions'],
      },
    });

    await gate.logSuccess('Meeting transcript summarised');
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The assistant could not complete that.' }, { status: 500 });
  }
}