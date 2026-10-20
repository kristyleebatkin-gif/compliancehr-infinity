import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  X, BookOpen, ClipboardCheck, Award, ShieldCheck, Info,
  CheckCircle2, XCircle, Lock,
} from 'lucide-react';
import { getModuleFull, getModuleByNumber, LMS_ACADEMY_NAME, LMS_PROGRAM_NAME } from '@/lib/lmsCurriculum';
import { getCompetencyChecklist, COMPETENCY_CHECKLIST_TITLE } from '@/lib/lmsCompetencyChecklists';
import ProfessionalCertificate from '@/components/training/ProfessionalCertificate';
import { buildCertificatePdfBlob } from '@/lib/certificatePdf';

const STAGES = [
  { k: 'overview', label: 'Overview', icon: Info },
  { k: 'guide', label: 'Learner Guide', icon: BookOpen },
  { k: 'quiz', label: 'Knowledge Quiz', icon: ClipboardCheck },
  { k: 'supervisor', label: 'Supervisor', icon: ShieldCheck },
  { k: 'certificate', label: 'Certificate', icon: Award },
];

export default function LmsLearner({ moduleNumber, user, onCompleted, onClose }) {
  const { toast } = useToast();
  const module = getModuleFull(getModuleByNumber(moduleNumber));
  const competency = getCompetencyChecklist(module.number);
  const supervisorItems = competency ? competency.items : (module.supervisorChecklist || module.supervisor);
  const [stage, setStage] = useState('overview');
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [supervisor, setSupervisor] = useState(supervisorItems.map(() => false));
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorComments, setSupervisorComments] = useState('');
  const [outcome, setOutcome] = useState('');
  const [learnerName, setLearnerName] = useState(user?.full_name || '');
  const [companyName, setCompanyName] = useState('ComplianceHR');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState(false);
  const certNumber = `CHR-${module.number.toString().padStart(3, '0')}-${Date.now().toString().slice(-5)}`;
  const issueDate = new Date().toISOString().slice(0, 10);

  const passMark = module.pass_mark || 80;
  const passed = score !== null && score >= passMark;
  const supervisorDone = supervisor.every(Boolean);
  const outcomeConfirmed = outcome === 'Competent';
  const canComplete = passed && supervisorDone && outcomeConfirmed;

  const submitQuiz = () => {
    let correct = 0;
    module.quiz.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore(Math.round((correct / module.quiz.length) * 100));
  };

  const generateCertificate = async () => {
    setBusy(true);
    try {
      const today = new Date();
      const expiry = new Date(today); expiry.setMonth(expiry.getMonth() + (module.validity_months || 12));
      const reminder = new Date(expiry); reminder.setDate(reminder.getDate() - 30);
      const certNum = certNumber;
      const learnerType = user?.role === 'Participant' ? 'Participant' : 'Employee';
      let staffProfile = null;
      if (learnerType === 'Employee' && user?.id) {
        const linkedProfiles = await base44.entities.StaffProfile.filter({ linked_user_id: user.id });
        if (linkedProfiles.length) staffProfile = linkedProfiles[0];
        else if (user.email) {
          const emailProfiles = await base44.entities.StaffProfile.filter({ email: user.email });
          staffProfile = emailProfiles[0] || null;
          if (!staffProfile) {
            const escaped = user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const profiles = await base44.entities.StaffProfile.filter(
              { email: { $regex: `^${escaped}$`, $options: 'i' } },
              { limit: 1 },
            );
            staffProfile = (profiles.items || profiles)[0] || null;
          }
        }
      }
      if (learnerType === 'Employee' && !staffProfile) {
        throw new Error('Your login is not linked to an Employee Profile. Link the profile before issuing this certificate.');
      }
      const staffProfileId = staffProfile?.id || '';
      const finalLearnerName = staffProfile?.full_name || learnerName.trim() || user?.full_name || 'Learner';
      const completion = await base44.entities.TrainingCompletion.create({
        employee_id: learnerType === 'Employee' ? staffProfileId : '',
        employee_name: finalLearnerName,
        learner_type: learnerType,
        learner_id: user?.id || '',
        learner_name: finalLearnerName,
        company_name: companyName.trim() || 'ComplianceHR',
        training_module_id: `LMS-${module.number}`,
        module_title: module.title,
        completed_date: today.toISOString().slice(0, 10),
        expiry_date: expiry.toISOString().slice(0, 10),
        score,
        certificate_number: certNum,
        status: 'Completed',
      });
      const certRecord = await base44.entities.Certificate.create({
        certificate_number: certNum,
        staff_id: learnerType === 'Employee' ? staffProfileId : '',
        staff_name: finalLearnerName,
        training_module_id: `LMS-${module.number}`,
        module_title: module.title,
        issue_date: today.toISOString().slice(0, 10),
        expiry_date: expiry.toISOString().slice(0, 10),
        score,
        status: 'Current',
        issued_by: `${companyName.trim() || 'ComplianceHR'} Training Hub`,
      });
      // Generate the certificate PDF and attach it to the employee's certificate record
      try {
        const blob = await buildCertificatePdfBlob({
          learnerName: finalLearnerName,
          companyName: companyName.trim() || 'ComplianceHR',
          moduleTitle: module.title,
          moduleNumber: module.number,
          group: module.group,
          date: issueDate,
          score,
          validityMonths: module.validity_months,
          certificateNumber: certNum,
          academyName: LMS_ACADEMY_NAME,
          programName: LMS_PROGRAM_NAME,
        });
        const file = new File([blob], `${module.title.replace(/[^a-zA-Z0-9]/g, '_')}_${certNum}.pdf`, { type: 'application/pdf' });
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        await base44.entities.Certificate.update(certRecord.id, { file_url });
      } catch (e) {
        console.error('Certificate file upload failed', e);
      }
      await base44.entities.Register.create({
        register_type: 'Training Register',
        entry_title: `${module.title} — ${finalLearnerName}`,
        entry_id: certNum,
        status: 'Completed',
        recorded_date: today.toISOString().slice(0, 10),
        owner: finalLearnerName,
        linked_entity_type: 'TrainingCompletion',
        linked_entity_id: completion.id,
      });
      await base44.entities.TodoTask.create({
        title: `${module.title} — 12 month renewal`,
        task_type: 'Training Renewal',
        assigned_to: finalLearnerName,
        due_date: reminder.toISOString().slice(0, 10),
        status: 'Open',
        priority: 'Medium',
        linked_entity_type: 'TrainingCompletion',
        linked_entity_id: completion.id,
        notes: `Renewal reminder for ${module.title}. Certificate ${certNum} expires ${expiry.toISOString().slice(0, 10)}.`,
      });
      await base44.entities.AuditLog.create({
        action: 'Training Completed',
        entity_type: 'TrainingCompletion',
        record_title: `${module.title} — ${finalLearnerName}`,
        performed_by: finalLearnerName,
      });
      setIssued(true);
      toast({ title: 'Certificate issued!', description: `${module.title} — ${certNum}` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to issue certificate', description: err.message, variant: 'destructive' });
    }
    setBusy(false);
  };

  const resetQuiz = () => { setAnswers({}); setScore(null); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-card shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-100">Module {module.number} · {module.group}</div>
              <h3 className="text-lg font-bold">{module.title}</h3>
            </div>
            <button onClick={() => { if (issued) onCompleted?.(); onClose(); }} className="rounded-lg p-1.5 hover:bg-white/15"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 flex gap-1 overflow-x-auto rounded-lg bg-white/10 p-1 backdrop-blur">
            {STAGES.map((s) => {
              const Icon = s.icon;
              const locked = (s.k === 'supervisor' || s.k === 'certificate') && !passed;
              return (
                <button key={s.k} disabled={locked} onClick={() => setStage(s.k)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${stage === s.k ? 'bg-white text-violet-700 shadow-sm' : 'text-white/70 hover:text-white'} ${locked ? 'opacity-40' : ''}`}>
                  {locked ? <Lock className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}{s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {stage === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-r from-violet-100/70 to-cyan-100/70 p-4 text-sm text-foreground/70 dark:from-violet-950/30 dark:to-cyan-950/30">{module.description}</div>
              <div>
                <div className="mb-2 text-sm font-semibold">Learning objectives</div>
                <ul className="space-y-1.5">
                  {module.objectives.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" />{o}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">Module components</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {module.components.map((c) => (
                    <div key={c} className="flex items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1.5 text-xs text-foreground/60">
                      <CheckCircle2 className="h-3 w-3 text-brand" />{c}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs text-white">
                <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 p-3 shadow-md"><div className="text-base font-bold">{module.duration_hours}h</div><div className="text-[11px] text-white/80">Duration</div></div>
                <div className="rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 p-3 shadow-md"><div className="text-base font-bold">{module.validity_months}m</div><div className="text-[11px] text-white/80">Valid</div></div>
                <div className="rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 p-3 shadow-md"><div className="text-base font-bold">{module.pass_mark}%</div><div className="text-[11px] text-white/80">Pass mark</div></div>
              </div>
              <button onClick={() => setStage('guide')} className="w-full rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Start Learner Guide</button>
            </div>
          )}

          {stage === 'guide' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/40 p-4 text-sm leading-relaxed text-foreground/70">{module.guide}</div>
              <div>
                <div className="mb-2 text-sm font-semibold">Workplace scenarios</div>
                <div className="space-y-2">
                  {module.scenarios.map((s, i) => (
                    <div key={i} className="rounded-lg border border-border/60 p-3 text-sm text-foreground/70">
                      <div className="mb-1 text-xs font-semibold text-brand">Scenario {i + 1}</div>{s}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setStage('quiz')} className="w-full rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Continue to Quiz</button>
            </div>
          )}

          {stage === 'quiz' && (
            <div className="space-y-4">
              {module.quiz.map((q, i) => (
                <div key={i} className="rounded-lg border border-border/60 p-3">
                  <div className="mb-2 text-sm font-medium">{i + 1}. {q.q}</div>
                  <div className="grid gap-2">
                    {q.options.map((o) => (
                      <button key={o} onClick={() => setAnswers({ ...answers, [i]: o })}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium text-left transition ${answers[i] === o ? 'border-violet-500 bg-violet-500/10 text-violet-700 shadow-sm dark:text-violet-300' : 'border-border hover:bg-muted'}`}>{o}</button>
                    ))}
                  </div>
                  {score !== null && q.explanation && (
                    <div className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-xs text-foreground/60">
                      <span className="font-semibold text-foreground/70">{answers[i] === q.answer ? 'Correct' : 'Answer'}:</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
              {score !== null && (
                <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${passed ? 'bg-safe/10 text-safe' : 'bg-danger/10 text-danger'}`}>
                  {passed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  <div>
                    <div className="font-semibold">Score: {score}%</div>
                    <div className="text-xs">{passed ? 'You passed — continue to supervisor sign-off.' : `You need ${passMark}% to pass. Review the guide and retry.`}</div>
                  </div>
                </div>
              )}
              {score === null ? (
                <button onClick={submitQuiz} disabled={Object.keys(answers).length < module.quiz.length}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">Submit Quiz</button>
              ) : passed ? (
                <button onClick={() => setStage('supervisor')} className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Continue to Supervisor Sign-off</button>
              ) : (
                <button onClick={resetQuiz} className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white">Retry Quiz</button>
              )}
            </div>
          )}

          {stage === 'supervisor' && (
            <div className="space-y-4">
              {competency && (
                <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-brand">Compliance NQ™ Safeguarding Essentials™</div>
                  <div className="text-sm font-semibold">{COMPETENCY_CHECKLIST_TITLE}</div>
                  <div className="text-xs text-foreground/50">Module {module.number} — {competency.module}</div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground/70">Employee</label>
                  <input value={learnerName} onChange={(e) => setLearnerName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground/70">Date</label>
                  <input value={issueDate} readOnly className="w-full rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground/70">Supervisor</label>
                  <input value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} placeholder="Supervisor name" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
                </div>
              </div>
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto] gap-2 bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground/60">
                  <div>Competency</div><div className="text-right">Achieved</div>
                </div>
                <div className="divide-y divide-border/40">
                  {supervisorItems.map((s, i) => (
                    <label key={i} className="grid grid-cols-[1fr_auto] gap-2 items-start px-3 py-2.5 cursor-pointer hover:bg-muted/20">
                      <span className="text-sm text-foreground/70">{s}</span>
                      <input type="checkbox" checked={supervisor[i]} onChange={(e) => setSupervisor(supervisor.map((v, j) => j === i ? e.target.checked : v))} className="h-4 w-4 rounded border-border accent-safe justify-self-end" />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground/70">Supervisor comments</label>
                <textarea value={supervisorComments} onChange={(e) => setSupervisorComments(e.target.value)} rows={3} placeholder="Comments on competency demonstration..." className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
              </div>
              <div>
                <div className="mb-1.5 text-xs font-semibold text-foreground/70">Outcome</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setOutcome('Competent')} className={`rounded-lg border px-3 py-2 text-sm font-medium ${outcome === 'Competent' ? 'border-safe bg-safe/10 text-safe' : 'border-border hover:bg-muted'}`}>Competent</button>
                  <button onClick={() => setOutcome('Further Training Required')} className={`rounded-lg border px-3 py-2 text-sm font-medium ${outcome === 'Further Training Required' ? 'border-warning bg-warning/10 text-warning' : 'border-border hover:bg-muted'}`}>Further Training Required</button>
                </div>
              </div>
              <button onClick={() => setStage('certificate')} disabled={!canComplete}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">Continue to Certificate</button>
              {!canComplete && <div className="text-center text-xs text-foreground/40">Complete the quiz, all competencies and confirm a Competent outcome to unlock your certificate.</div>}
            </div>
          )}

          {stage === 'certificate' && (
            <div className="space-y-4">
              {canComplete ? (
                <>
                  <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:grid-cols-2">
                    <div><label className="mb-1 block text-xs font-semibold text-foreground/70">Employee / Participant Name</label><input value={learnerName} onChange={(e) => setLearnerName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
                    <div><label className="mb-1 block text-xs font-semibold text-foreground/70">Company Name</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>
                  </div>
                  <ProfessionalCertificate
                    learnerName={learnerName || 'Learner'}
                    companyName={companyName || 'ComplianceHR'}
                    moduleTitle={module.title}
                    moduleNumber={module.number}
                    group={module.group}
                    date={issueDate}
                    score={score}
                    validityMonths={module.validity_months}
                    certificateNumber={certNumber}
                    academyName={LMS_ACADEMY_NAME}
                    programName={LMS_PROGRAM_NAME}
                  />
                  {issued ? (
                    <div className="rounded-lg bg-safe/10 p-3 text-center text-sm text-safe">
                      <CheckCircle2 className="mx-auto mb-1 h-5 w-5" />
                      Certificate issued and saved to your training records.
                    </div>
                  ) : (
                    <button onClick={generateCertificate} disabled={busy}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                      {busy ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Award className="h-4 w-4" />}
                      {busy ? 'Issuing...' : 'Issue & Save Certificate'}
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-foreground/40"><Award className="h-8 w-8" /></div>
                  <div>
                    <div className="text-lg font-semibold">Certificate of Completion</div>
                    <div className="text-sm text-foreground/50">{module.title}</div>
                  </div>
                  <div className="text-xs text-foreground/40">Quiz and supervisor sign-off must be complete to unlock your certificate.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}