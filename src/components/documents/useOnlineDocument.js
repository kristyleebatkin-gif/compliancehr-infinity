import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadCompanyBranding } from '@/lib/companyBranding';
import { loadEmployeeForm, syncEmployeeRecord } from '@/lib/employeeRecordBridge';
import { blankOnlineDocument, documentFormKey, readOnlineDocument, saveOnlineDocumentDraft, fileOnlineDocument } from '@/lib/onlineDocumentStorage';

export default function useOnlineDocument(options) {
  const { open, title, code, definition, libraryKey, intakeCase, initialAnswers = {}, onFinalize, onSaved, onOpenChange } = options;
  const [model, setModel] = useState(() => blankOnlineDocument(initialAnswers));
  const [record, setRecord] = useState(null), [records, setRecords] = useState([]);
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [page, setPage] = useState(null);
  const saving = useRef(false), baseline = useRef('');
  const key = documentFormKey(libraryKey, title, intakeCase?.id);
  const query = (owner) => ({ form_template_id: key, saved_by_user_id: owner });
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true); setError(''); setNotice('');
    (async () => {
      const me = await base44.auth.me();
      const [saved, drafts] = await Promise.all([
        base44.entities.FormSubmission.filter(query(me.id), { sort: '-updated_date', limit: 20 }),
        base44.entities.FormSubmission.filter({ ...query(me.id), status: 'Draft' }, { sort: '-updated_date', limit: 1 }),
        loadCompanyBranding(),
      ]);
      if (!active) return;
      const draft = drafts.items[0] || null;
      const shared = libraryKey.startsWith('staff-') || intakeCase?.intake_type === 'Employee'
        ? await loadEmployeeForm({ profileId: libraryKey.startsWith('staff-') ? libraryKey.slice(6) : undefined, intakeCaseId: intakeCase?.id, title }) : null;
      const defaults = Object.fromEntries((definition.fields || []).filter((field) => shared?.defaults?.[field.label] !== undefined).map((field) => [field.label, shared.defaults[field.label]]));
      const prefill = { ...initialAnswers, ...defaults, ...shared?.answers };
      const data = draft ? readOnlineDocument(draft, prefill) : blankOnlineDocument(prefill);
      if (draft && shared) data.answers = { ...defaults, ...data.answers };
      if (shared) {
        data.answers = { ...data.answers, ...shared.answers };
        if (Array.isArray(shared.answers.__rows)) data.tableRows = shared.answers.__rows;
      }
      setUser(me); setRecords(saved.items); setPage(saved); setRecord(draft); setModel(data); baseline.current = JSON.stringify(data);
      if (draft) setNotice('Your saved draft has been restored.');
    })().catch((e) => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, key]);
  const select = (id) => {
    if (JSON.stringify(model) !== baseline.current && !window.confirm('Discard unsaved changes? Save a draft first to keep them.')) return;
    const selected = records.find((item) => item.id === id) || null;
    const data = selected ? readOnlineDocument(selected, initialAnswers) : blankOnlineDocument(initialAnswers);
    setRecord(selected); setModel(data); baseline.current = JSON.stringify(data); setError(''); setNotice('');
  };
  const save = async (complete = false) => {
    if (saving.current || !user) return;
    saving.current = true; setBusy(true); setError(''); setNotice('');
    try {
      if (complete && (!model.name.trim() || !model.confirmed || !(model.signature || '').startsWith('data:image/'))) throw new Error('Add your name, sign in the signature pad and confirm the declaration before completing this document.');
      const draft = await saveOnlineDocumentDraft({ record, title, libraryKey, intakeCase, model, user });
      if (libraryKey.startsWith('staff-') || intakeCase?.intake_type === 'Employee') await syncEmployeeRecord('FormSubmission', draft.id);
      setRecord(draft); baseline.current = JSON.stringify(model);
      setRecords((items) => [draft, ...items.filter((item) => item.id !== draft.id)]);
      if (complete) {
        const file_uri = await fileOnlineDocument({ title, code, definition, model, user, libraryKey, onFinalize });
        await base44.entities.FormSubmission.update(draft.id, { status: 'Submitted', submitted_date: new Date().toISOString().slice(0, 10), submitted_document_url: file_uri });
        await onSaved?.(); onOpenChange(false);
      } else setNotice('Draft saved online. Reopen this form to continue later.');
    } catch (e) { setError(e.message); }
    finally { saving.current = false; setBusy(false); }
  };
  const more = async () => {
    setBusy(true); setError('');
    try {
      const next = await base44.entities.FormSubmission.filter(query(user.id), { sort: '-updated_date', limit: 20, cursor: page.next_cursor });
      setRecords((items) => [...items, ...next.items]); setPage(next);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const close = () => {
    if (saving.current) return;
    if (JSON.stringify(model) !== baseline.current && !window.confirm('Close without saving? Use Save draft to keep your changes.')) return;
    onOpenChange(false);
  };
  const download = async () => {
    setBusy(true); setError('');
    try { const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: record.submitted_document_url }); window.open(signed_url, '_blank', 'noopener,noreferrer'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const editCopy = () => { setRecord(null); setModel((current) => ({ ...current, confirmed: false })); };
  return { model, setModel, record, records, loading, busy, error, notice, save, select, more, hasMore: page?.has_more, close, download, editCopy, ready: !!user };
}