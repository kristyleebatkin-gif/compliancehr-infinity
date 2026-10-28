import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, PlusCircle, Sparkles, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { analyzeNoteForHighValueTriggers } from '@/lib/automaticTaskCompletionEngine';

export async function processShiftNoteAutoTriggersOnSave({
  noteText = '',
  issuesText = '',
  participantName = 'Assigned Participant',
  staffName = '',
  entryDate = '',
  goalText = '',
  autoCreateActions = true,
  autoCreateRisks = false,
}) {
  const combined = `${noteText || ''}\n${issuesText || ''}`.trim();
  const analysis = analyzeNoteForHighValueTriggers(combined);
  const today = entryDate || new Date().toISOString().slice(0, 10);
  const responsible = staffName || 'Assigned Support Coordinator';
  const results = { risksCreated: 0, actionsCreated: 0, shiftTasksClosed: 0 };

  if (autoCreateRisks && analysis.detectedRisks.length > 0) {
    for (const r of analysis.detectedRisks) {
      const docNum = `RSK-SN-${Date.now().toString().slice(-5)}`;
      await base44.entities.Risk.create({
        title: `${r.label} — ${participantName || 'Participant'}`,
        report_type: 'Risk',
        risk_id: docNum,
        document_number: docNum,
        participant_name: participantName || 'Participant',
        category: r.category,
        rating: r.rating,
        likelihood: 'Possible',
        consequence: 'Moderate',
        status: 'Assessed',
        owner: responsible,
        description: `Auto-generated from Shift Note signal "${r.keyword}": ${combined}`,
        control_measures: 'Immediate supervisor notification, support plan review, and active shift monitoring.',
        identified_date: today,
        review_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      }).catch(() => {});
      results.risksCreated += 1;
    }
  }

  if (autoCreateActions && analysis.detectedActions.length > 0) {
    for (const act of analysis.detectedActions) {
      const due = new Date(Date.now() + (act.daysDue || 2) * 86400000).toISOString().slice(0, 10);
      await base44.entities.TodoTask.create({
        title: `${act.title} — ${participantName || 'Participant'}`,
        task_type: 'Review Reminder',
        module: 'Shift Notes',
        assigned_to: responsible,
        task_date: today,
        due_date: due,
        priority: act.priority || 'High',
        status: 'Open',
        notes: `Auto-generated from Shift Note ("${act.phrase}"): ${combined}`,
      }).catch(() => {});
      results.actionsCreated += 1;
    }
  }

  // Shift Automation: if shift note + participant + date exist, auto-close open shift task for this participant
  if (noteText?.trim() && participantName) {
    const openTasks = await base44.entities.TodoTask.filter(
      { status: { $in: ['Open', 'In Progress', 'Pending'] } },
      { sort: '-created_date', limit: 30 }
    ).catch(() => ({ items: [] }));

    const match = (openTasks?.items || []).find(
      (t) =>
        (t.title || '').toLowerCase().includes('shift') &&
        ((t.title || '').toLowerCase().includes(participantName.toLowerCase()) || !t.linked_entity_id)
    );

    if (match) {
      await base44.entities.TodoTask.update(match.id, {
        status: 'Completed',
        completed_date: today,
        completed_by: `${responsible} (Auto-Closed via Shift Note Evidence)`,
        signed_off_by: responsible,
        signed_off_date: today,
        notes: `${match.notes ? match.notes + '\n' : ''}[Auto-Closed] Shift Note${goalText ? ' & Goal Progress' : ''} recorded for ${participantName} on ${today}.`,
      }).catch(() => {});
      results.shiftTasksClosed += 1;
    }
  }

  return results;
}

