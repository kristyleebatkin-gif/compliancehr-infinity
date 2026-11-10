import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Plus, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { readStore, writeStore, uid } from '@/components/today/studio/studioStore';

const PROMPTS = [
  'Plan my day around what is on my dashboard',
  'Draft a warm reply to a family asking about respite availability',
  'Turn my open tasks into a prioritised list',
  'Write a short staff update about a new process'
];

export default function AssistantStudio({ context }) {
  const [threads, setThreads] = useState(() => readStore('assistant', []));
  const [activeId, setActiveId] = useState(() => readStore('assistant', [])[0]?.id || null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const active = threads.find((thread) => thread.id === activeId) || null;
  const messages = active?.messages || [];

  useEffect(() => {
    writeStore('assistant', threads.slice(0, 15));
  }, [threads]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, busy]);

  const newChat = () => {
    setActiveId(null);
    setInput('');
    setError('');
  };

  const send = async (text) => {
    const question = String(text || '').trim();
    if (!question || busy) return;
    setError('');
    setInput('');

    let thread = threads.find((item) => item.id === activeId);
    let id = thread?.id;
    if (!id) {
      id = uid();
      thread = { id, title: question.slice(0, 42), messages: [], updated: new Date().toISOString() };
      setThreads((prev) => [thread, ...prev]);
      setActiveId(id);
    }

    const history = [...(thread.messages || []), { role: 'user', content: question }];
    setThreads((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, title: item.messages.length ? item.title : question.slice(0, 42), messages: history, updated: new Date().toISOString() }
          : item
      )
    );
    setBusy(true);

    try {
      const res = await base44.functions.invoke('studioAi', { task: 'chat', messages: history, context });
      const reply = res?.data?.reply || 'No reply came back — try again.';
      setThreads((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, messages: [...item.messages, { role: 'assistant', content: reply }], updated: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'The assistant is unavailable right now.');
      setThreads((prev) => prev.map((item) => (item.id === id ? { ...item, messages: item.messages.slice(0, -1) } : item)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={newChat} className="studio-chip flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" /> New chat
        </button>
        {threads.slice(0, 5).map((thread) => (
          <button
            key={thread.id}
            type="button"
            onClick={() => setActiveId(thread.id)}
            className="studio-chip max-w-[190px] truncate"
            style={thread.id === activeId ? { borderColor: '#5a00d6', color: '#5a00d6' } : undefined}
          >
            <MessageSquare className="mr-1 inline h-3 w-3" />
            {thread.title}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="space-y-2.5">
            <div className="t-card p-4">
              <p className="t-title flex items-center gap-1.5 text-[13px] font-extrabold">
                <Sparkles className="h-3.5 w-3.5" /> Your assistant knows what is on your dashboard
              </p>
              <p className="t-muted mt-1 text-[11.5px] leading-relaxed">
                Ask for a plan, a draft, a summary or a decision you can act on. Nothing is sent to anyone without you.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PROMPTS.map((prompt) => (
                <button key={prompt} type="button" onClick={() => send(prompt)} className="studio-chip">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`studio-bubble max-w-[92%] sm:max-w-[78%] ${
                  message.role === 'user' ? 'studio-bubble-user' : 'studio-bubble-ai'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {busy ? (
          <div className="studio-bubble studio-bubble-ai flex w-fit items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      {error ? <p className="text-[11.5px] font-semibold text-[#FF2E9A]">{error}</p> : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send(input);
            }
          }}
          rows={2}
          placeholder="Ask anything — or paste something to rewrite…"
          className="studio-textarea flex-1"
        />
        <button type="submit" disabled={busy || !input.trim()} className="t-btn t-btn-primary disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}