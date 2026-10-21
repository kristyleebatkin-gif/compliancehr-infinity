import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { answerText, fieldAnswer, validFieldChoice } from '@/lib/formQuestionModel';
export default function StaffProfileQuestionField({ field, answers, onChange }) {
  const id = useId();
  const value = fieldAnswer(field, answers);
  const selected = field.options ? validFieldChoice(field, value) : '';
  const change = (next) => { onChange(field.label, next); if (field.legacyLabel) onChange(field.legacyLabel, ''); };
  return <div className={`min-w-0 space-y-0.5 ${field.multiline || field.options ? 'sm:col-span-2' : ''}`}>
    <label id={`${id}-label`} htmlFor={field.options ? undefined : id} className="block text-[11px] font-medium leading-tight text-foreground">{field.question}{field.optional && <span className="font-normal text-muted-foreground"> (optional)</span>}</label>
    {field.options ? <div role="group" aria-labelledby={`${id}-label`} className="flex flex-wrap gap-x-2 gap-y-0.5 rounded-md border border-input bg-background px-2 py-1">
      {field.options.map((option) => <label key={option} className="flex items-center gap-1 text-[11px] leading-tight"><input type={field.type === 'multiple' ? 'checkbox' : 'radio'} name={id} checked={Array.isArray(selected) ? selected.includes(option) : selected === option} onChange={(event) => change(field.type === 'multiple' ? event.target.checked ? [...(Array.isArray(selected) ? selected : []), option] : selected.filter((item) => item !== option) : option)} className="accent-primary" />{option}</label>)}
      {answerText(value) && !answerText(selected) && <p className="w-full text-xs text-muted-foreground">Earlier answer: {answerText(value)}</p>}
    </div> : field.multiline ? <Textarea id={id} rows={2} maxLength={4000} value={answerText(value)} onChange={(event) => change(event.target.value)} className="min-h-12 px-2 py-1 text-xs md:text-xs" /> : <Input id={id} maxLength={1000} value={answerText(value)} onChange={(event) => change(event.target.value)} className="h-7 px-2 py-0.5 text-xs md:text-xs" />}
  </div>;
}