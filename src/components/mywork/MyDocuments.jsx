import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import EmptyState from '@/components/EmptyState';
import { FolderOpen, ArrowRight, Eye } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';

const fmt = (d) => d ? format(new Date(d), 'EEE d MMM') : '';

const tone = (expiry) => {
  if (!expiry) return 'bg-muted text-foreground/60';
  const days = differenceInCalendarDays(new Date(expiry), new Date());
  if (days < 0) return 'bg-danger/10 text-danger';
  if (days <= 30) return 'bg-warning/10 text-warning';
  return 'bg-safe/10 text-safe';
};

// My documents: own documents plus private documents others hold that contain my info.
export default function MyDocuments({ me }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!me) return;
    try {
      const page = await base44.entities.EmployeeDocument.filter(
        { employee_name: me.full_name, status: { $ne: 'Archived' } },
        { sort: '-created_date', limit: 20 },
      );
      setDocs(page.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [me?.full_name]);

  useEffect(() => { load(); }, [load]);

  const viewDoc = async (doc) => {
    try {
      if (doc.file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
        window.open(signed_url, '_blank');
      } else if (safeUrl(doc.file_url)) {
        window.open(safeUrl(doc.file_url), '_blank', 'noopener,noreferrer');
      }
    } catch (e) { console.error(e); }
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My documents</h2>
        <Link to="/documents" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">Document vault<ArrowRight className="h-3 w-3" /></Link>
      </div>
      {loading ? (
        <div className="py-8 text-center text-sm text-foreground/40">Loading...</div>
      ) : docs.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No documents yet" message="Your documents, and private documents HR holds about you, will appear here to view." />
      ) : (
        <div className="space-y-2">
          {docs.map((d) => {
            const expired = d.expiry_date && differenceInCalendarDays(new Date(d.expiry_date), new Date()) < 0;
            return (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
                <FolderOpen className={`h-5 w-5 shrink-0 ${expired ? 'text-danger' : 'text-brand'}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{d.title}</div>
                  <div className="truncate text-xs text-foreground/50">
                    {d.document_type || ''}
                    {d.expiry_date ? ` · ${expired ? 'Expired ' : 'Expires '}${fmt(d.expiry_date)}` : ''}
                  </div>
                </div>
                {(d.file_uri || d.file_url) && (
                  <button onClick={() => viewDoc(d)} title="View document" className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-brand hover:bg-muted">
                    <Eye className="h-3.5 w-3.5" />View
                  </button>
                )}
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${tone(d.expiry_date)}`}>{d.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}