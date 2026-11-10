import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Panel, Row, Pill, Empty } from '@/components/today/todayUi';

const TONE = {
  Sent: 'blue',
  Delivered: 'blue',
  Read: 'amber',
  Acknowledged: 'green',
  Responded: 'green',
  Archived: 'gray'
};

export default function EmailsPanel({ emails }) {
  const waiting = emails.filter((email) => email.lifecycle_status !== 'Responded' && email.lifecycle_status !== 'Archived');

  return (
    <Panel
      title="Emails"
      subtitle={`${waiting.length} need an answer`}
      className="xl:col-span-2"
      action={
        <Link to="/communications" className="t-muted text-[11.5px] font-bold hover:underline">
          Open inbox
        </Link>
      }
    >
      {emails.length === 0 ? (
        <Empty>No emails in the mailbox yet.</Empty>
      ) : (
        <div className="divide-y divide-[#0A2B6D]/6">
          {emails.map((email) => (
            <Row key={email.id}>
              <div className="min-w-0 flex-1">
                <p className="t-title truncate text-[12.5px] font-bold">
                  {email.subject || '(no subject)'}
                </p>
                <p className="t-muted mt-0.5 truncate text-[11px]">
                  {email.sender_name || 'Unknown sender'} ·{' '}
                  {email.entry_date || new Date(email.created_date).toLocaleDateString('en-AU')}
                </p>
              </div>
              <Pill tone={TONE[email.lifecycle_status] || 'gray'}>{email.lifecycle_status || 'Sent'}</Pill>
              <ChevronRight className="t-muted h-3.5 w-3.5 shrink-0" />
            </Row>
          ))}
        </div>
      )}
    </Panel>
  );
}