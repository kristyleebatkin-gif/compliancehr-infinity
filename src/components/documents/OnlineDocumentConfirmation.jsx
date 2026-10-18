import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import SignaturePad from '@/components/documents/SignaturePad';
import { FORM_NOTICES } from '@/lib/formDocumentStyles';

export default function OnlineDocumentConfirmation({ model, onChange, disabled }) {
  const id = useId();
  return <fieldset disabled={disabled} className="space-y-4 rounded-xl border-2 border-primary/60 bg-accent p-5 shadow-panel">
    <legend className="px-2 font-semibold text-primary">Declaration</legend>
    <p className="text-sm leading-relaxed">{FORM_NOTICES.declaration}</p>
    <label htmlFor={id} className="block space-y-2 text-sm font-semibold">Name of person completing this document
      <Input id={id} value={model.name} maxLength={160} required onChange={(e) => onChange({ ...model, name: e.target.value })} className="h-11 bg-card" />
    </label>
    <div className="space-y-2 text-sm font-semibold">Signature of person completing this document
      <SignaturePad value={model.signature || ''} disabled={disabled} onChange={(signature) => onChange({ ...model, signature })} />
    </div>
    <label className="flex items-start gap-3 text-sm leading-relaxed">
      <input type="checkbox" checked={model.confirmed} required onChange={(e) => onChange({ ...model, confirmed: e.target.checked })} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
      <span>I confirm this declaration and want to save this document as completed. The signature above is recorded on the filed PDF copy.</span>
    </label>
  </fieldset>;
}