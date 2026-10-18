import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, TextArea, TextInput } from '@/components/Field';
import { Loader2 } from 'lucide-react';

export default function IntakeAcknowledgementDialog({ open, onOpenChange, ackForm, setAckForm, submitting, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record acknowledgement - {ackForm?.docType}</DialogTitle>
        </DialogHeader>
        {ackForm && (
          <form
            onSubmit={(event) => { event.preventDefault(); onSubmit(); }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <p className="text-xs text-muted-foreground sm:col-span-2">
              The applicant reads and acknowledges this legislation or standard. The acknowledgement PDF is saved to this intake case with the person, date and time recorded, and follows them onto their profile after conversion.
            </p>
            {ackForm.definition.fields.map((field) => (
              <Field key={field.label} label={field.label} className={field.multiline ? 'sm:col-span-2' : ''}>
                {field.multiline
                  ? (
                    <TextArea
                      rows={3}
                      value={ackForm.answers[field.label] || ''}
                      onChange={(e) => setAckForm({ ...ackForm, answers: { ...ackForm.answers, [field.label]: e.target.value } })}
                    />
                  )
                  : (
                    <TextInput
                      value={ackForm.answers[field.label] || ''}
                      onChange={(e) => setAckForm({ ...ackForm, answers: { ...ackForm.answers, [field.label]: e.target.value } })}
                    />
                  )}
              </Field>
            ))}
            <div className="flex items-center justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Record acknowledgement
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}