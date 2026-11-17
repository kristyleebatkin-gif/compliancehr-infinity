import { base44 } from '@/api/base44Client';
export async function readServiceEvidence(shifts) {
  if (!shifts.length) return { items: [], error: null };
  try {
    const response = await base44.functions.invoke('shiftServiceEvidence', { action: 'assess', shift_ids: shifts.map(shift => shift.id) });
    const rows = response.data?.rows;
    const expected = new Set(shifts.map(shift => shift.id));
    if (!Array.isArray(rows) || rows.length !== expected.size || new Set(rows.map(row => row.shift_id)).size !== expected.size || rows.some(row => !expected.has(row.shift_id) || !['linked', 'unlinked', 'changed', 'invalid', 'conflict'].includes(row.state))) throw new Error(response.data?.error || 'Service evidence response was incomplete.');
    return { items: rows, error: null };
  } catch (error) {
    return { items: [], error: error.response?.data?.error || error.message || 'Service evidence unavailable.' };
  }
}
