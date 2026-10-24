import React, { useState, useEffect, useCallback } from 'react';
import {
  Inbox, Upload, CheckCircle2, AlertTriangle, FileText, Search, ShieldCheck, UserCheck, FolderOpen,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

function autoClassifyDocument(fileName = '', title = '') {
  const text = `${fileName} ${title}`.toLowerCase();
  if (text.includes('police')) return { docType: 'Police Check', register: 'EmployeeDocument', owner: 'HR & Compliance' };
  if (text.includes('blue card') || text.includes('wwcc')) return { docType: 'Blue Card', register: 'EmployeeDocument', owner: 'HR & Compliance' };
  if (text.includes('ndis') && text.includes('screen')) return { docType: 'NDIS Worker Screening', register: 'EmployeeDocument', owner: 'HR & Compliance' };
  if (text.includes('first aid')) return { docType: 'First Aid Certificate', register: 'EmployeeDocument', owner: 'Training & HR' };
  if (text.includes('cpr')) return { docType: 'CPR Certificate', register: 'EmployeeDocument', owner: 'Training & HR' };
  if (text.includes('contract')) return { docType: 'Contract', register: 'EmployeeDocument', owner: 'Human Resources' };
  if (text.includes('agreement') || text.includes('consent') || text.includes('plan')) {
    return { docType: 'Service Agreement / Plan', register: 'ParticipantDocument', owner: 'Participant Intake & Coordination' };
  }
  return { docType: 'Other', register: 'EmployeeDocument', owner: 'Compliance Administrator' };
}

export default function SmartMailroomHub({ onFiled }) {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState([]);
  const [participantList, setParticipantList] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [routing, setRouting] = useState(false);

  const [mailItem, setMailItem] = useState({
    title: '',
    fileName: '',
    fileUri: '',
    personType: 'Employee',
    personName: '',
    docType: 'Police Check',
    targetRegister: 'EmployeeDocument',
    assignedOwner: 'Compliance Administrator',
    expiryDate: '',
    notes: '',
  });

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr_smart_mailroom_history_v1') || '[]');
    } catch {
      return [];
    }
  });

  const loadDirectory = useCallback(async () => {
    const [sPage, pPage, dPage] = await Promise.all([
      base44.entities.StaffProfile.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
      base44.entities.ParticipantProfile.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
      base44.entities.EmployeeDocument.filter({}, { limit: 100 }).catch(() => ({ items: [] })),
    ]);
    setStaffList(sPage.items || []);
    setParticipantList(pPage.items || []);
    setExistingDocs(dPage.items || []);
  }, []);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const suggested = autoClassifyDocument(file.name, mailItem.title);

      // Auto-match person name from filename if present
      const lower = file.name.toLowerCase();
      const matchedStaff = staffList.find((s) => s.full_name && lower.includes(s.full_name.toLowerCase()));
      const matchedParticipant = participantList.find((p) => p.full_name && lower.includes(p.full_name.toLowerCase()));

      setMailItem((prev) => ({
        ...prev,
        fileName: file.name,
        fileUri: file_uri,
        title: prev.title || file.name.replace(/\.[^.]+$/, ''),
        docType: suggested.docType,
        targetRegister: matchedParticipant ? 'ParticipantDocument' : suggested.register,
        personType: matchedParticipant ? 'Participant' : 'Employee',
        personName: matchedParticipant?.full_name || matchedStaff?.full_name || prev.personName,
        assignedOwner: suggested.owner,
      }));
      toast({
        title: 'Incoming Document Classified (Stored Privately)',
        description: `Auto-classified as "${suggested.docType}" -> ${suggested.register}.`,
      });
    } finally {
      setUploading(false);
    }
  };

  // Duplicate detection check against existing documents
  const duplicateMatch = existingDocs.find(
    (d) =>
      d.title?.toLowerCase() === mailItem.title.trim().toLowerCase() &&
      (d.employee_name || '').toLowerCase() === mailItem.personName.trim().toLowerCase()
  );

  const handleApproveAndRoute = async (e) => {
    e.preventDefault();
    if (!mailItem.title.trim()) {
      toast({
        title: 'Document title required',
        description: 'Enter or confirm the document title before approving and filing.',
        variant: 'destructive',
      });
      return;
    }
    setRouting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (mailItem.targetRegister === 'ParticipantDocument') {
        const matchedP = participantList.find((p) => p.full_name === mailItem.personName);
        await base44.entities.ParticipantDocument.create({
          title: mailItem.title.trim(),
          participant_id: matchedP?.id || '',
          participant_name: mailItem.personName || 'Participant',
          document_type: mailItem.docType,
          expiry_date: mailItem.expiryDate || undefined,
          file_uri: mailItem.fileUri || undefined,
          notes: `Routed via Smart Mailroom (Owner: ${mailItem.assignedOwner}). ${mailItem.notes}`,
        });
      } else if (mailItem.targetRegister === 'FormsLibraryDocument') {
        await base44.entities.FormsLibraryDocument.create({
          library: mailItem.personType === 'Participant' ? 'Participant Intake' : 'Employee Intake',
          document_type: mailItem.docType,
          title: mailItem.title.trim(),
          person_name: mailItem.personName,
          file_name: mailItem.fileName || mailItem.title,
          file_uri: mailItem.fileUri || undefined,
          uploaded_date: today,
          uploaded_by: mailItem.assignedOwner,
        });
      } else {
        await base44.entities.EmployeeDocument.create({
          title: mailItem.title.trim(),
          employee_name: mailItem.personName || 'Staff Member',
          document_type: [
            'Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate',
            'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications',
            'Reference Check', 'Staff Badge', 'Other',
          ].includes(mailItem.docType)
            ? mailItem.docType
            : 'Other',
          issue_date: today,
          expiry_date: mailItem.expiryDate || undefined,
          status: 'Current',
          file_uri: mailItem.fileUri || undefined,
          notes: `Smart Mailroom Verified & Routed (Owner: ${mailItem.assignedOwner}). ${mailItem.notes}`,
        });
      }

      const logEntry = {
        id: `MAIL-${Date.now().toString().slice(-5)}`,
        title: mailItem.title.trim(),
        personName: mailItem.personName || 'General',
        docType: mailItem.docType,
        targetRegister: mailItem.targetRegister,
        owner: mailItem.assignedOwner,
        status: 'Approved & Filed',
        processedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      const nextHistory = [logEntry, ...history].slice(0, 25);
      setHistory(nextHistory);
      localStorage.setItem('chr_smart_mailroom_history_v1', JSON.stringify(nextHistory));

      toast({
        title: 'Smart Mailroom: Approved & Routed',
        description: `"${mailItem.title}" filed to ${mailItem.targetRegister} for ${mailItem.personName || 'organisation'}.`,
      });
      setMailItem({
        title: '',
        fileName: '',
        fileUri: '',
        personType: 'Employee',
        personName: '',
        docType: 'Police Check',
        targetRegister: 'EmployeeDocument',
        assignedOwner: 'Compliance Administrator',
        expiryDate: '',
        notes: '',
      });
      await loadDirectory();
      onFiled?.();
    } finally {
      setRouting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border-4 border-[#ca8a04] bg-white shadow-xl">
      <div className="px-4 py-2.5 text-white" style={{ background: HEADER_GRADIENT }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-blue-950">
              <Inbox className="h-3 w-3 text-purple-700" /> SECTION 16 — SMART MAILROOM &amp; DOCUMENT INTELLIGENCE
            </span>
            <h2 className="mt-0.5 text-sm sm:text-base font-black text-white">
              Incoming Document Collection, Auto-Classification, Person Matching, Duplicate Detection &amp; Register Routing
            </h2>
          </div>
          <Badge className="bg-emerald-500 text-white text-[8px]">
            {history.length} Processed Mailroom Records
          </Badge>
        </div>
      </div>

      <div className="p-3 space-y-2.5 bg-white">
        <form onSubmit={handleApproveAndRoute} className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Step 1: Incoming Document Upload & Auto-Identification */}
          <div className="rounded-xl border-2 border-[#0ea5e9] bg-sky-50/40 p-2.5 space-y-2" style={{ borderTopWidth: '4px' }}>
            <div className="text-[9px] font-black uppercase text-sky-900">
              1. Incoming File &amp; Automatic Identification
            </div>
            <div>
              <label className="text-[8px] font-bold text-blue-950">
                Attach Incoming File (Private Encrypted Vault Storage)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-0.5 block w-full text-[9px] text-blue-950"
              />
              {uploading && (
                <div className="text-[8px] font-bold text-purple-700">
                  Uploading &amp; running automatic classification...
                </div>
              )}
            </div>
            <div>
              <label className="text-[8px] font-bold text-blue-950">Document Title *</label>
              <Input
                value={mailItem.title}
                onChange={(e) => {
                  const val = e.target.value;
                  const suggested = autoClassifyDocument(mailItem.fileName, val);
                  setMailItem((prev) => ({
                    ...prev,
                    title: val,
                    docType: suggested.docType,
                    targetRegister: suggested.register,
                  }));
                }}
                placeholder="e.g. Sarah Jenkins NDIS Worker Screening 2026"
                className="h-7 text-xs bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[8px] font-bold text-blue-950">Suggested Classification</label>
                <Input
                  value={mailItem.docType}
                  onChange={(e) => setMailItem({ ...mailItem, docType: e.target.value })}
                  className="h-7 text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-blue-950">Target Register</label>
                <select
                  value={mailItem.targetRegister}
                  onChange={(e) => setMailItem({ ...mailItem, targetRegister: e.target.value })}
                  className="h-7 w-full rounded border border-input bg-white px-1.5 text-xs"
                >
                  <option value="EmployeeDocument">EmployeeDocument</option>
                  <option value="ParticipantDocument">ParticipantDocument</option>
                  <option value="FormsLibraryDocument">FormsLibraryDocument</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Employee / Participant Matching & Duplicate Detection */}
          <div className="rounded-xl border-2 border-[#7c3aed] bg-purple-50/40 p-2.5 space-y-2" style={{ borderTopWidth: '4px' }}>
            <div className="text-[9px] font-black uppercase text-purple-900">
              2. Profile Matching &amp; Duplicate Detection
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[8px] font-bold text-blue-950">Subject Type</label>
                <select
                  value={mailItem.personType}
                  onChange={(e) => setMailItem({ ...mailItem, personType: e.target.value, personName: '' })}
                  className="h-7 w-full rounded border border-input bg-white px-1.5 text-xs"
                >
                  <option value="Employee">Employee / Staff</option>
                  <option value="Participant">Participant / Client</option>
                </select>
              </div>
              <div>
                <label className="text-[8px] font-bold text-blue-950">Matched Person</label>
                <input
                  list="smart-mailroom-people"
                  value={mailItem.personName}
                  onChange={(e) => setMailItem({ ...mailItem, personName: e.target.value })}
                  placeholder="Select or type name..."
                  className="h-7 w-full rounded border border-input bg-white px-2 text-xs"
                />
                <datalist id="smart-mailroom-people">
                  {(mailItem.personType === 'Participant' ? participantList : staffList).map((p) => (
                    <option key={p.id} value={p.full_name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[8px] font-bold text-blue-950">Document Owner</label>
                <Input
                  value={mailItem.assignedOwner}
                  onChange={(e) => setMailItem({ ...mailItem, assignedOwner: e.target.value })}
                  className="h-7 text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-blue-950">Expiry / Review Date</label>
                <Input
                  type="date"
                  value={mailItem.expiryDate}
                  onChange={(e) => setMailItem({ ...mailItem, expiryDate: e.target.value })}
                  className="h-7 text-xs bg-white"
                />
              </div>
            </div>

            {duplicateMatch ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500 bg-amber-50 p-1.5 text-[8px] font-bold text-amber-900">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>
                  Duplicate Detected: A document with this title already exists for {mailItem.personName}. Verify before filing.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-50/60 p-1.5 text-[8px] font-bold text-emerald-900">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>Duplicate Check Passed — Unique record ready for verification &amp; storage.</span>
              </div>
            )}
          </div>

          {/* Step 3: Verification, Approval & Processing History */}
          <div className="rounded-xl border-2 border-[#ca8a04] bg-amber-50/40 p-2.5 flex flex-col justify-between space-y-2" style={{ borderTopWidth: '4px' }}>
            <div>
              <div className="text-[9px] font-black uppercase text-amber-900">
                3. Review, Approval &amp; Vault Storage
              </div>
              <label className="mt-1 block text-[8px] font-bold text-blue-950">
                Verification Notes
              </label>
              <Input
                value={mailItem.notes}
                onChange={(e) => setMailItem({ ...mailItem, notes: e.target.value })}
                placeholder="Verified original sighting / reference number..."
                className="h-7 text-xs bg-white"
              />
            </div>

            <Button
              type="submit"
              disabled={routing}
              className="w-full bg-[#ca8a04] text-xs font-black text-white hover:bg-amber-700"
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              {routing ? 'Routing to Register...' : 'Approve & Store in Target Register'}
            </Button>
          </div>
        </form>

        {/* Full Mailroom Processing History */}
        {history.length > 0 && (
          <div className="rounded-xl border-2 border-[#7c3aed] overflow-hidden">
            <div className="px-3 py-1 text-[8px] font-black uppercase text-white" style={{ background: HEADER_GRADIENT }}>
              Smart Mailroom Full Processing History
            </div>
            <div className="max-h-32 overflow-y-auto divide-y divide-purple-200 bg-white text-[8px]">
              {history.map((h) => (
                <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-1">
                  <span className="font-black text-blue-950">
                    {h.id} · {h.title} ({h.docType})
                  </span>
                  <span className="font-semibold text-purple-800">
                    Matched: {h.personName} → {h.targetRegister} · Owner: {h.owner}
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {h.status} · {h.processedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}