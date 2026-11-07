import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Video, Plus, Copy, ExternalLink, PhoneOff } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

// Only the app's own Jitsi meeting rooms may be embedded; stored free-text
// values pointing anywhere else (or with unsafe schemes) are never loaded.
const JITSI_ROOM = /^https:\/\/meet\.jit\.si\/[A-Za-z0-9_-]+$/;
const safeRoom = (url) => JITSI_ROOM.test(String(url || '').trim());

export default function VideoCalls() {
  const { toast } = useToast();
  const [calls, setCalls] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const page = await base44.entities.CommunicationEntry.filter(
      { entry_kind: 'Video Call' },
      { sort: '-created_date', limit: 50 }
    );
    setCalls(page.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createRoom = async (e) => {
    e.preventDefault();
    const purpose = roomName.trim() || 'Team meeting';
    const slug = `chr-${purpose.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 7)}`;
    const link = `https://meet.jit.si/${slug}`;
    setCreating(true);
    await base44.entities.CommunicationEntry.create({
      entry_kind: 'Video Call',
      person_type: 'General',
      subject: purpose,
      body: link,
      module: 'Communication Centre - Video Calls',
      entry_date: today(),
      sender_name: 'Video room created',
    });
    setCreating(false);
    setShowForm(false);
    setRoomName('');
    setActiveRoom(link);
    load();
    toast({ title: 'Video room ready - link copied to the call log' });
  };

  const copyLink = async (link) => {
    try { await navigator.clipboard.writeText(link); toast({ title: 'Meeting link copied' }); }
    catch { toast({ title: 'Copy failed - select the link text instead' }); }
  };

  const endCall = (link) => {
    setActiveRoom(null);
    toast({ title: 'Left the call' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold"><Video className="h-4 w-4 text-brand" />Video calls & meetings</p>
              <p className="text-xs text-muted-foreground">Spin up an instant video room for team meetings, care reviews or family conferences. Every room is logged below with its link for audit.</p>
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />New video room</Button>
          </div>
          {showForm && (
            <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={createRoom}>
              <div className="grid flex-1 gap-1.5 min-w-[220px]">
                <Label>Purpose (e.g. Care review with Smith family)</Label>
                <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room purpose" />
              </div>
              <Button size="sm" type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create room'}</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {activeRoom && safeRoom(activeRoom) && (
        <Card className="border-brand/40">
          <CardContent className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-bold"><Video className="h-4 w-4 text-brand" />Live room</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyLink(activeRoom)}><Copy className="mr-2 h-4 w-4" />Copy link</Button>
                <Button size="sm" variant="outline" onClick={() => window.open(activeRoom, '_blank')}><ExternalLink className="mr-2 h-4 w-4" />Open in new tab</Button>
                <Button size="sm" variant="outline" className="text-danger" onClick={() => endCall(activeRoom)}><PhoneOff className="mr-2 h-4 w-4" />Leave</Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-workspace-navy">
              <iframe
                title="Video call"
                src={activeRoom}
                className="h-[480px] w-full"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
              />
            </div>
            <p className="mt-2 break-all text-xs text-muted-foreground">{activeRoom}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading call log...</CardContent></Card>
        ) : calls.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3"><CardContent className="p-8 text-center text-sm text-muted-foreground">No video calls logged yet. Create your first room above.</CardContent></Card>
        ) : (
          calls.map((c) => (
            <Card key={c.id}><CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{c.subject}</p>
                <Badge variant="secondary" className="shrink-0 text-[10px]">{String(c.created_date || '').slice(0, 10)}</Badge>
              </div>
              <p className="mt-1 break-all text-xs text-muted-foreground">{c.body}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyLink(c.body)}><Copy className="mr-1.5 h-3.5 w-3.5" />Copy link</Button>
                <Button size="sm" onClick={() => safeRoom(c.body) && setActiveRoom(c.body)}><Video className="mr-1.5 h-3.5 w-3.5" />Join</Button>
              </div>
            </CardContent></Card>
          ))
        )}
      </div>
    </div>
  );
}