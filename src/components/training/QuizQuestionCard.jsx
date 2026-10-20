import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function QuizQuestionCard({ number, question, options, selected, correctAnswer, submitted, explanation, onChange, indexed = false }) {
  const correct = selected === correctAnswer;
  return <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
    <div className="border-b border-border bg-primary/5 px-4 py-3">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-primary">Question {number}</p>
      <h4 className="break-words text-sm font-semibold leading-relaxed text-foreground">{question}</h4>
    </div>
    <div className="p-4">
      <p id={`quiz-answer-${number}`} className="mb-2 text-xs font-medium text-muted-foreground">{submitted ? 'Your answer' : 'Choose one answer'}</p>
      <div role="radiogroup" aria-labelledby={`quiz-answer-${number}`} className="grid gap-2">
        {options.map((option, index) => {
          const value = indexed ? index : option;
          const chosen = selected === value;
          const tone = submitted && value === correctAnswer ? 'border-safe bg-safe/10 text-foreground' : submitted && chosen ? 'border-danger bg-danger/10 text-foreground' : chosen ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-foreground hover:border-primary/50 hover:bg-muted/40';
          return <button key={index} type="button" role="radio" aria-checked={chosen} disabled={submitted} onClick={() => onChange(value)} className={`flex min-w-0 items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-muted-foreground">{String.fromCharCode(65 + index)}</span>
            <span className="min-w-0 flex-1 break-words">{option}</span>
            {chosen && <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-primary/30" />}
          </button>;
        })}
      </div>
    </div>
    {submitted && <div className="space-y-1 border-t border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed">
      <p className={correct ? 'flex items-center gap-1.5 font-semibold text-safe' : 'flex items-center gap-1.5 font-semibold text-danger'}>{correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{correct ? 'Correct' : 'Review this answer'}</p>
      {!correct && <p><span className="font-semibold">Correct answer: </span>{indexed ? options[correctAnswer] : correctAnswer}</p>}
      {explanation && <p className="text-muted-foreground">{explanation}</p>}
    </div>}
  </section>;
}