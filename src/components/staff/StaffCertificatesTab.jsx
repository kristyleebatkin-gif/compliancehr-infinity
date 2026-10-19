import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BadgeCheck } from 'lucide-react';
import { statusTone } from '@/lib/statusStyles';

export default function StaffCertificatesTab({ staff }) {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.Certificate.filter(
      { $or: [{ staff_id: staff.id }, { staff_name: staff.full_name }] },
      { sort: '-issue_date', limit: 200 },
    )
      .then((page) => setCerts(page.items || []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [staff.id, staff.full_name]);

  if (loading) return <div className="py-4 text-center text-sm text-foreground/50">Loading certificates...</div>;
  if (certs.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-foreground/50">
        <BadgeCheck className="mx-auto mb-2 h-6 w-6" />No certificates on record for this staff member.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {certs.map((cert) => (
        <div key={cert.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{cert.module_title || 'Certificate'}</div>
            <div className="text-xs text-foreground/50">
              {cert.certificate_number ? `${cert.certificate_number} · ` : ''}
              Issued {cert.issue_date || 'n/a'} · Expires {cert.expiry_date || 'n/a'}{cert.score ? ` · ${cert.score}%` : ''}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs font-semibold">{cert.issued_by || ''}</span>
            <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(cert.status)}`}>{cert.status || 'Current'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}