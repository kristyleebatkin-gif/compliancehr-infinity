import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { BookMarked, Copy, Send } from 'lucide-react';
import { MESSAGE_TEMPLATES } from '@/lib/messageTemplates';
import MessageTemplatePicker from './MessageTemplatePicker';
import TemplateQuickSend from './TemplateQuickSend';

export default function TemplateLibrary() {
  const { toast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [pending, setPending] = useState(null);

  const categories = [...new Set(MESSAGE_TEMPLATES.map((t) => t.category))];

  const openUse = (template) => {
    setActive(template);
    setPickerOpen(true);
  };

  const onTemplateApplied = (template) => {
    setPending(template);
    setSendOpen(true);
  };

  const copy = async (template) => {
    try {
      await navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.body}`);
      toast({ title: 'Template copied to clipboard' });
    } catch {
      toast({ title: 'Could not copy to clipboard', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><BookMarked className="h-4 w-4 text-brand" />Message template library</div>
        <p className="text-xs text-muted-foreground">Standard compliance reminders ready to send. Pick a template, fill in the details, and send it as a professional email straight from the Communication Centre. You can also insert any template into the Send Email or Bulk Messages tabs.</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{category}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {MESSAGE_TEMPLATES.filter((t) => t.category === category).map((template) => (
              <div key={template.id} className="flex flex-col rounded-2xl border border-border/60 bg-card p-4">
                <p className="text-sm font-semibold">{template.name}</p>
                <p className="mt-1 flex-1 whitespace-pre-wrap text-xs text-muted-foreground">{template.body.split('\n')[0]}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => openUse(template)}><Send className="h-3.5 w-3.5" />Use &amp; send</Button>
                  <Button size="sm" variant="outline" onClick={() => copy(template)}><Copy className="h-3.5 w-3.5" />Copy</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <MessageTemplatePicker open={pickerOpen} onOpenChange={setPickerOpen} initialTemplate={active} onSelect={onTemplateApplied} />
      <TemplateQuickSend open={sendOpen} onOpenChange={setSendOpen} subject={pending?.subject} body={pending?.body} />
    </div>
  );
}