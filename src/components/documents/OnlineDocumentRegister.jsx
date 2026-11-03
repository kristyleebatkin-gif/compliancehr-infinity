import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import OnlineDocumentFields from '@/components/documents/OnlineDocumentFields';

export default function OnlineDocumentRegister({ columns = [], rows, onChange, disabled }) {
  if (!columns.length) return null;
  return (
    <section className="space-y-4 rounded-xl border border-sky-200 bg-[#F8FAFC] p-4">
      <div className="flex items-center justify-between border-b border-sky-200 pb-2.5">
        <h3 className="font-editorial text-base font-extrabold text-[#0A2B6D]">Register Entries</h3>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={rows.length >= 50}
            onClick={() => onChange([...rows, columns.map(() => '')])}
            className="border-[#0072FF] bg-white text-[#0A2B6D] hover:bg-[#F0F7FF]"
          >
            <Plus className="h-4 w-4 text-[#0072FF]" />
            Add Entry
          </Button>
        )}
      </div>

      {!rows.length && (
        <p className="text-sm text-[#0A2B6D]/75">
          No entries yet. Click &ldquo;Add Entry&rdquo; to record information in this register.
        </p>
      )}

      {rows.map((row, index) => (
        <div key={index} className="space-y-3 rounded-xl border border-sky-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <h4 className="text-sm font-extrabold text-[#0A2B6D]">Entry {index + 1}</h4>
            {!disabled && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label={`Remove entry ${index + 1}`}
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                className="text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          <OnlineDocumentFields
            fields={columns.map((label) => ({ label }))}
            answers={Object.fromEntries(columns.map((column, i) => [column, row[i] || '']))}
            disabled={disabled}
            onChange={(label, value) =>
              onChange(
                rows.map((r, i) =>
                  i === index ? columns.map((c, j) => (c === label ? value : r[j] || '')) : r
                )
              )
            }
          />
        </div>
      ))}
    </section>
  );
}