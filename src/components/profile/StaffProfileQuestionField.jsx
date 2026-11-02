import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { answerText, fieldAnswer, validFieldChoice } from '@/lib/formQuestionModel';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
  color: '#0A2B6D',
};

const APP_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

function hashColour(text = '') {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return APP_COLOURS[h % APP_COLOURS.length];
}

export default function StaffProfileQuestionField({ field, answers, onChange, dateInputs = false }) {
  const id = useId();
  const value = fieldAnswer(field, answers);
  const selected = field.options ? validFieldChoice(field, value) : '';
  const symCol = hashColour(field.label || field.question || '');
  const change = (next) => {
    onChange(field.label, next);
    if (field.legacyLabel) onChange(field.legacyLabel, '');
  };
  return (
    <div
      className={`min-w-0 space-y-1 rounded-xl p-2 ${
        field.multiline || field.options ? 'sm:col-span-2' : ''
      }`}
      style={GRADIENT_BORDER_STYLE}
    >
      <label
        id={`${id}-label`}
        htmlFor={field.options ? undefined : id}
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold leading-snug text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
      >
        <span style={{ color: symCol }}>◉</span>
        <span>
          {field.question}
          {field.optional && <span className="font-semibold text-[#5A00D6]"> (optional)</span>}
        </span>
      </label>
      {field.options ? (
        <div
          role="group"
          aria-labelledby={`${id}-label`}
          className="flex flex-wrap gap-1.5 rounded-lg p-1.5"
          style={GRADIENT_BORDER_STYLE}
        >
          {field.options.map((option, idx) => {
            const optCol = APP_COLOURS[idx % APP_COLOURS.length];
            return (
              <label
                key={option}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold leading-tight text-[#0A2B6D]"
                style={GRADIENT_BORDER_STYLE}
              >
                <span style={{ color: optCol }}>◉</span>
                <input
                  type={field.type === 'multiple' ? 'checkbox' : 'radio'}
                  name={id}
                  checked={
                    Array.isArray(selected) ? selected.includes(option) : selected === option
                  }
                  onChange={(event) =>
                    change(
                      field.type === 'multiple'
                        ? event.target.checked
                          ? [...(Array.isArray(selected) ? selected : []), option]
                          : selected.filter((item) => item !== option)
                        : option
                    )
                  }
                  className="accent-primary"
                />
                {option}
              </label>
            );
          })}
          {answerText(value) && !answerText(selected) && (
            <p className="w-full text-xs text-[#0A2B6D]">Earlier answer: {answerText(value)}</p>
          )}
        </div>
      ) : field.multiline ? (
        <Textarea
          id={id}
          rows={2}
          maxLength={4000}
          value={answerText(value)}
          onChange={(event) => change(event.target.value)}
          className="min-h-12 px-2 py-1 text-xs font-semibold text-[#0A2B6D]"
          style={GRADIENT_BORDER_STYLE}
        />
      ) : (
        <Input
          id={id}
          type={
            dateInputs &&
            /^(issue date|expiry date|verification date|renewal due date|assessment date|check date|review date|next due date|follow-up date|plan start date|plan review date|effective from date|effective until date|submitted date)$/i.test(
              field.label
            )
              ? 'date'
              : 'text'
          }
          maxLength={1000}
          value={answerText(value)}
          onChange={(event) => change(event.target.value)}
          className="h-8 bg-white px-2 py-1 text-xs font-semibold text-[#0A2B6D]"
          style={GRADIENT_BORDER_STYLE}
        />
      )}
    </div>
  );
}