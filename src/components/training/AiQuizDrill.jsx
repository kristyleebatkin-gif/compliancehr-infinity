import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, RotateCcw, CheckCircle2, XCircle, Target } from 'lucide-react';
import { LMS_MODULES, LMS_GROUPS } from '@/lib/lmsCurriculum';
import ScoreRing from '@/components/ScoreRing';

export default function AiQuizDrill() {
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async (module) => {
    setTopic(module);
    setQuestions([]); setAnswers({}); setScore(null); setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('generateTrainingQuiz', { topic: module.title, count: 5 });
      setQuestions(res.data.questions || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Could not generate a drill. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    const answered = questions.filter((_, i) => answers[i] !== undefined).length;
    if (answered < questions.length) return;
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore(Math.round((correct / questions.length) * 100));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand/10 p-2"><Sparkles className="h-4 w-4 text-brand" /></div>
            <div>
              <p className="font-semibold">AI Quiz Drills</p>
              <p className="text-xs text-muted-foreground">Fresh practice questions generated on demand for any module - great for refreshers between formal completions.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {LMS_MODULES.slice(0, 12).map((m) => (
              <button key={m.number} onClick={() => generate(m)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${topic?.number === m.number ? 'bg-brand text-white' : 'bg-muted text-foreground/60 hover:bg-muted/70'}`}>{m.number}. {m.title}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card><CardContent className="flex items-center gap-3 p-6"><Loader2 className="h-5 w-5 animate-spin text-brand" /><p className="text-sm text-foreground/60">Writing your drill on "{topic?.title}"...</p></CardContent></Card>
      )}

      {error && (
        <Card><CardContent className="p-5 text-sm text-danger">{error}<div className="mt-2"><Button size="sm" onClick={() => generate(topic)}>Try again</Button></div></CardContent></Card>
      )}

      {questions.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">Drill: {topic?.title}</p>
              {score === null ? (
                <Button onClick={submit} disabled={Object.keys(answers).length < questions.length}><Target className="mr-2 h-4 w-4" />Submit drill</Button>
              ) : (
                <div className="flex items-center gap-3">
                  <ScoreRing value={score} size={72} label="score" />
                  <Button variant="outline" onClick={() => generate(topic)}><RotateCcw className="mr-2 h-4 w-4" />New drill</Button>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {questions.map((q, qi) => {
                const picked = answers[qi];
                return (
                  <div key={qi} className="rounded-xl border border-border/60 p-4">
                    <p className="text-sm font-semibold">{qi + 1}. {q.question}</p>
                    {score !== null && picked === q.answer && <Badge className="mt-1 bg-safe/10 text-safe">Correct</Badge>}
                    {score !== null && picked !== q.answer && <Badge className="mt-1 bg-danger/10 text-danger">Incorrect</Badge>}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oi) => {
                        const chosen = picked === oi;
                        let cls = 'border-border/60 hover:border-brand/50';
                        if (score === null) cls = chosen ? 'border-brand bg-brand/5' : cls;
                        else if (oi === q.answer) cls = 'border-safe bg-safe/10';
                        else if (chosen) cls = 'border-danger bg-danger/10';
                        return (
                          <button key={oi} disabled={score !== null} onClick={() => setAnswers({ ...answers, [qi]: oi })} className={`rounded-lg border p-3 text-left text-sm transition ${cls}`}>
                            <span className="mr-2 text-xs font-bold text-foreground/40">{String.fromCharCode(65 + oi)}</span>{opt}
                            {score !== null && oi === q.answer && <CheckCircle2 className="ml-2 inline h-4 w-4 text-safe" />}
                            {score !== null && chosen && oi !== q.answer && <XCircle className="ml-2 inline h-4 w-4 text-danger" />}
                          </button>
                        );
                      })}
                    </div>
                    {score !== null && q.explanation && <p className="mt-2 text-xs text-foreground/60"><span className="font-semibold">Why: </span>{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}