import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useOfflineCapture, getQueue, removeQueued } from '@/lib/offlineCapture';
import { format } from 'date-fns';
import { CheckCircle2, ClipboardCheck, CloudOff, Loader2, RefreshCw, ShieldAlert, Trash2, Wifi, WifiOff } from 'lucide-react';

const CHECK_TYPES = ['Smoke Alarm Test', 'Fire Safety Equipment Check', 'Fire Extinguisher Check', 'Emergency Lighting Test', 'Natural Disaster Kit Check', 'First Aid Kit Check', 'First Aid Check', 'MSDS Review', 'Evacuation Drill', 'Other'];

const today = () => format(new Date(), 'yyyy-MM-dd');

// SafetyCulture-style field capture: big touch targets, works with no signal,
// and everything captured offline syncs to the registers automatically on reconnect.
export default function OfflineFieldCapture() {
  const { online, queuedCount, syncing, sync, save } = useOfflineCapture();
  const { toast } = useToast();
  const [takeFive, setTakeFive] = useState({ task: '', location: '', worker_name: '', hazards_identified: '', control_measures: '', assessment_date: today(), safe_to_proceed: true });
  const [check, setCheck] = useState({ title: '', check_type: 'Smoke Alarm Test', location: '', date_completed: today(), result: 'Pass', issues_found: '', notes: '' });
  const [queued, setQueued] = useState(getQueue());

  const refreshQueued = () => setQueued(getQueue());

  const saveTakeFive = async (e) => {
    e.preventDefault();
    if (!takeFive.task.trim()) return;
    const result = await save('TakeFive', takeFive);
    setTakeFive({ task: '', location: '', worker_name: '', hazards_identified: '', control_measures: '', assessment_date: today(), safe_to_proceed: true });
    toast({ title: result.stored === 'offline' ? 'Captured offline' : 'Take Five saved', description: result.stored === 'offline' ? 'Saved on this device. It syncs to the register automatically when you are back online.' : 'Saved to the Take Five register and administrators alerted.' });
    refreshQueued();
  };

  const saveCheck = async (e) => {
    e.preventDefault();
    if (!check.title.trim()) return;
    const result = await save('SafetyCheck', check);
    setCheck({ title: '', check_type: 'Smoke Alarm Test', location: '', date_completed: today(), result: 'Pass', issues_found: '', notes: '' });
    toast({ title: result.stored === 'offline' ? 'Captured offline' : 'Safety check saved', description: result.stored === 'offline' ? 'Saved on this device. It syncs to the register automatically when you are back online.' : 'Saved to the safety checks register.' });
    refreshQueued();
  };

  const inputClass = 'h-12 text-base';
  const TFField = ({ label, children }) => <div className="grid gap-1.5"><Label className="text-sm">{label}</Label>{children}</div>;

  return (
    <div className="space-y-4">
      <Card className={online ? 'border-safe/40' : 'border-warning/50'}>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${online ? 'bg-safe/10 text-safe' : 'bg-warning/10 text-warning'}`}>
              {online ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold">{online ? 'Online — captures save straight to the registers' : 'Offline — captures are stored on this device'}</p>
              <p className="text-xs text-muted-foreground">{queuedCount > 0 ? `${queuedCount} capture${queuedCount === 1 ? '' : 's'} waiting to sync` : 'Nothing waiting to sync'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {queuedCount > 0 && <Badge variant="secondary" className="tabular-nums">{queuedCount} queued</Badge>}
            <Button variant="outline" size="sm" onClick={sync} disabled={syncing || !online || queuedCount === 0}>
              {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sync now
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-warning/10 p-2"><ShieldAlert className="h-4 w-4 text-warning" /></div>
              <div>
                <p className="font-semibold">Quick Take Five</p>
                <p className="text-xs text-muted-foreground">Pre-task risk check — works offline</p>
              </div>
            </div>
            <form onSubmit={saveTakeFive} className="grid gap-3">
              <TFField label="Task / Activity *"><Input className={inputClass} value={takeFive.task} onChange={(e) => setTakeFive({ ...takeFive, task: e.target.value })} required /></TFField>
              <div className="grid gap-3 sm:grid-cols-2">
                <TFField label="Location"><Input className={inputClass} value={takeFive.location} onChange={(e) => setTakeFive({ ...takeFive, location: e.target.value })} /></TFField>
                <TFField label="Worker Name"><Input className={inputClass} value={takeFive.worker_name} onChange={(e) => setTakeFive({ ...takeFive, worker_name: e.target.value })} /></TFField>
              </div>
              <TFField label="Risks / Hazards Identified"><Textarea className="min-h-[70px] text-base" value={takeFive.hazards_identified} onChange={(e) => setTakeFive({ ...takeFive, hazards_identified: e.target.value })} /></TFField>
              <TFField label="Control Measures"><Textarea className="min-h-[70px] text-base" value={takeFive.control_measures} onChange={(e) => setTakeFive({ ...takeFive, control_measures: e.target.value })} /></TFField>
              <div className="flex items-center justify-between gap-3">
                <TFField label="Date"><Input type="date" className={inputClass} value={takeFive.assessment_date} onChange={(e) => setTakeFive({ ...takeFive, assessment_date: e.target.value })} /></TFField>
                <div className="grid gap-1.5">
                  <Label className="text-sm">Safe to proceed</Label>
                  <div className="flex h-12 items-center gap-2">
                    <Switch checked={takeFive.safe_to_proceed} onCheckedChange={(v) => setTakeFive({ ...takeFive, safe_to_proceed: v })} />
                    <span className="text-sm text-muted-foreground">{takeFive.safe_to_proceed ? 'Yes' : 'No — escalate'}</span>
                  </div>
                </div>
              </div>
              <Button type="submit" className="h-12 text-base" disabled={!takeFive.task.trim()}><CheckCircle2 className="mr-2 h-5 w-5" />Capture Take Five</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-brand/10 p-2"><ClipboardCheck className="h-4 w-4 text-brand" /></div>
              <div>
                <p className="font-semibold">Quick Safety Check</p>
                <p className="text-xs text-muted-foreground">Equipment &amp; kit checks — works offline</p>
              </div>
            </div>
            <form onSubmit={saveCheck} className="grid gap-3">
              <TFField label="Check Name *"><Input className={inputClass} value={check.title} onChange={(e) => setCheck({ ...check, title: e.target.value })} required /></TFField>
              <div className="grid gap-3 sm:grid-cols-2">
                <TFField label="Check Type">
                  <Select value={check.check_type} onValueChange={(v) => setCheck({ ...check, check_type: v })}>
                    <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>{CHECK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </TFField>
                <TFField label="Location"><Input className={inputClass} value={check.location} onChange={(e) => setCheck({ ...check, location: e.target.value })} /></TFField>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TFField label="Date Completed"><Input type="date" className={inputClass} value={check.date_completed} onChange={(e) => setCheck({ ...check, date_completed: e.target.value })} /></TFField>
                <TFField label="Result">
                  <Select value={check.result} onValueChange={(v) => setCheck({ ...check, result: v })}>
                    <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>{['Pass', 'Issues Found', 'Scheduled'].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </TFField>
              </div>
              {check.result === 'Issues Found' && (
                <TFField label="Issues Found"><Textarea className="min-h-[70px] text-base" value={check.issues_found} onChange={(e) => setCheck({ ...check, issues_found: e.target.value })} /></TFField>
              )}
              <TFField label="Notes"><Textarea className="min-h-[70px] text-base" value={check.notes} onChange={(e) => setCheck({ ...check, notes: e.target.value })} /></TFField>
              <Button type="submit" className="h-12 text-base" disabled={!check.title.trim()}><CheckCircle2 className="mr-2 h-5 w-5" />Capture Safety Check</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {queued.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-semibold">Waiting to sync</p>
            <div className="space-y-2">
              {queued.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <CloudOff className="h-4 w-4 shrink-0 text-warning" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.record.task || item.record.title}</p>
                      <p className="text-xs text-muted-foreground">{item.entity === 'TakeFive' ? 'Take Five' : 'Safety Check'} · queued {format(new Date(item.queued_at), 'd MMM, h:mm a')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { removeQueued(item.key); refreshQueued(); }} title="Discard">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}