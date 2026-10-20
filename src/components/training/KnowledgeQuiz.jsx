import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuizQuestionCard from '@/components/training/QuizQuestionCard';

export default function KnowledgeQuiz({ questions, answers, setAnswers, score, passMark, onSubmit, onRetry, onContinue }) {
  const answered = Object.keys(answers).length;
  const passed = score !== null && score >= passMark;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div><h3 className="text-base font-semibold">Knowledge Quiz</h3><p className="text-xs text-muted-foreground">Select one answer per question. Answers and explanations appear after submission.</p></div>
      <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{answered}/{questions.length} answered · Pass {passMark}%</span>
    </div>
    {questions.map((question, index) => <QuizQuestionCard key={index} number={index + 1} question={question.q} options={question.options} selected={answers[index]} correctAnswer={question.answer} submitted={score !== null} explanation={question.explanation} onChange={(value) => setAnswers((previous) => ({ ...previous, [index]: value }))} />)}
    {score !== null && <div role="status" className={`flex items-start gap-2 rounded-xl p-4 text-sm ${passed ? 'bg-safe/10 text-safe' : 'bg-danger/10 text-danger'}`}>
      {passed ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
      <div><p className="font-semibold">Score: {score}%</p><p className="text-xs">{passed ? 'You passed. Continue to supervisor sign-off.' : `You need ${passMark}% to pass. Review the guide and retry.`}</p></div>
    </div>}
    <Button className="w-full" variant="outline" disabled={score === null && answered < questions.length} onClick={score === null ? onSubmit : passed ? onContinue : onRetry}>{score === null ? 'Submit Quiz' : passed ? 'Continue to Supervisor Sign-off' : 'Retry Quiz'}</Button>
  </div>;
}