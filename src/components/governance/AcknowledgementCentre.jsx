import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Loader2, Users, Heart, ClipboardCheck, Building2 } from 'lucide-react';

const pageOf = async (entity, sort, limit = 50) => {
  const page = await base44.entities[entity].filter({}, { sort, limit });
  return page.items || [];
};

const countOf = (entity, query) => base44.entities[entity].count(query).catch(() => 0);

function AckCard({ icon: Icon, title, total, blurb, link, linkLabel, rows }) {
  return (
    <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A2B6D]">
            <Icon className="h-3.5 w-3.5 text-white" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">{title}</p>
            <p className="text-lg font-extrabold tabular-nums text-[#0A2B6D]">{total}</p>
          </div>
        </div>
        {link && <Link to={link} className="text-[11px] font-bold text-[#0072FF] underline">{linkLabel}</Link>}
      </div>
      <p className="mt-1 text-[11px] font-medium leading-4 text-[#0A2B6D]">{blurb}</p>
      <div className="mt-2 space-y-1">
        {rows.length === 0 ? (
          <p className="rounded-lg bg-[#F5F0FF] px-2 py-1.5 text-[11px] font-semibold text-[#0A2B6D]">
            No acknowledgements recorded yet.
          </p>
        ) : rows.slice(0, 5).map((row, index) => (
          <div key={`${row.primary}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-[#F5F0FF] px-2 py-1">
            <span className="min-w-0 truncate text-[11px] font-bold text-[#0A2B6D]">{row.primary}</span>
            <span className="shrink-0 text-[10px] font-semibold text-[#5A00D6]">{row.secondary}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AcknowledgementCentre() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      pageOf('PolicyAcknowledgement', '-acknowledged_date'),
      pageOf('DocumentAcknowledgement', '-acknowledged_at'),
      pageOf('InformationSharingConsent', '-updated_date'),
      countOf('ParticipantProfile', { audit_consent: 'Audit consent received' }),
      countOf('Policy', { category: 'Governance' }),
      countOf('PolicyAcknowledgement', {}),
    ])
      .then(([policyAcks, docAcks, consents, auditConsent, declarations, staffAckCount]) => {
        if (!active) return;
        setData({ policyAcks, docAcks, consents, auditConsent, declarations, staffAckCount });
      })
      .catch(() => {
        if (active) setData({ policyAcks: [], docAcks: [], consents: [], auditConsent: 0, declarations: 0, staffAckCount: 0 });
      });
    return () => { active = false; };
  }, []);

  if (data === null) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const staffDocs = data.docAcks.filter((row) => ['Employee', 'Administration', 'Support Worker'].includes(row.acknowledged_by_role));
  const participantConsents = data.consents.filter((row) => row.status !== 'Withdrawn');

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3.5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">Acknowledgement Centre</p>
        <p className="mt-1 text-xs font-semibold text-[#0A2B6D]">
          Every acknowledgement is stored against a named person, a document version and a timestamp, so it can be
          produced as audit evidence. Staff, participants, auditors and providers each have their own register.
        </p>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2">
        <AckCard
          icon={Users}
          title="Staff"
          total={data.staffAckCount}
          blurb="Policy acknowledgements, training acknowledgements, code of conduct and NDIS standards."
          link="/compliance"
          linkLabel="Compliance Centre"
          rows={[
            ...data.policyAcks.map((row) => ({ primary: `${row.staff_name || 'Staff'} — ${row.policy_name || 'Policy'}`, secondary: row.acknowledged_date || row.policy_version || '' })),
            ...staffDocs.map((row) => ({ primary: `${row.acknowledged_by_name || 'Staff'} — ${row.document_title}`, secondary: 'Document' })),
          ]}
        />
        <AckCard
          icon={Heart}
          title="Participants"
          total={participantConsents.length}
          blurb="Rights & responsibilities, service agreements, privacy, complaints and information sharing."
          link="/documents"
          linkLabel="Document Vault"
          rows={participantConsents.map((row) => ({
            primary: `${row.participant_name || 'Participant'} — ${row.consent_type}`,
            secondary: row.status || '',
          }))}
        />
        <AckCard
          icon={ClipboardCheck}
          title="Auditors"
          total={data.auditConsent}
          blurb="Audit access consent recorded against participant and staff profiles; only consented records are opened to auditors."
          link="/auditor-portal"
          linkLabel="Auditor Portal"
          rows={data.docAcks
            .filter((row) => row.acknowledged_by_role === 'Auditor')
            .map((row) => ({ primary: row.acknowledged_by_name || 'Auditor', secondary: row.document_title }))}
        />
        <AckCard
          icon={Building2}
          title="Providers"
          total={data.declarations}
          blurb="Governance declarations, attestations and provider statements held in the policy hub."
          link="/company-safe"
          linkLabel="Company Safe"
          rows={[]}
        />
      </div>
    </div>
  );
}