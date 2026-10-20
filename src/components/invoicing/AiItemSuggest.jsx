import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SUPPORT_ITEMS } from '@/lib/ndisPriceGuide';

const money = (v) => `$${Number(v || 0).toFixed(2)}`;

// AI item generation: describe the supports in plain English and the AI picks
// matching NDIS price guide items (code, unit, qty, rate) to add as lines.
// Shared by the invoice builder and the quote builder.
export default function AiItemSuggest({ mode, onAdd }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const generate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Describe the supports first', description: 'e.g. Weekend personal care for 2 participants, 4 hours each', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('aiLineItems', {
        mode,
        request_text: prompt,
        price_guide: SUPPORT_ITEMS.map((i) => ({ code: i.code, description: i.description, rate: i.rate, unit: i.unit })),
      });
      if (res.data?.error) throw new Error(res.data.error);
      setItems(res.data?.items || []);
      if (!res.data?.items?.length) {
        toast({ title: 'No suggestions returned', description: 'Try describing the supports differently.' });
      }
    } catch (error) {
      toast({ title: 'AI generation failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addAll = () => {
    onAdd(items.map(({ reason, ...line }) => line));
    setItems([]);
    setOpen(false);
    setPrompt('');
  };

  return (
    <div>
      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOpen(!open)}>
        <Sparkles className="h-3.5 w-3.5 text-primary" />AI suggest items{open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>
      {open && (
        <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3">
          <Textarea
            rows={2}
            className="text-xs"
            placeholder="Describe the supports, e.g. Weekend personal care for 2 participants, 4 hours each, plus transport"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="mt-2 flex items-center gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={generate} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}Generate suggestions
            </Button>
            {items.length > 0 && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addAll}>
                <Plus className="h-3.5 w-3.5" />Add all {items.length}
              </Button>
            )}
          </div>
          {items.map((item, i) => (
            <div key={i} className="mt-2 flex items-start justify-between gap-3 rounded-md border border-border/60 bg-card px-2.5 py-1.5 text-xs">
              <div className="min-w-0">
                <p className="font-semibold">{item.description}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.code ? `${item.code} · ` : ''}{item.qty} × {money(item.unit_price)} per {item.unit}{item.reason ? ` · ${item.reason}` : ''}
                </p>
              </div>
              <Button size="sm" variant="ghost" className="h-6 shrink-0 text-xs" onClick={() => { onAdd([{ ...item }]); setItems(items.filter((_, x) => x !== i)); }}>
                <Plus className="h-3 w-3" />Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}