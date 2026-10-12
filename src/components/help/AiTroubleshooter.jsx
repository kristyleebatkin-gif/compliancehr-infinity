import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Loader2, CheckCircle2, CircleAlert, Wrench } from 'lucide-react';

export default function AiTroubleshooter({ onAskSupport }) {
  const [problem, setProblem] = useState('');
  const [module_, setModule] = useState('Not sure');
  const [errorMessage, setErrorMessage] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const MODULES = ['Not sure', 'Document Vault', 'Company Safe', 'Staff Profiles', 'Participant Profiles', 'Communication Centre', 'Incident Clinic', 'Risk Reporting', 'Compliance & Report Centre', 'Training Centre', 'Certificates', 'Rostering', 'Invoicing Centre', 'Quote Centre', 'Receipt Hub', 'Goal Progress', 'Emergency Response', 'Meeting Centre', 'Intake', 'Users & Permissions Hub', 'Community & Council', 'Data / uploads', 'Login or access'];

  const run = async () => {
    if (!problem.trim()) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('helpDiagnose', {
        problem: problem.trim(),
        module: module_ === 'Not sure' ? '' : module_,
        error_message: errorMessage.trim(),
      });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'The troubleshooter could not run. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <p className="mb-1 flex items-center gap-2 text-sm font-bold"><Stethoscope className="h-4 w-4 text-brand" />AI troubleshooter - describe the problem and get a fix</p>
          <p className="mb-3 text-xs text-muted-foreground">Tell the troubleshooter what went wrong, where it happened and any error text. It diagnoses the likely cause and gives you ordered steps to fix it yourself - and tells you when to escalate instead.</p>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>What went wrong? *</Label>
              <Input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. The quote PDF downloads but it is missing the participant address" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1.5"><Label>Where in the app</Label>
                <Select value={module_} onValueChange={setModule}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Exact error message (if any)</Label>
                <Input value={errorMessage} onChange={(e) => setErrorMessage(e.target.value)} placeholder="e.g. Failed to save - try again" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={run} disabled={running || !problem.trim()}>
                {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
                {running ? 'Diagnosing...' : 'Diagnose my problem'}
              </Button>
              <Button variant="outline" onClick={onAskSupport}>Raise a support request instead</Button>
            </div>
            {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-bold">Diagnosis</p>
                {result.escalate
                  ? <Badge className="bg-danger/10 text-danger"><CircleAlert className="mr-1 h-3 w-3" />Escalate this one</Badge>
                  : <Badge className="bg-safe/10 text-safe"><CheckCircle2 className="mr-1 h-3 w-3" />Fixable yourself</Badge>}
              </div>
              <p className="text-sm">{result.diagnosis}</p>
              {result.escalate && result.escalate_reason && (
                <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{result.escalate_reason}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="mb-3 text-sm font-bold">Fix steps - follow in order</p>
              <ol className="space-y-2">
                {(result.steps || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{i + 1}</span>
                    <p className="text-sm text-foreground/80">{s}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="mb-3 text-sm font-bold">Other possible causes</p>
              <ul className="space-y-2">
                {(result.likely_causes || []).map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" /><span>{c}</span></li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}