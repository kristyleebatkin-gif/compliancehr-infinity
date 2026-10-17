import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Award, GraduationCap, Loader2, Plus, Trash2, Users } from 'lucide-react';

export default function StaffRecordsTab({ staff }) {
  const { toast } = useToast();
  const [shifts, setShifts] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newShift, setNewShift] = useState({ date: '', shift: '', buddy_supervisor: '', comments: '' });
  const [savingShift, setSavingShift] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [shiftPage, completionPage, certificatePage] = await Promise.all([
        base44.entities.BuddyShift.filter({ staff_id: staff.id }, { sort: '-date', limit: 50 }),
        base44.entities.TrainingCompletion.filter({ employee_name: staff.full_name }, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
        base44.entities.Certificate.filter({ staff_name: staff.full_name }, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
      ]);
      setShifts(shiftPage.items || []);
      setCompletions(completionPage.items || []);
      setCertificates(certificatePage.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [staff.id, staff.full_name]);

  const addShift = async () => {
    if (!newShift.date || !newShift.shift.trim()) return;
    setSavingShift(true);
    try {
      await base44.entities.BuddyShift.create({ ...newShift, staff_id: staff.id, staff_name: staff.full_name });
      setNewShift({ date: '', shift: '', buddy_supervisor: '', comments: '' });
      toast({ title: 'Buddy shift recorded' });
      await load();
    } finally {
      setSavingShift(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex items-center gap-2 border-b border-border/60 bg-gradient-to-r from-pink-50 via-violet-50 to-blue-50 px-5 py-3 dark:from-pink-950/30 dark:via-violet-950/30 dark:to-blue-950/30">
          <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><Users className="h-4 w-4" /></span>
          <span className="text-sm font-bold">Buddy training shifts ({shifts.length})</span>
        </div>
        <div className="p-5">
        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          <Input type="date" value={newShift.date} onChange={(e) => setNewShift({ ...newShift, date: e.target.value })} />
          <Input placeholder="Shift" value={newShift.shift} onChange={(e) => setNewShift({ ...newShift, shift: e.target.value })} />
          <Input placeholder="Buddy / supervisor" value={newShift.buddy_supervisor} onChange={(e) => setNewShift({ ...newShift, buddy_supervisor: e.target.value })} />
          <Button onClick={addShift} disabled={savingShift || !newShift.date || !newShift.shift.trim()}>
            {savingShift ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Record shift
          </Button>
          <Textarea className="sm:col-span-4" rows={2} placeholder="Comments (what was observed, competencies practised)" value={newShift.comments} onChange={(e) => setNewShift({ ...newShift, comments: e.target.value })} />
        </div>
        {shifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No buddy shifts recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {shifts.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-gradient-to-r from-pink-50/60 to-blue-50/60 p-3 dark:from-pink-950/20 dark:to-blue-950/20">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{s.date} · {s.shift}</p>
                  <p className="text-xs text-muted-foreground">Buddy: {s.buddy_supervisor || 'Not recorded'}{s.comments ? ` · ${s.comments}` : ''}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.BuddyShift.delete(s.id); await load(); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex items-center gap-2 border-b border-border/60 bg-gradient-to-r from-blue-50 via-violet-50 to-pink-50 px-5 py-3 dark:from-blue-950/30 dark:via-violet-950/30 dark:to-pink-950/30">
          <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><GraduationCap className="h-4 w-4" /></span>
          <span className="text-sm font-bold">Training completions ({completions.length})</span>
        </div>
        <div className="p-5">
        {completions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No training completions recorded.</p>
        ) : (
          <div className="space-y-2">
            {completions.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.module_title}</p>
                  <p className="text-xs text-muted-foreground">Completed {c.completed_date || 'unknown'}{c.expiry_date ? ` · expires ${c.expiry_date}` : ''}{c.score ? ` · ${c.score}%` : ''}</p>
                </div>
                <Badge className={statusTone('Current')}>{c.status}</Badge>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex items-center gap-2 border-b border-border/60 bg-gradient-to-r from-violet-50 via-pink-50 to-blue-50 px-5 py-3 dark:from-violet-950/30 dark:via-pink-950/30 dark:to-blue-950/30">
          <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><Award className="h-4 w-4" /></span>
          <span className="text-sm font-bold">Training certificates ({certificates.length})</span>
        </div>
        <div className="p-5">
        {certificates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No certificates recorded.</p>
        ) : (
          <div className="space-y-2">
            {certificates.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.module_title}</p>
                  <p className="text-xs text-muted-foreground">Issued {c.issue_date || 'unknown'}{c.expiry_date ? ` · expires ${c.expiry_date}` : ''} · Cert {c.certificate_number || '-'}</p>
                </div>
                <Badge className={statusTone(c.status)}>{c.status}</Badge>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}