import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import SignaturePad from '@/components/documents/SignaturePad';
import { FORM_NOTICES } from '@/lib/formDocumentStyles';

export default function OnlineDocumentConfirmation({ model, onChange, disabled }) {
  const id = useId();
  return (
    <fieldset
      disabled={disabled}
      className="space-y-4 rounded-xl border-2 border-[#0A2B6D] bg-[#F0F7FF] p-5 shadow-2xs text-[#0A2B6D]"
    >
      <legend className="rounded-md bg-[#0A2B6D] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
        Declaration &amp; Digital Sign-Off
      </legend>
      <p className="text-sm font-medium leading-relaxed text-[#0A2B6D]">{FORM_NOTICES.declaration}</p>
      <label htmlFor={id} className="block space-y-2 text-sm font-bold text-[#0A2B6D]">
        <span>Name of person completing this document</span>
        <Input
          id={id}
          value={model.name}
          maxLength={160}
          required
          onChange={(e) => onChange({ ...model, name: e.target.value })}
          className="h-11 border-sky-200 bg-white text-[#0A2B6D]"
        />
      </label>
      <div className="space-y-2 text-sm font-bold text-[#0A2B6D]">
        <span>Signature of person completing this document</span>
        <SignaturePad
          value={model.signature || ''}
          disabled={disabled}
          onChange={(signature) => onChange({ ...model, signature })}
        />
      </div>
      <label className="flex items-start gap-3 text-sm font-medium leading-relaxed text-[#0A2B6D]">
        <input
          type="checkbox"
          checked={model.confirmed}
          required
          onChange={(e) => onChange({ ...model, confirmed: e.target.checked })}
          className="mt-1 h-4 w-4 shrink-0 accent-[#0072FF]"
        />
        <span>
          I confirm this declaration and want to save this document as completed. The signature above is recorded on the filed PDF copy.
        </span>
      </label>
    </fieldset>
  );
}