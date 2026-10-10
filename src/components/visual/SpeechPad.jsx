import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Volume2, Square, Trash2, MessageSquareText } from 'lucide-react';

export default function SpeechPad() {
  const [text, setText] = useState(localStorage.getItem('vh_speech_text') || '');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('vh_speech_text', text);
  }, [text]);

  const speak = () => {
    if (!('speechSynthesis' in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><MessageSquareText className="h-4 w-4 text-brand" />Speech pad</div>
      <div className="grid gap-2">
        <Label>Type what you want to say, then press speak</Label>
        <textarea
          rows={5}
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-lg focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          placeholder="Type your message here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={speak} disabled={!text.trim() || speaking}><Volume2 className="h-4 w-4" />{speaking ? 'Speaking...' : 'Speak'}</Button>
          <Button variant="outline" onClick={stop} disabled={!speaking}><Square className="h-4 w-4" />Stop</Button>
          <Button variant="ghost" onClick={() => { setText(''); stop(); }}><Trash2 className="h-4 w-4" />Clear</Button>
        </div>
      </div>
    </div>
  );
}