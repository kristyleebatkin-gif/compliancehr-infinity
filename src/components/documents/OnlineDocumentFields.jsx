import React, { useId } from 'react';
import { HeartHandshake } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DocumentChoiceInput from '@/components/documents/DocumentChoiceInput';
import { normaliseFormFields, formQuestionRows, fieldAnswer, answerText, legacyFormFields } from '@/lib/formQuestionModel';

const spans = { 4: 'sm:col-span-4', 6: 'sm:col-span-6', 8: 'sm:col-span-8', 12: 'sm:col-span-12' };
export default function OnlineDocumentFields({ fields = [], answers = {}, onChange, disabled = false, requireAll = false }) {
  const prefix = useId();
  const prepared = normaliseFormFields(fields);
  const questions = [...prepared, ...legacyFormFields(prepared, answers)];
  return <fieldset disabled={disabled} className="grid min-w-0 grid-cols-12 items-start gap-4">
    <p className="col-span-12 flex items-start gap-2 rounded-lg border border-primary/40 bg-accent px-4 py-3 text-sm leading-relaxed text-primary">
      <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      Please take your time to fill in this form and read each question carefully. This information helps us support you better and keeps you safer. There is no rush, and you can ask for help with any question.
    </p>
    {formQuestionRows(questions).flat().map(({ field, span }, index) => {
      const id = `${prefix}-${index}`, value = fieldAnswer(field, answers);
      const required = !field.optional && Boolean(field.required || requireAll);
      const change = (next) => { onChange(field.label, next); if (field.legacyLabel) onChange(field.legacyLabel, ''); };
      return <div key={field.label} className={`col-span-12 ${spans[span]} min-w-0 self-stretch overflow-hidden rounded-lg border border-primary/50 bg-card shadow-panel`}>
        <label id={`${id}-label`} htmlFor={field.options ? undefined : id} className="block bg-primary px-4 py-3 text-sm font-semibold leading-relaxed text-primary-foreground">
          {field.question}{required && <span aria-hidden="true"> *</span>}
        </label>
        <div className="space-y-2 p-4">
          {field.options ? <DocumentChoiceInput field={field} id={id} value={value} onChange={change} required={required} />
            : <>
              {(field.optional || field.help) && <p className="text-xs leading-relaxed text-muted-foreground">{field.help}{field.optional ? ' Optional / if applicable.' : ''}</p>}
              {field.multiline
                ? <Textarea id={id} rows={field.lines} maxLength={4000} required={required} value={answerText(value)} onChange={(e) => change(e.target.value)} className="document-ruled-answer resize-y rounded-none border-0 border-b-2 border-primary/70 bg-transparent px-1 py-1 leading-7 shadow-none" />
                : <Input id={id} maxLength={1000} required={required} value={answerText(value)} onChange={(e) => change(e.target.value)} className="h-10 rounded-none border-0 border-b-2 border-primary/70 bg-transparent px-1 shadow-none" />}
            </>}
        </div>
      </div>;
    })}
  </fieldset>;
}