export default function ShiftNoteAutoDetectionPanel({
  noteText = '',
  issuesText = '',
  participantName = '',
  staffName = '',
  entryDate = '',
  autoCreateActions = true,
  onAutoCreateActionsChange,
  autoCreateRisks = false,
  onAutoCreateRisksChange,
}) {
  const { toast } = useToast();
  const [busyKey, setBusyKey] = useState('');
  const [createdKeys, setCreatedKeys] = useState([]);

  const combined = `${noteText || ''}\n${issuesText || ''}`.trim();
  const analysis = useMemo(() => analyzeNoteForHighValueTriggers(combined), [combined]);
  const today = entryDate || new Date().toISOString().slice(0, 10);
  const responsible = staffName || 'Assigned Support Coordinator';
  const targetParticipant = participantName || 'Selected Participant';

  const handleInstantCreateOrUpdateRisk = async (r) => {
    const key = `risk-${r.keyword}`;
    setBusyKey(key);
    try {
      const existingPage = await base44.entities.Risk.filter(
        participantName ? { participant_name: participantName } : {},
        { sort: '-created_date', limit: 20 }
      ).catch(() => ({ items: [] }));

      const existing = (existingPage?.items || []).find((item) =>
        (item.title || '').toLowerCase().includes(r.keyword) ||
        (item.title || '').toLowerCase().includes(r.label.toLowerCase())
      );

      if (existing) {
        await base44.entities.Risk.update(existing.id, {
          rating: r.rating,
          status: 'Assessed',
          last_assessed_date: today,
          action_log: `${existing.action_log ? existing.action_log + '\n' : ''}[${today}] Updated from Shift Note (${responsible}): ${combined}`,
        });
        toast({
          title: 'Existing Risk Updated from Shift Note',
          description: `Updated "${existing.title}" for ${targetParticipant} in the Risk Register.`,
        });
      } else {
        const docNum = `RSK-SN-${Date.now().toString().slice(-5)}`;
        await base44.entities.Risk.create({
          title: `${r.label} — ${targetParticipant}`,
          report_type: 'Risk',
          risk_id: docNum,
          document_number: docNum,
          participant_name: targetParticipant,
          category: r.category,
          rating: r.rating,
          likelihood: 'Possible',
          consequence: 'Moderate',
          status: 'Assessed',
          owner: responsible,
          description: `Auto-detected from Shift Note signal "${r.keyword}": ${combined}`,
          control_measures: 'Immediate supervisor notification, support plan review, and active shift monitoring.',
          identified_date: today,
          review_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        });
        toast({
          title: `Risk Created & Linked (${docNum})`,
          description: `Added "${r.label}" to the Risk Register and ${targetParticipant}'s Profile.`,
        });
      }
      setCreatedKeys((prev) => [...prev, key]);
    } catch (err) {
      toast({
        title: 'Could not create/update risk',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBusyKey('');
    }
  };

  const handleInstantCreateAction = async (act) => {
    const key = `action-${act.phrase}`;
    setBusyKey(key);
    try {
      const due = new Date(Date.now() + (act.daysDue || 2) * 86400000).toISOString().slice(0, 10);
      await base44.entities.TodoTask.create({
        title: `${act.title} — ${targetParticipant}`,
        task_type: 'Review Reminder',
        module: 'Shift Notes',
        assigned_to: responsible,
        task_date: today,
        due_date: due,
        priority: act.priority || 'High',
        status: 'Open',
        notes: `Auto-generated from Shift Note ("${act.phrase}"): ${combined}`,
      });
      toast({
        title: 'Follow-Up Action Created',
        description: `Assigned to ${responsible} · Due ${due}.`,
      });
      setCreatedKeys((prev) => [...prev, key]);
    } catch (err) {
      toast({
        title: 'Could not create follow-up action',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBusyKey('');
    }
  };

  return (
    <div className="mt-3 rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/50 p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[#5A00D6]" />
          <span className="text-xs font-extrabold text-[#0A2B6D]">
            Automatic Shift Note Risk &amp; Follow-Up Detection Engine
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-[#0072FF] text-white text-[10px]">
            {analysis.detectedRisks.length} Risk Signal(s)
          </Badge>
          <Badge className="bg-[#5A00D6] text-white text-[10px]">
            {analysis.detectedActions.length} Follow-Up Action(s)
          </Badge>
        </div>
      </div>

      {/* Live Risk Prompt */}
      {analysis.hasRiskPrompt ? (
        <div className="rounded-xl border border-rose-300 bg-white p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Would you like to create or update a risk?
            </span>
            {onAutoCreateRisksChange && (
              <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0A2B6D] cursor-pointer">
                <Checkbox
                  checked={autoCreateRisks}
                  onCheckedChange={(v) => onAutoCreateRisksChange(Boolean(v))}
                />
                Auto-create risk when saving note
              </label>
            )}
          </div>
          <div className="space-y-1.5">
            {analysis.detectedRisks.map((r) => {
              const key = `risk-${r.keyword}`;
              const done = createdKeys.includes(key);
              return (
                <div
                  key={r.keyword}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#F5F0FF]/40 px-2.5 py-1.5"
                >
                  <div className="text-xs font-bold text-[#0A2B6D]">
                    Detected <span className="underline">&ldquo;{r.keyword}&rdquo;</span> →{' '}
                    <strong>{r.label}</strong> ({r.category} · {r.rating} Risk)
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleInstantCreateOrUpdateRisk(r)}
                    disabled={busyKey === key || done}
                    className="h-7 px-2.5 text-[11px] font-extrabold"
                  >
                    {done ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-[#00C6FF]" />
                        Risk Recorded
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-3 w-3" />
                        {busyKey === key ? 'Saving…' : 'Create or Update Risk'}
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-[11px] font-semibold text-[#0A2B6D]/80">
          Watching note for clinical &amp; safety signals (<em>aggression, falls, medication issue, behavioural concern, environmental hazard</em>) and follow-up requests (<em>&ldquo;Family requested follow-up&rdquo;</em>).
        </div>
      )}

      {/* Live Follow-Up Action Detection */}
      {analysis.hasActionAutoGen && (
        <div className="rounded-xl border border-sky-300 bg-white p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
              <Zap className="h-4 w-4 text-[#0072FF]" />
              Automatic Follow-Up Action Detected (Action · Responsible Person · Due Date)
            </span>
            {onAutoCreateActionsChange && (
              <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0A2B6D] cursor-pointer">
                <Checkbox
                  checked={autoCreateActions}
                  onCheckedChange={(v) => onAutoCreateActionsChange(Boolean(v))}
                />
                Auto-create action on save
              </label>
            )}
          </div>
          <div className="space-y-1.5">
            {analysis.detectedActions.map((act) => {
              const key = `action-${act.phrase}`;
              const done = createdKeys.includes(key);
              const due = new Date(Date.now() + (act.daysDue || 2) * 86400000).toISOString().slice(0, 10);
              return (
                <div
                  key={act.phrase}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#F5F0FF]/40 px-2.5 py-1.5"
                >
                  <div className="text-xs font-bold text-[#0A2B6D]">
                    <strong>{act.title}</strong> · Responsible: <span className="text-[#5A00D6]">{responsible}</span> · Due: <span className="text-[#0072FF]">{due}</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleInstantCreateAction(act)}
                    disabled={busyKey === key || done}
                    className="h-7 px-2.5 text-[11px] font-extrabold"
                  >
                    {done ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-[#00C6FF]" />
                        Action Created
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-3 w-3" />
                        {busyKey === key ? 'Creating…' : 'Create Action Now'}
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}