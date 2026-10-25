import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { recordStatusLog, currentUserName } from '@/lib/statusLog';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus, Award, Pencil, Trash2, Download, Trophy, Users, Heart, Sparkles } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import BulkEditBar from '@/components/documents/BulkEditBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffRecognition from '@/components/staff/StaffRecognition';
import EmployeeJourneyForm from '@/components/profile/EmployeeJourneyForm';
import ParticipantJourneyBox from '@/components/profile/ParticipantJourneyBox';

export default function Certificates() {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [participantProfiles, setParticipantProfiles] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [form, setForm] = useState({
    certificate_number: '', staff_id: '', staff_name: '', module_title: '', issue_date: '',
    expiry_date: '', score: 0, status: 'Current', issued_by: '',
  });

  useEffect(() => { load(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const [certPage, staffPage, partPage] = await Promise.all([
        base44.entities.Certificate.filter({}, { sort: '-expiry_date', limit: 500 }),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 500 }),
        base44.entities.ParticipantProfile.filter({}, { sort: 'full_name', limit: 500 }).catch(() => ({ items: [] })),
      ]);
      const sList = staffPage.items || [];
      const pList = partPage.items || [];
      setItems(certPage.items || []);
      setStaffProfiles(sList);
      setParticipantProfiles(pList);
      if (sList.length && !selectedStaffId) setSelectedStaffId(sList[0].id);
      if (pList.length && !selectedParticipantId) setSelectedParticipantId(pList[0].id);
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

  const [selected, setSelected] = useState([]);
  const [applying, setApplying] = useState(false);

  const toggleSelect = (id, checked) => {
    setSelected((s) => (checked ? [...s, id] : s.filter((x) => x !== id)));
  };

  // Bulk status change across selected certificates, with a single audit entry.
  const bulkApply = async (status) => {
    const targets = items.filter((c) => selected.includes(c.id));
    if (!targets.length) return;
    setApplying(true);
    try {
      await base44.entities.Certificate.bulkUpdate(targets.map((t) => ({ id: t.id, status })));
      await base44.entities.AuditLog.create({ action: 'Bulk Updated', entity_type: 'Certificate', record_id: targets.map((t) => t.id).join(','), record_title: `${targets.length} certificates set to ${status}` }).catch((error) => console.error(error));
      setSelected([]);
      load();
    } finally {
      setApplying(false);
    }
  };

  const del = async (c) => {
    if (!confirm('Delete this certificate?')) return;
    await base44.entities.Certificate.delete(c.id);
    await base44.entities.AuditLog.create({ action: 'Deleted', entity_type: 'Certificate', record_id: c.id, record_title: c.certificate_number }).catch((error) => console.error(error));
    load();
  };

  const input = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  const selectedStaff = staffProfiles.find((s) => s.id === selectedStaffId) || staffProfiles[0] || null;
  const selectedParticipant = participantProfiles.find((p) => p.id === selectedParticipantId) || participantProfiles[0] || null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <ModuleShell
          title="Recognition & My Certificates"
          subtitle="Employee recognition leaderboard, My Certificates register, Staff Journey milestones, and Participant Journey in one unified showcase."
          icon={Award}
          moduleKey="certificates"
          insightModule="certificates"
          tabs={
            <TabsList className="flex flex-wrap gap-1.5 h-auto rounded-xl border-2 border-[#0A2B6D] bg-white p-1.5 shadow-sm">
              <TabsTrigger value="all" className="border border-[#0A2B6D]/40 font-extrabold">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> All Displayed Together
              </TabsTrigger>
              <TabsTrigger value="certificates" className="border border-[#0A2B6D]/40 font-extrabold">
                <Award className="mr-1.5 h-3.5 w-3.5" /> My Certificates ({items.length})
              </TabsTrigger>
              <TabsTrigger value="recognition" className="border border-[#0A2B6D]/40 font-extrabold">
                <Trophy className="mr-1.5 h-3.5 w-3.5" /> Recognition &amp; Leaderboard
              </TabsTrigger>
              <TabsTrigger value="staff-journey" className="border border-[#0A2B6D]/40 font-extrabold">
                <Users className="mr-1.5 h-3.5 w-3.5" /> Staff Journey ({staffProfiles.length})
              </TabsTrigger>
              <TabsTrigger value="participant-journey" className="border border-[#0A2B6D]/40 font-extrabold">
                <Heart className="mr-1.5 h-3.5 w-3.5" /> Participant Journey ({participantProfiles.length})
              </TabsTrigger>
            </TabsList>
          }
          search={<ModuleSearchBar value={query} onChange={setQuery} placeholder="Search certificates, staff or modules…" />}
          actions={
            <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-[#0A2B6D] bg-white p-2 shadow-sm">
              <Button className="border-2 border-[#0A2B6D]" onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Issue Certificate</Button>
              <Button variant="outline" className="border-2 border-[#0A2B6D] bg-white font-extrabold text-[#0A2B6D]" onClick={() => downloadCsv('Certificate-Register.csv', [
                { key: 'staff_name', label: 'Staff' }, { key: 'module_title', label: 'Module' },
                { key: 'certificate_number', label: 'Certificate Number' }, { key: 'issue_date', label: 'Issued' },
                { key: 'expiry_date', label: 'Expiry' }, { key: 'score', label: 'Score (%)' },
                { key: 'status', label: 'Status' }, { key: 'issued_by', label: 'Issued By' },
              ], items)} disabled={loading || items.length === 0}><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
            </div>
          }
          small={[
            ['My Certificates', items.length],
            ['Current & Valid', items.filter((c) => c.status === 'Current').length],
            ['Staff Journeys', staffProfiles.length],
            ['Participant Journeys', participantProfiles.length],
          ].map(([label, value]) => (
            <div key={label} className="border-2 border-[#0A2B6D] bg-white">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">{label}</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0A2B6D]">{loading ? '…' : value}</p>
            </div>
          ))}
        />

        {/* STAFF JOURNEY & PARTICIPANT JOURNEY SIDE-BY-SIDE SHOWCASE */}
        {(activeTab === 'all' || activeTab === 'staff-journey' || activeTab === 'participant-journey') && (
          <div className={`grid grid-cols-1 gap-4 ${activeTab === 'all' ? 'lg:grid-cols-2' : ''}`}>
            {(activeTab === 'all' || activeTab === 'staff-journey') && (
              <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
                  style={{ background: 'var(--header-gradient)' }}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#00C6FF]" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Workforce Progression &amp; Milestones</span>
                      <h3 className="text-sm font-extrabold text-white">Staff Journey &amp; Career Milestones</h3>
                    </div>
                  </div>
                  {staffProfiles.length > 0 && (
                    <select
                      aria-label="Select staff member for Staff Journey"
                      value={selectedStaff?.id || ''}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="rounded-lg border-2 border-white bg-white px-2.5 py-1 text-xs font-extrabold text-[#0A2B6D]"
                    >
                      {staffProfiles.map((s) => (
                        <option key={s.id} value={s.id}>{s.full_name}{s.position ? ` — ${s.position}` : ''}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="p-3 bg-[#F5F0FF]/35">
                  {selectedStaff ? (
                    <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#0A2B6D]/20 pb-2">
                        <div>
                          <p className="text-sm font-extrabold text-[#0A2B6D]">{selectedStaff.full_name}</p>
                          <p className="text-xs font-bold text-[#5A00D6]">{selectedStaff.position || selectedStaff.role || 'Staff Member'}</p>
                        </div>
                        <StatusBadge value={selectedStaff.status || 'Active'} />
                      </div>
                      <EmployeeJourneyForm key={selectedStaff.id} profile={selectedStaff} onUpdated={load} />
                    </div>
                  ) : (
                    <p className="p-4 text-xs font-bold text-[#0A2B6D]">No staff profiles available yet.</p>
                  )}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'participant-journey') && (
              <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
                  style={{ background: 'var(--header-gradient)' }}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-[#FF6EDB]" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Participant Intake &amp; Support Timeline</span>
                      <h3 className="text-sm font-extrabold text-white">Participant Journey &amp; Support Milestones</h3>
                    </div>
                  </div>
                  {participantProfiles.length > 0 && (
                    <select
                      aria-label="Select participant for Participant Journey"
                      value={selectedParticipant?.id || ''}
                      onChange={(e) => setSelectedParticipantId(e.target.value)}
                      className="rounded-lg border-2 border-white bg-white px-2.5 py-1 text-xs font-extrabold text-[#0A2B6D]"
                    >
                      {participantProfiles.map((p) => (
                        <option key={p.id} value={p.id}>{p.full_name}{p.ndis_number ? ` — NDIS ${p.ndis_number}` : ''}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="p-3 bg-[#F5F0FF]/35">
                  {selectedParticipant ? (
                    <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0A2B6D]/20 pb-2">
                        <div>
                          <p className="text-sm font-extrabold text-[#0A2B6D]">{selectedParticipant.full_name}</p>
                          <p className="text-xs font-bold text-[#5A00D6]">
                            {[selectedParticipant.support_type || 'NDIS Participant', selectedParticipant.ndis_number && `NDIS: ${selectedParticipant.ndis_number}`].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <StatusBadge value={selectedParticipant.status || 'Active'} />
                      </div>
                      <ParticipantJourneyBox key={selectedParticipant.id} profile={selectedParticipant} />
                    </div>
                  ) : (
                    <p className="p-4 text-xs font-bold text-[#0A2B6D]">No participant profiles available yet.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* RECOGNITION & LEADERBOARD SECTION */}
        {(activeTab === 'all' || activeTab === 'recognition') && (
          <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
            <div
              className="border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
              style={{ background: 'var(--header-gradient)' }}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#00C6FF]" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Employee Recognition, Points &amp; Podium</span>
                  <h3 className="text-sm font-extrabold text-white">Staff Recognition &amp; Achievement Leaderboard</h3>
                </div>
              </div>
            </div>
            <div className="p-3">
              <StaffRecognition />
            </div>
          </section>
        )}

        {/* MY CERTIFICATES REGISTER SECTION */}
        {(activeTab === 'all' || activeTab === 'certificates') && (
          <div className="space-y-4">

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
          <>
          {selected.length > 0 && (
            <div className="border-b border-border bg-primary/5 px-5 py-3">
              <BulkEditBar
                count={selected.length}
                applying={applying}
                onApply={(v) => bulkApply(v.status)}
                onClear={() => setSelected([])}
                options={['Current', 'Expiring Soon', 'Expired', 'Revoked'].map((s) => ({ value: s, label: s }))}
              />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-10 px-4 py-3 text-left"><input type="checkbox" className="h-4 w-4 cursor-pointer rounded border-border accent-[hsl(var(--primary))]" checked={selected.length === items.length && items.length > 0} onChange={(e) => setSelected(e.target.checked ? items.map((c) => c.id) : [])} /></th>
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
                {items.filter((c) => !query.trim() || [c.staff_name, c.module_title, c.certificate_number, c.status].some((f) => (f || '').toLowerCase().includes(query.trim().toLowerCase()))).map(c => (
                  <tr key={c.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3.5"><input type="checkbox" className="h-4 w-4 cursor-pointer rounded border-border accent-[hsl(var(--primary))]" checked={selected.includes(c.id)} onChange={(e) => toggleSelect(c.id, e.target.checked)} /></td>
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
          </>
        )}
      </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}