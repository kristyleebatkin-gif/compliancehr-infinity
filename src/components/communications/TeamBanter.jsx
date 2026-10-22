import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessagesSquare, Send } from 'lucide-react';

const KIND = 'Team Banter';

export default function TeamBanter() {
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [user, page] = await Promise.all([
          base44.auth.me().catch(() => null),
          base44.entities.CommunicationEntry.filter({ entry_kind: KIND }, { sort: '-created_date', limit: 50 }),
        ]);
        if (!alive) return;
        setMe(user);
        setItems(page.items || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    const unsubscribe = base44.entities.CommunicationEntry.subscribe((event) => {
      if (event.data?.entry_kind !== KIND) return;
      setItems((prev) => {
        if (prev.some((e) => e.id === event.data.id)) return prev;
        return [event.data, ...prev].sort((a, b) => (a.created_date < b.created_date ? 1 : -1)).slice(0, 50);
      });
    });
    return () => { alive = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [items]);

  const post = async () => {
    const body = text.trim();
    if (!body) return;
    setPosting(true);
    try {
      const now = new Date();
      await base44.entities.CommunicationEntry.create({
        entry_kind: KIND,
        person_type: 'General',
        subject: body.slice(0, 80),
        body,
        entry_date: now.toISOString().slice(0, 10),
        entry_time: now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5),
        sender_name: me?.full_name || 'Team member',
        sender_email: me?.email || '',
        module: 'Communication Centre',
      });
      setText('');
    } catch (error) {
      toast({ title: 'Could not post message', description: error.message, variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border-2 border-black bg-white p-2 shadow-lg">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
          <MessagesSquare className="h-3.5 w-3.5" />
        </span>
        Team Banter
        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[11px] font-semibold text-pink-800 dark:bg-pink-950/40 dark:text-pink-300">team chat</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No banter yet - start a friendly conversation below. Every message is saved to the communication diary.</p>
      ) : (
        <div className="mb-2 max-h-[8rem] space-y-1.5 overflow-y-auto pr-1">
          {[...items].reverse().map((e) => {
            const mine = me?.email && String(e.sender_email || '').toLowerCase() === String(me.email).toLowerCase();
            return (
              <div key={e.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-sm ${mine ? 'ml-auto rounded-br-md bg-gradient-to-br from-brand to-fuchsia-500 text-white' : 'rounded-bl-md bg-muted/70 text-foreground'}`}>
                <div className={`mb-0.5 text-[10px] font-bold ${mine ? 'text-white/80' : 'text-foreground/50'}`}>{e.sender_name || 'Team member'}</div>
                <div className="whitespace-pre-wrap break-words leading-snug">{e.body}</div>
                <div className={`mt-1 text-[9px] ${mine ? 'text-white/70' : 'text-foreground/40'}`}>{[e.entry_date, e.entry_time].filter(Boolean).join(' · ')}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="mt-auto flex items-end gap-2 border-t border-border/60 pt-2">
        <Textarea
          rows={1}
          placeholder="Say something to the team…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post(); } }}
          className="resize-none"
        />
        <Button onClick={post} disabled={posting || !text.trim()} className="shrink-0" aria-label="Post message">
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post
        </Button>
      </div>
    </div>
  );
}