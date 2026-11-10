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

  return (
    <fieldset disabled={disabled} className="grid min-w-0 grid-cols-12 items-start gap-4">
      <p className="col-span-12 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-[#F0F7FF] px-4 py-3 text-sm font-medium leading-relaxed text-[#0A2B6D]">
        <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-[#0072FF]" aria-hidden="true" />
        <span>
          Please take your time to fill in this form and read each question carefully. This information helps us support you better and keeps you safer. There is no rush, and you can ask for help with any question.
        </span>
      </p>

      {formQuestionRows(questions).flat().map(({ field, span }, index) => {
        const id = `${prefix}-${index}`;
        const value = fieldAnswer(field, answers);
        const required = !field.optional && Boolean(field.required || requireAll);
        const change = (next) => {
          onChange(field.label, next);
          if (field.legacyLabel) onChange(field.legacyLabel, '');
        };

        return (
          <div
            key={field.label}
            className={`col-span-12 ${spans[span]} min-w-0 self-stretch overflow-hidden rounded-xl border border-sky-300 bg-white shadow-2xs transition hover:border-[#0072FF]`}
          >
            {/* Clean Light Blue & Dark Blue Field Header (No Purple/Pink Gradient) */}
            <label
              id={`${id}-label`}
              htmlFor={field.options ? undefined : id}
              className="block border-b border-sky-300 bg-[#F0F7FF] px-4 py-2.5 text-sm font-extrabold leading-relaxed text-[#0A2B6D]"
            >
              <span className="text-[#0072FF] mr-1.5">Q{index + 1}.</span>
              {field.question}
              {required && <span aria-hidden="true" className="text-[#0072FF]"> *</span>}
            </label>

            <div className="space-y-2 p-4 bg-white">
              {field.options ? (
                <DocumentChoiceInput field={field} id={id} value={value} onChange={change} required={required} />
              ) : (
                <>
                  {(field.optional || field.help) && (
                    <p className="text-xs leading-relaxed text-[#0A2B6D]/70">
                      {field.help}
                      {field.optional ? ' Optional / if applicable.' : ''}
                    </p>
                  )}
                  {field.multiline ? (
                    <Textarea
                      id={id}
                      rows={field.lines}
                      maxLength={4000}
                      required={required}
                      value={answerText(value)}
                      onChange={(e) => change(e.target.value)}
                      className="resize-y rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-[#0A2B6D] leading-relaxed focus:border-[#0072FF] focus:bg-white"
                    />
                  ) : (
                    <Input
                      id={id}
                      maxLength={1000}
                      required={required}
                      value={answerText(value)}
                      onChange={(e) => change(e.target.value)}
                      className="h-10 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:bg-white"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}