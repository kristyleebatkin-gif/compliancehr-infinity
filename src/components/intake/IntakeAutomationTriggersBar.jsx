import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, ClipboardCheck, Sparkles, UserCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  autoGenerateThreeMonthParticipantReview,
  autoGenerateNewEmployeeCompetencies,
} from '@/lib/automaticTaskCompletionEngine';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

export default function IntakeAutomationTriggersBar({
  intakeType = 'All',
  activeCase = null,
  user = null,
  autoRunOnConvert = true,
  onAutoRunOnConvertChange,
}) {
  const { toast } = useToast();
  const [participantName, setParticipantName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [busyMode, setBusyMode] = useState('');
  const [lastTriggered, setLastTriggered] = useState('');

  const resolvedParticipant =
    (intakeType === 'Participant' && activeCase?.applicant_name) ||
    participantName.trim() ||
    'New Intake Participant';

  const resolvedEmployee =
    (intakeType === 'Employee' && activeCase?.applicant_name) ||
    employeeName.trim() ||
    'New Intake Employee';

  const handleRun3MonthReview = async () => {
    setBusyMode('3m');
    try {
      const coordinator =
        activeCase?.support_coordinator ||
        activeCase?.assigned_to ||
        user?.full_name ||
        'Assigned Support Coordinator';
      const res = await autoGenerateThreeMonthParticipantReview(resolvedParticipant, coordinator, user);
      setLastTriggered(
        `3-Month Review (${res.stamp}) created for ${res.participantName}, assigned to ${res.assignedOfficer}, scheduled for ${res.reviewDate}, and reminder sent.`
      );
      toast({
        title: `3-Month Review Scheduled (${res.stamp})`,
        description: `Created for ${res.participantName} · Assigned to ${res.assignedOfficer} · Due ${res.reviewDate} · Reminder dispatched.`,
      });
    } catch (err) {
      toast({
        title: 'Could not auto-generate 3-month review',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBusyMode('');
    }
  };

  const handleRunEmployeeCompetencies = async () => {
    setBusyMode('emp');
    try {
      const res = await autoGenerateNewEmployeeCompetencies(resolvedEmployee, user);
      setLastTriggered(
        `Assigned ${res.assignedCount} onboarding items (Induction, Skills Assessments, Mandatory Policies & Competencies) to ${res.employeeName} (Due ${res.due}).`
      );
      toast({
        title: `Auto-Assigned ${res.assignedCount} Competencies & Induction`,
        description: `Induction, Skills Assessments, Policies & Competencies assigned to ${res.employeeName} (Due ${res.due}).`,
      });
    } catch (err) {
      toast({
        title: 'Could not auto-assign competencies',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBusyMode('');
    }
  };

  const showParticipantTrigger = intakeType === 'All' || intakeType === 'Participant';
  const showEmployeeTrigger = intakeType === 'All' || intakeType === 'Employee';

  return (
    <section
      aria-label="Automatic Intake Review & Competency Assignment Triggers"
      className="rounded-3xl p-[2.5px] shadow-panel"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="rounded-[21px] bg-white p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2B6D] px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3 text-[#00C6FF]" />
              <span>Intake Automation Triggers</span>
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
              Auto-Generate 3-Month Participant Reviews &amp; New Employee Competency Bundles
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onAutoRunOnConvertChange && (
              <label className="inline-flex items-center gap-1.5 rounded-full border border-[#0A2B6D]/25 bg-[#F5F0FF] px-3 py-1 text-[11px] font-extrabold text-[#0A2B6D] cursor-pointer">
                <Checkbox
                  checked={autoRunOnConvert}
                  onCheckedChange={(v) => onAutoRunOnConvertChange(Boolean(v))}
                />
                <span>Auto-trigger on Intake Case Approval &amp; Profile Conversion</span>
              </label>
            )}
            <Badge className="bg-emerald-600 text-white text-[10px]">Zero-Click Onboarding</Badge>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 gap-3 ${
            showParticipantTrigger && showEmployeeTrigger ? 'md:grid-cols-2' : ''
          }`}
        >
          {showParticipantTrigger && (
            <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 flex flex-col justify-between space-y-2.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
                    <CalendarClock className="h-4 w-4 text-[#0072FF]" />
                    Auto-Generate 3-Month Participant Review
                  </span>
                  <Badge className="bg-[#0072FF] text-white text-[10px]">3-Month Milestone</Badge>
                </div>
                <p className="text-[11px] font-semibold text-[#0A2B6D]/80">
                  When a participant is onboarded or hits 3 months: Review created · Assigned to coordinator · Scheduled in calendar · Reminder sent.
                </p>
                {!activeCase?.applicant_name && (
                  <Input
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Participant name (or select a case below)…"
                    className="h-8 text-xs font-bold"
                  />
                )}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {['✓ Review Created', '✓ Assigned', '✓ Scheduled', '✓ Reminder Sent'].map((step) => (
                    <span
                      key={step}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900"
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                <span className="text-[10.5px] font-extrabold text-[#5A00D6]">
                  Target: {resolvedParticipant}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleRun3MonthReview}
                    disabled={busyMode === '3m'}
                    className="h-7 px-3 text-[11px] font-extrabold"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5 text-[#00C6FF]" />
                    {busyMode === '3m' ? 'Scheduling…' : 'Trigger 3-Month Review Now'}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="h-7 px-2.5 text-[11px] font-extrabold">
                    <Link to="/review-due">Review Board →</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showEmployeeTrigger && (
            <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 flex flex-col justify-between space-y-2.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
                    <UserCheck className="h-4 w-4 text-[#5A00D6]" />
                    Auto-Generate New Employee Competencies
                  </span>
                  <Badge className="bg-[#5A00D6] text-white text-[10px]">Workforce Start Trigger</Badge>
                </div>
                <p className="text-[11px] font-semibold text-[#0A2B6D]/80">
                  When a new employee starts: Induction assigned · Skills assessments assigned · Mandatory policies assigned · Clinical competencies assigned.
                </p>
                {!activeCase?.applicant_name && (
                  <Input
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Employee name (or select a case below)…"
                    className="h-8 text-xs font-bold"
                  />
                )}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {[
                    '✓ Induction Assigned',
                    '✓ Skills Assessments Assigned',
                    '✓ Policies Assigned',
                    '✓ Competencies Assigned',
                  ].map((step) => (
                    <span
                      key={step}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900"
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                <span className="text-[10.5px] font-extrabold text-[#0072FF]">
                  Target: {resolvedEmployee}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleRunEmployeeCompetencies}
                    disabled={busyMode === 'emp'}
                    className="h-7 px-3 text-[11px] font-extrabold"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#00C6FF]" />
                    {busyMode === 'emp' ? 'Assigning…' : 'Trigger Competency Bundle Now'}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="h-7 px-2.5 text-[11px] font-extrabold">
                    <Link to="/training">Training Hub →</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {lastTriggered && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{lastTriggered}</span>
          </div>
        )}
      </div>
    </section>
  );
}