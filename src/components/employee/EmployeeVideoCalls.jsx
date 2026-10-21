import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import EmployeeMessageForm from '@/components/employee/EmployeeMessageForm';
import EmployeeCommunicationList from '@/components/employee/EmployeeCommunicationList';
export default function EmployeeVideoCalls() {
  const [room, setRoom] = useState('');
  return <section className="space-y-4">
    <EmployeeMessageForm mode="video" />
    {room && <div className="space-y-3 rounded-xl border border-border bg-card p-3"><Button variant="outline" onClick={() => setRoom('')}>Leave call</Button><iframe title="Key personnel video call" className="h-[480px] w-full rounded-lg border border-border" src={room} allow="camera; microphone; fullscreen; display-capture; autoplay" /><p className="text-xs text-muted-foreground">Meeting links can be forwarded; use the meeting lobby to admit only invited attendees.</p></div>}
    <EmployeeCommunicationList view="video" onJoin={setRoom} />
  </section>;
}