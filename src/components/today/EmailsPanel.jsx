import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Panel, Row, Pill, Empty } from '@/components/today/todayUi';

const TONE = {
  Sent: 'blue',
  Delivered: 'blue',
  Read: 'amber',
  Acknowledged: 'green',
  Responded: 'green',
  Archived: 'gray'
};

// The business Gmail inbox (read-only). Management roles only; anyone else gets a 403 and the
// inbox section is simply hidden. A missing or expired Gmail connection shows a reconnect note.
function useInbox() {
  return useQuery({
    queryKey: ['today', 'gmail-inbox'],
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke('gmailInbox', { limit: 6 });
        return { ...(res?.data || {}), forbidden: false };
      } catch (error) {
        const status = error?.response?.status || error?.status;
        if (status === 403 || status === 401) return { forbidden: true, messages: [] };
        throw error;
      }
    },
  });
}

function receivedLabel(iso) {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function InboxSection() {
  const { data, isPending, isError, refetch } = useInbox();
  if (data?.forbidden) return null;
  const messages = Array.isArray(data?.messages) ? data.messages : [];

  return (
    <div className="mb-3">
      <p className="t-muted px-1.5 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider">
        Inbox{data?.unread ? ` · ${data.unread} unread` : ''}
      </p>
      {isPending ? (
        <Empty>Loading inbox…</Empty>
      ) : isError ? (
        <Empty>
          Inbox unavailable. <button type="button" className="underline" onClick={() => refetch()}>Try again</button>
        </Empty>
      ) : data?.needs_reconnect ? (
        <Empty>Gmail needs reconnecting before the inbox can show here. Ask the app owner to reconnect Gmail.</Empty>
      ) : messages.length === 0 ? (
        <Empty>The inbox is empty.</Empty>
      ) : (
        <div className="divide-y divide-[#0A2B6D]/6">
          {messages.map((message) => (
            <a key={message.id} href={message.link} target="_blank" rel="noopener noreferrer" className="block">
              <Row>
                <div className="min-w-0 flex-1">
                  <p className={`t-title truncate text-[12.5px] ${message.unread ? 'font-extrabold' : 'font-semibold'}`}>
                    {message.subject || '(no subject)'}
                  </p>
                  <p className="t-muted mt-0.5 truncate text-[11px]">
                    {message.from_name || 'Unknown sender'} · {receivedLabel(message.received_at)}
                  </p>
                </div>
                {message.unread ? <Pill tone="pink">New</Pill> : null}
                <ExternalLink className="t-muted h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </Row>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmailsPanel({ emails }) {
  const list = Array.isArray(emails) ? emails : [];
  const waiting = list.filter((email) => email.lifecycle_status !== 'Responded' && email.lifecycle_status !== 'Archived');

  return (
    <Panel
      title="Emails"
      subtitle={`${waiting.length} sent from the app need an answer`}
      className="xl:col-span-2"
      action={
        <Link to="/communications" className="t-muted text-[11.5px] font-bold hover:underline">
          Open inbox
        </Link>
      }
    >
      <InboxSection />
      <p className="t-muted px-1.5 pb-1 text-[10.5px] font-extrabold uppercase tracking-wider">Sent from the app</p>
      {list.length === 0 ? (
        <Empty>No emails sent from the app yet.</Empty>
      ) : (
        <div className="divide-y divide-[#0A2B6D]/6">
          {list.map((email) => (
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
