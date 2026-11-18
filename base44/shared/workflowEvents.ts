/**
 * One append-only workflow fact, written the same way wherever a run moves.
 * The sequence is per run and derived from the events already recorded, so a reader can
 * re-order a run without trusting a timestamp.
 */
export async function appendWorkflowEvent(read: any, write: any, payload: Record<string, unknown>) {
  const counted = await read.WorkflowEvent.count({ instance_id: payload.instance_id });
  const total = typeof counted === 'number' ? counted : Number((counted as any)?.count) || 0;
  return write.WorkflowEvent.create({ ...payload, sequence: total + 1, occurred_at: new Date().toISOString() });
}