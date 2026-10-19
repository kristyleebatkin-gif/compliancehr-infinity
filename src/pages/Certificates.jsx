import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { recordStatusLog, currentUserName } from '@/lib/statusLog';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus, Award, Pencil, Trash2, Download } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';

export default function Certificates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [form, setForm] = useState({
    certificate_number: '', staff_id: '', staff_name: '', module_title: '', issue_date: '',
    expiry_date: '', score: 0, status: 'Current', issued_by: '',
  });

  useEffect(() => { load(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const [certPage, staffPage] = await Promise.all([
        base44.entities.Certificate.filter({}, { sort: '-expiry_date', limit: 500 }),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 500 }),
      ]);
      setItems(certPage.items || []);
      setStaffProfiles(staffPage.items || []);
    }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openNew = () => { setEditing(null); setForm({ certificate_number: '', staff_id: '', staff_name: '', module_title: '', issue_date: '', expiry_date: '', score: 0, status: 'Current', issued_by: '' }); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setShowForm(true); };

  const selectStaff = (staffId) => {
    const staff = staffProfiles.find((profile) => profile.id === staffId);
    setForm((current) => ({
      ...current,
      staff_id: staffId,
      staff_name: staff?.full_name || '',
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await base44.entities.Certificate.update(editing.id, form);
        await recordStatusLog('Certificate', { id: editing.id, title: form.certificate_number || form.module_title || '', status: editing.status }, form.status, await currentUserName().catch(() => ''), 'Immutable status trail').catch((error) => console.error(error));
        await base44.entities.AuditLog.create({ action: 'Updated', entity_type: 'Certificate', record_id: editing.id, record_title: form.certificate_number || form.module_title }).catch((error) => console.error(error));
      } else {
        const rec = await base44.entities.Certificate.create(form);
        await base44.entities.AuditLog.create({ action: 'Created', entity_type: 'Certificate', record_id: rec.id, record_title: form.certificate_number || form.module_title }).catch((error) => console.error(error));
      }
      setShowForm(false); load();
    } catch (err) { console.error(err); }
  };

  const del = async (c) => {
    if (!confirm('Delete this certificate?')) return;
    await base44.entities.Certificate.delete(c.id);
    await base44.entities.AuditLog.create({ action: 'Deleted', entity_type: 'Certificate', record_id: c.id, record_title: c.certificate_number }).catch((error) => console.error(error));
    load();
  };

  const input = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
      <PageHeader title="Certificates" subtitle="Track staff training certificates and expiry" showAlerts={false} showCompliance={false} />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => downloadCsv('Certificate-Register.csv', [
          { key: 'staff_name', label: 'Staff' }, { key: 'module_title', label: 'Module' },
          { key: 'certificate_number', label: 'Certificate Number' }, { key: 'issue_date', label: 'Issued' },
          { key: 'expiry_date', label: 'Expiry' }, { key: 'score', label: 'Score (%)' },
          { key: 'status', label: 'Status' }, { key: 'issued_by', label: 'Issued By' },
        ], items)} disabled={loading || items.length === 0}><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" /> Issue Certificate</Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1.5">Employee Profile *</label>
              <select required value={form.staff_id || ''} onChange={e => selectStaff(e.target.value)} className={input}>
                <option value="">Select employee</option>
                {staffProfiles.map((staff) => <option key={staff.id} value={staff.id}>{staff.full_name}{staff.employee_id ? ` (${staff.employee_id})` : ''}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Module Title *</label><input required value={form.module_title} onChange={e => set('module_title', e.target.value)} className={input} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Certificate Number</label><input value={form.certificate_number} onChange={e => set('certificate_number', e.target.value)} className={input} /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Issued By</label><input value={form.issued_by} onChange={e => set('issued_by', e.target.value)} className={input} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Issue Date</label><input type="date" value={form.issue_date || ''} onChange={e => set('issue_date', e.target.value)} className={input} /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Expiry Date</label><input type="date" value={form.expiry_date || ''} onChange={e => set('expiry_date', e.target.value)} className={input} /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Score (%)</label><input type="number" value={form.score} onChange={e => set('score', Number(e.target.value))} className={input} /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Status</label><select value={form.status} onChange={e => set('status', e.target.value)} className={input}>{['Current','Expiring Soon','Expired','Revoked'].map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">Save Certificate</Button></div>
        </form>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-4 border-border border-t-foreground rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Award className="h-8 w-8 mb-2" /><p className="text-sm">No certificates issued</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Staff</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Module</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issued</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expiry</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(c => (
                  <tr key={c.id} className="hover:bg-muted/50">
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{c.staff_name}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.module_title}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.issue_date ? new Date(c.issue_date).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.score ? `${c.score}%` : '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge value={c.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openEdit(c)} aria-label="Edit certificate" className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                      <button onClick={() => del(c)} aria-label="Delete certificate" className="p-1.5 rounded-lg hover:bg-muted"><Trash2 className="h-4 w-4 text-danger" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}