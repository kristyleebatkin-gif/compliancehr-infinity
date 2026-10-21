import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmployeeMessageForm from '@/components/employee/EmployeeMessageForm';
export default function EmployeeTemplateSendDialog({ open, onOpenChange, subject, body }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Send template to key personnel</DialogTitle></DialogHeader>{open && <EmployeeMessageForm key={`${subject}-${body}`} mode="email" initialSubject={subject} initialBody={body} onSaved={() => onOpenChange(false)} />}</DialogContent></Dialog>;
}