import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const QUESTIONS = [
  { id: 'age', q: 'Are you under 65 years old right now?' },
  { id: 'residency', q: 'Are you an Australian citizen, permanent resident, or Protected Special Category Visa holder living in Australia?' },
  { id: 'permanent', q: 'Do you have a disability or impairment that is likely to be permanent (lifelong)?' },
  { id: 'impact', q: 'Does it substantially reduce your ability to do everyday tasks without support or equipment?' },
];

export default function EligibilityQuiz() {
  const [answers, setAnswers] = useState({});
  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);
  const allYes = QUESTIONS.every((q) => answers[q.id] === true);

  return (
    <div className="rounded-2xl border-2 border-foreground bg-card p-6 space-y-4">
      <h2 className="text-xl font-black text-foreground">Quick 4-Question Eligibility Check</h2>
      <p className="text-sm font-medium text-muted-foreground">
        Answer Yes or No to see if you meet the standard NDIS access rules.
      </p>
      <div className="space-y-3">
        {QUESTIONS.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary p-3.5">
            <span className="text-sm font-bold text-foreground">{item.q}</span>
            <div className="flex gap-2">
              <Button size="sm" variant={answers[item.id] === true ? 'default' : 'outline'} onClick={() => setAnswers({ ...answers, [item.id]: true })}>Yes</Button>
              <Button size="sm" variant={answers[item.id] === false ? 'destructive' : 'outline'} onClick={() => setAnswers({ ...answers, [item.id]: false })}>No</Button>
            </div>
          </div>
        ))}
      </div>
      {allAnswered && (
        <div className="rounded-xl border-2 border-foreground bg-accent p-4">
          <p className="text-sm font-black text-foreground">
            {allYes
              ? 'Great news — you likely meet the core criteria to apply for the NDIS! Head to the Starter Checklist tab to prepare your evidence.'
              : 'If you answered No to one or more questions, you may not qualify for individual NDIS funding, but a Local Area Coordinator (1800 800 110) can still connect you with community, state, or aged care supports.'}
          </p>
        </div>
      )}
    </div>
  );
}