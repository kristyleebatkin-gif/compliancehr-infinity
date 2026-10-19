import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

// AI-suggested roster assignments for unfilled shifts (Lumary/Deputy parity).
export default function RosterSuggestions({ onChanged }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [assigning, setAssigning] = useState(null);

  const run = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('rosterSuggest', {});
      if (res.data?.error) throw new Error(res.data.error);
      setSummary(res.data?.summary || '');
      setSuggestions(res.data?.suggestions || []);
      toast({ title: res.data?.summary || 'Suggestions generated' });
    } catch (error) {
      toast({ title: 'Could not generate suggestions', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const assign = async (s) => {
    setAssigning(s.shift_id);
    try {
      await base44.entities.Shift.update(s.shift_id, { employee_name: s.suggested_worker });
      setSuggestions((prev) => prev.filter((x) => x.shift_id !== s.shift_id));
      toast({ title: `Shift assigned to ${s.suggested_worker}` });
      onChanged?.();
    } catch (error) {
      toast({ title: 'Could not assign shift', description: error.message, variant: 'destructive' });
    } finally {
      setAssigning(null);
    }
  };

  return (
    <Card className="shadow-panel">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand"><Sparkles className="h-4 w-4" /></div>
            <div>
              <div className="font-bold font-display">AI roster suggestions</div>
              <div className="text-[11px] text-muted-foreground">Matches unfilled shifts to staff by availability, continuity of support and skill.</div>
            </div>
          </div>
          <Button onClick={run} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {loading ? 'Thinking…' : 'Suggest roster'}
          </Button>
        </div>

        {summary && !loading && suggestions.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">{summary}</p>
        )}

        {suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            {suggestions.map((s) => (
              <div key={s.shift_id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {s.date ? format(new Date(`${s.date}T00:00:00`), 'EEE d MMM') : ''}
                    {s.start_time ? ` · ${s.start_time}${s.end_time ? `–${s.end_time}` : ''}` : ''}
                    {s.participant && <span className="font-normal text-muted-foreground">{s.participant}</span>}
                    {s.service_type && <Badge variant="outline" className="text-[10px]">{s.service_type}</Badge>}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{s.reason}</div>
                  {s.alternative_worker && s.alternative_worker !== s.suggested_worker && (
                    <div className="text-xs text-muted-foreground">Alternative: {s.alternative_worker}</div>
                  )}
                </div>
                {s.suggested_worker && s.suggested_worker !== 'No suitable worker' && (
                  <Button size="sm" variant="outline" onClick={() => assign(s)} disabled={assigning === s.shift_id}>
                    {assigning === s.shift_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                    Assign {s.suggested_worker}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}