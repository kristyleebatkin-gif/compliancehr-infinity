import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
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
          base44.entities.CommunicationEntry.filter({ entry_kind: KIND }, { sort: '-created_date', limit: 25 }),
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
        return [event.data, ...prev].sort((a, b) => (a.created_date < b.created_date ? 1 : -1)).slice(0, 25);
      });
    });
    return () => { alive = false; unsubscribe(); };
  }, []);

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
    <section className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#0072FF]/60 bg-[#081018] p-2.5 text-white shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0072FF] text-white">
            <MessagesSquare className="h-3 w-3 text-white" />
          </span>
          <h3 className="text-xs font-extrabold text-white">Team Banter</h3>
        </div>
        <span className="rounded bg-[#162235] border border-white/15 px-1.5 py-0.5 text-[9px] font-bold text-white">
          Team Chat
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        {loading ? (
          <div className="flex justify-center py-2"><Loader2 className="h-3.5 w-3.5 animate-spin text-[#0072FF]" /></div>
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-[#162235] px-2.5 py-1.5 text-[11px] text-slate-300">
            No banter yet — post a friendly message to the team below.
          </p>
        ) : (
          <div className="max-h-24 space-y-1 overflow-y-auto pr-1">
            {[...items].reverse().map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-white/15 bg-[#162235] px-2 py-1 text-[11px] text-white"
              >
                <span className="font-extrabold text-[#39E6FF]">{e.sender_name || 'Team'}: </span>
                <span className="text-white">{e.body}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            placeholder="Say something to the team…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); post(); } }}
            className="h-6 min-w-0 flex-1 rounded border border-white/20 bg-[#162235] px-2 text-[11px] text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={post}
            disabled={posting || !text.trim()}
            className="inline-flex h-6 shrink-0 items-center gap-1 rounded bg-[#FF2E9A] px-2.5 text-[10px] font-extrabold text-white disabled:opacity-50"
          >
            {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Post
          </button>
        </div>
      </div>
    </section>
  );
}