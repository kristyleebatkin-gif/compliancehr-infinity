import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import MessageBubble from './MessageBubble';
import { ArrowLeft, Plus, SendHorizontal, Loader2, MessagesSquare } from 'lucide-react';
import moment from 'moment';

const FALLBACK_SUGGESTIONS = ['What needs my attention today?', 'Summarise recent activity', 'What is due this week?'];

export default function AssistantChat({ agent, onBack }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [suggestions, setSuggestions] = useState(FALLBACK_SUGGESTIONS);
  const scrollRef = useRef(null);
  const { toast } = useToast();
  const Icon = agent.icon;

  // Generate the full suggestion list for this assistant and show all of it
  useEffect(() => {
    let cancelled = false;
    base44.functions.invoke('assistantSuggestions', { agent_name: agent.name })
      .then((res) => {
        const questions = res?.data?.questions;
        if (!cancelled && Array.isArray(questions) && questions.length > 0) setSuggestions(questions);
      })
      .catch((error) => console.error(error));
    return () => { cancelled = true; };
  }, [agent.name]);

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    base44.agents.listConversations({ agent_name: agent.name })
      .then((convs) => { if (!cancelled) setConversations(Array.isArray(convs) ? convs : []); })
      .catch((error) => console.error(error))
      .finally(() => { if (!cancelled) setLoadingList(false); });
    return () => { cancelled = true; };
  }, [agent.name]);

  const openConversation = async (conv) => {
    try {
      const full = await base44.agents.getConversation(conv.id);
      setActiveConv(full);
      setMessages(full.messages || []);
    } catch (error) {
      console.error(error);
    }
  };

  const newConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: agent.name,
        metadata: { name: `Chat · ${moment().format('D MMM, h:mm a')}` },
      });
      setConversations((prev) => [conv, ...prev]);
      setActiveConv(conv);
      setMessages([]);
      return conv;
    } catch (error) {
      console.error(error);
      toast({ title: 'Could not start a new chat', variant: 'destructive' });
      return null;
    }
  };

  // Open the latest conversation, or start one automatically
  useEffect(() => {
    if (loadingList || activeConv) return;
    if (conversations.length) openConversation(conversations[0]);
    else newConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingList, conversations.length]);

  // Live streaming updates for the active conversation
  useEffect(() => {
    if (!activeConv?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(activeConv.id, (data) => {
      if (data?.messages) setMessages(data.messages);
    });
    return unsubscribe;
  }, [activeConv?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    const content = input.trim();
    if (!content || !activeConv || sending) return;
    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(activeConv, { role: 'user', content });
    } catch (error) {
      console.error(error);
      toast({ title: 'Message failed to send', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const waiting = sending || (messages.length > 0 && messages[messages.length - 1].role === 'user');
  const convLabel = (c) => c?.metadata?.name || `Chat ${moment(c?.created_date).format('D MMM')}`;

  return (
    <div className="space-y-3">
      {/* Chat top bar */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground/60 hover:bg-brand/5">
          <ArrowLeft className="h-4 w-4" /> All assistants
        </button>
        <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white" style={{ background: `linear-gradient(135deg, ${agent.from}, ${agent.to})` }}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <select
            value={activeConv?.id || ''}
            onChange={(e) => { const c = conversations.find((x) => x.id === e.target.value); if (c) openConversation(c); }}
            className="w-full min-w-0 bg-transparent text-sm font-semibold text-foreground outline-none"
          >
            {conversations.length === 0 && <option value={activeConv?.id || ''}>{activeConv ? convLabel(activeConv) : 'Loading…'}</option>}
            {conversations.map((c) => (
              <option key={c.id} value={c.id}>{convLabel(c)}</option>
            ))}
          </select>
        </div>
        <button onClick={newConversation} title="New chat" className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New chat</span>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex h-[60vh] min-h-[380px] flex-col overflow-y-auto rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        {messages.length === 0 && !waiting && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${agent.from}, ${agent.to})` }}>
              <Icon className="h-7 w-7" />
            </div>
            <div className="mt-3 text-lg font-bold font-display">{agent.label}</div>
            <div className="mt-1 max-w-sm text-sm text-foreground/50">{agent.tagline}. Ask anything to get started.</div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setInput(s)} className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground/60 hover:bg-brand/5 hover:text-brand">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {messages.map((message, i) => <MessageBubble key={i} message={message} />)}
          {waiting && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-3.5 py-2.5 text-sm text-foreground/50 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-brand" /> {agent.label} is thinking…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={`Message ${agent.label}…`}
          className="h-11 flex-1 rounded-xl border border-border bg-card px-4 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={send}
          aria-label="Send message"
          disabled={!input.trim() || sending || !activeConv}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-opacity disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${agent.from}, ${agent.to})` }}
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div className="flex items-center gap-1.5 px-1 text-[11px] text-foreground/40">
        <MessagesSquare className="h-3 w-3" /> Chats are saved per agent — switch anytime from the dropdown.
      </div>
    </div>
  );
}