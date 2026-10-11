import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Loader2, Volume2 } from 'lucide-react';

const LANGUAGES = [
  'Arabic', 'Chinese (Simplified)', 'Spanish', 'Vietnamese', 'Greek', 'Italian',
  'Hindi', 'Punjabi', 'Tagalog', 'Korean', 'Japanese', 'German', 'French', 'Thai', 'Portuguese',
];

const speak = (text, langHint) => {
  if ('speechSynthesis' in window && text) {
    const u = new SpeechSynthesisUtterance(text);
    if (langHint === 'Chinese (Simplified)') u.lang = 'zh-CN';
    else if (langHint === 'Arabic') u.lang = 'ar';
    else if (langHint === 'Spanish') u.lang = 'es';
    else if (langHint === 'Vietnamese') u.lang = 'vi';
    else if (langHint === 'Greek') u.lang = 'el';
    else if (langHint === 'Italian') u.lang = 'it';
    else if (langHint === 'Hindi') u.lang = 'hi';
    else if (langHint === 'Punjabi') u.lang = 'pa';
    else if (langHint === 'Tagalog') u.lang = 'fil';
    else if (langHint === 'Korean') u.lang = 'ko';
    else if (langHint === 'Japanese') u.lang = 'ja';
    else if (langHint === 'German') u.lang = 'de';
    else if (langHint === 'French') u.lang = 'fr';
    else if (langHint === 'Thai') u.lang = 'th';
    else if (langHint === 'Portuguese') u.lang = 'pt';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
};

export default function TranslatorPanel() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);

  const translate = async () => {
    if (!text.trim() || !language) return;
    setLoading(true);
    setTranslation('');
    try {
      const response = await base44.functions.invoke('translateText', { text, language });
      setTranslation(response.data.translation || '');
    } catch (error) {
      toast({ title: 'Translation failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Languages className="h-4 w-4 text-brand" />Translator &amp; interpreter</div>
      <p className="mb-4 text-xs text-muted-foreground">Type any message and translate it for participants, families and staff who speak another language. Translations can be read aloud.</p>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <textarea className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none" placeholder="Type what you want to say..." value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex items-center gap-2">
            <Select value={language || 'none'} onValueChange={(v) => setLanguage(v === 'none' ? '' : v)}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="Translate into..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Translate into...</SelectItem>
                {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={translate} disabled={loading || !text.trim() || !language}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}Translate</Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex min-h-[140px] items-start rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : translation || <span className="text-muted-foreground">The translation appears here.</span>}
          </div>
          {translation && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => speak(translation, language)}><Volume2 className="h-4 w-4" />Read aloud</Button>
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(translation); toast({ title: 'Translation copied' }); }}>Copy</Button>
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">For certified interpreting services, contact the Translating and Interpreting Service (TIS National) on 131 450.</p>
    </div>
  );
}