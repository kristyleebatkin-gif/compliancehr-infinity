import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmployeeCommunicationList from '@/components/employee/EmployeeCommunicationList';
import EmployeeMessageForm from '@/components/employee/EmployeeMessageForm';
export default function EmployeeCommunicationInbox({ diary = false }) {
  const [reply, setReply] = useState(null);
  return <>
    {diary ? <EmployeeCommunicationList view="diary" onReply={setReply} /> : <Tabs defaultValue="received"><TabsList><TabsTrigger value="received">Received</TabsTrigger><TabsTrigger value="sent">Sent</TabsTrigger></TabsList><TabsContent value="received"><EmployeeCommunicationList view="received" onReply={setReply} /></TabsContent><TabsContent value="sent"><EmployeeCommunicationList view="sent" /></TabsContent></Tabs>}
    <Dialog open={!!reply} onOpenChange={(open) => { if (!open) setReply(null); }}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Reply to message</DialogTitle></DialogHeader>{reply && <EmployeeMessageForm key={reply.id} replyTo={reply} onSaved={() => setReply(null)} />}</DialogContent></Dialog>
  </>;
}