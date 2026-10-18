import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, TextArea, TextInput } from '@/components/Field';
import { Loader2 } from 'lucide-react';

export default function IntakeOnlineFormDialog({ open, onOpenChange, onlineForm, setOnlineForm, submitting, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete {onlineForm?.docType} online</DialogTitle>
        </DialogHeader>
        {onlineForm && (
          <form
            onSubmit={(event) => { event.preventDefault(); onSubmit(); }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Same questions as the official form, with the company name and logo in the header. Known details are filled in automatically and the finished PDF is attached to this intake case and, after conversion, to the profile.
            </p>
            {onlineForm.definition.fields.map((field) => (
              <Field key={field.label} label={field.label} className={field.multiline ? 'sm:col-span-2' : ''}>
                {field.multiline
                  ? (
                    <TextArea
                      rows={3}
                      value={onlineForm.answers[field.label] || ''}
                      onChange={(e) => setOnlineForm({ ...onlineForm, answers: { ...onlineForm.answers, [field.label]: e.target.value } })}
                    />
                  )
                  : (
                    <TextInput
                      value={onlineForm.answers[field.label] || ''}
                      onChange={(e) => setOnlineForm({ ...onlineForm, answers: { ...onlineForm.answers, [field.label]: e.target.value } })}
                    />
                  )}
              </Field>
            ))}
            <div className="flex items-center justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Save &amp; attach to case
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}