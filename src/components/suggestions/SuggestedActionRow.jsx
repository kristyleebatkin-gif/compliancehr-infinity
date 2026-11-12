import React from 'react';

const STATUS_TONES = {
  Done: 'text-[#15803D] border-[#BBF7D0] bg-[#F0FDF4]',
  'In progress': 'text-[#B45309] border-[#FDE68A] bg-[#FFFBEB]',
  'To do': 'text-[#475569] border-[#E2E8F0] bg-white',
};

export default function SuggestedActionRow({ action, onSave }) {
  const done = action.status === 'Done';

  return (
    <li className="flex items-start gap-2 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-2">
      <input
        type="checkbox"
        checked={done}
        onChange={() =>
          onSave(
            action,
            done
              ? { status: 'To do', completed_date: null, completed_by: null }
              : { status: 'Done', completed_date: new Date().toISOString().slice(0, 10) }
          )
        }
        aria-label={`Mark ${action.title} complete`}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#5A00D6]"
      />
      <div className="min-w-0 flex-1">
        <p
          className={
            done
              ? 'text-xs line-through text-slate-400'
              : 'text-xs font-semibold leading-snug text-[#0A2B6D]'
          }
        >
          {action.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <input
            defaultValue={action.owner || ''}
            placeholder="Assign to..."
            aria-label={`Assign ${action.title}`}
            onBlur={(e) => {
              if ((e.target.value || '') !== (action.owner || '')) onSave(action, { owner: e.target.value });
            }}
            className="h-6 w-32 rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 text-[11px] text-[#0A2B6D]"
          />
          <input
            type="date"
            value={action.due_date || ''}
            aria-label={`Due date for ${action.title}`}
            onChange={(e) => onSave(action, { due_date: e.target.value || null })}
            className="h-6 rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 text-[11px] text-[#0A2B6D]"
          />
          <select
            value={action.status}
            aria-label={`Status for ${action.title}`}
            onChange={(e) => {
              const status = e.target.value;
              onSave(
                action,
                status === 'Done'
                  ? { status, completed_date: new Date().toISOString().slice(0, 10) }
                  : { status, completed_date: null }
              );
            }}
            className={`h-6 rounded border px-1.5 text-[11px] font-semibold ${STATUS_TONES[action.status] || STATUS_TONES['To do']}`}
          >
            <option>To do</option>
            <option>In progress</option>
            <option>Done</option>
          </select>
          {action.owner && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5A00D6]">
              {action.owner}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}