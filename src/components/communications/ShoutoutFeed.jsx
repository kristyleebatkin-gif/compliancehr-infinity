import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PartyPopper, Send } from 'lucide-react';

const KIND = 'Team Banter';

// Shoutout feed: recognition messages for teammates, shown on the Team Banter tab.
// Entries are Team Banter records flagged with note_type 'Shoutout' so the feed
// stays a distinct source from general chat.
export default function ShoutoutFeed() {
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [me, setMe] = useState(null);
  const [team, setTeam] = useState([]);
  const [to, setTo] = useState('');
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = () => base44.entities.CommunicationEntry
    .filter({ entry_kind: KIND, note_type: 'Shoutout' }, { sort: '-created_date', limit: 30 })
    .then((page) => setItems(page.items || []))
    .catch(() => setItems([]));

  useEffect(() => {
    let live = true;
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (live) setMe(user);
      const staffPage = await base44.entities.StaffProfile
        .filter({}, { sort: 'full_name', limit: 200, fields: ['full_name'] })
        .catch(() => ({ items: [] }));
      if (live) setTeam((staffPage.items || []).map((s) => s.full_name).filter(Boolean));
      await load();
    })();
    return () => { live = false; };
  }, []);

  const post = async () => {
    if (!to || !text.trim()) return;
    setPosting(true);
    try {
      const now = new Date();
      await base44.entities.CommunicationEntry.create({
        entry_kind: KIND,
        note_type: 'Shoutout',
        person_type: 'Employee',
        person_name: to,
        subject: `Shoutout for ${to}`,
        body: `👏 Shoutout to ${to}: ${text.trim()}`,
        entry_date: now.toISOString().slice(0, 10),
        entry_time: now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5),
        sender_name: me?.full_name || 'Team member',
        sender_email: me?.email || '',
        module: 'Communication Centre',
      });
      setText('');
      toast({ title: 'Shoutout posted', description: `${to} has been recognised on the feed.` });
      await load();
    } catch (e) {
      toast({ title: 'Could not post shoutout', description: e?.message, variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-500/10 p-2"><PartyPopper className="h-4 w-4 text-amber-600" /></div>
          <div>
            <p className="text-sm font-bold">Team Shoutouts</p>
            <p className="text-xs text-muted-foreground">Recognise a teammate - every shoutout lands on the team feed</p>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Who are you shouting out?" /></SelectTrigger>
            <SelectContent>
              {(team.length ? team : ['Priya Patel', 'Sarah Nguyen', 'Tom Reilly', 'Jordan Lee', 'Emma Walker', 'Kate Brown', 'Lucy Chan', 'Mia Rossi']).map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="What are you celebrating?" onKeyDown={(e) => { if (e.key === 'Enter') post(); }} />
          <Button onClick={post} disabled={posting || !to || !text.trim()} className="shrink-0">
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {items === null && <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}
          {items && items.map((s) => (
            <div key={s.id} className="rounded-xl border border-amber-200/60 bg-amber-500/10 p-3 dark:border-amber-500/20">
              <p className="text-sm leading-snug">{s.body}</p>
              <p className="mt-1 text-[11px] text-foreground/50">{[s.sender_name, s.entry_date, s.entry_time].filter(Boolean).join(' · ')}</p>
            </div>
          ))}
          {items && items.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No shoutouts yet - celebrate someone above.</p>}
        </div>
      </CardContent>
    </Card>
  );
}