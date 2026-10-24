import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Printer, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { downloadCsv } from '@/lib/csvExport';
import {
  MASTER_17_AUDIT_CATEGORIES,
  MASTER_98_DOCUMENTS,
} from '@/lib/masterControlAndAuditData';

export function MasterAudit356Tab({
  evidencedCount,
  selectedCat,
  setSelectedCat,
  chkSearch,
  setChkSearch,
  chkFilter,
  setChkFilter,
  filteredCheckpoints,
  handleVerifyCheckpointEvidence,
  handleCreateCheckpointTask,
}) {
  return (
    <div className="p-3 space-y-2.5 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#442078] bg-[#F4EAFB]/40 p-2.5">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#12214B]">
            Section 4 — Master Compliance Audit: All 17 Categories &amp; 356 Individual Checkpoints (CHK-001 to CHK-356)
          </h3>
          <p className="text-[8px] font-semibold text-[#442078]">
            Rule Enforced: Checkpoints are never marked compliant based solely on a template — live operational evidence counts are verified per register.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-emerald-600 text-white text-[8px]">
            {evidencedCount} Operationally Evidenced
          </Badge>
          <Badge className="bg-amber-600 text-white text-[8px]">
            {356 - evidencedCount} Require Additional Evidence
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setSelectedCat('ALL')}
          className={`rounded-lg border px-2 py-1 text-[8px] font-black ${
            selectedCat === 'ALL'
              ? 'border-[#12214B] bg-[#12214B] text-white'
              : 'border-[#A45CDE] bg-white text-[#12214B] hover:bg-[#F4EAFB]'
          }`}
        >
          All 17 Categories (356)
        </button>
        {MASTER_17_AUDIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCat(cat.id)}
            className={`rounded-lg border px-2 py-1 text-[8px] font-black ${
              selectedCat === cat.id
                ? 'border-[#7138B6] bg-[#7138B6] text-white'
                : 'border-[#A45CDE]/60 bg-white text-[#12214B] hover:bg-[#F4EAFB]'
            }`}
          >
            {cat.id}: {cat.title.slice(0, 26)} ({cat.checkpointCount})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-[#442078]" />
          <Input
            value={chkSearch}
            onChange={(e) => setChkSearch(e.target.value)}
            placeholder="Search 356 checkpoints by ID (e.g. CHK-001), subject, legislation, or required doc (DOC-001)..."
            className="h-7 pl-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-1">
          {[
            ['ALL', `All (${filteredCheckpoints.length})`],
            ['EVIDENCED', 'Operationally Evidenced'],
            ['GAP', 'Template Only / Action Needed'],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setChkFilter(val)}
              className={`rounded-lg border px-2.5 py-1 text-[8px] font-black ${
                chkFilter === val
                  ? 'border-[#184A9C] bg-[#184A9C] text-white'
                  : 'border-[#A45CDE] bg-white text-[#12214B]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-xl border-2 border-[#12214B]">
        <table className="w-full border-collapse text-left text-[8.5px]">
          <thead className="sticky top-0 z-10 bg-[#12214B] text-white">
            <tr>
              <th className="p-1.5 font-black">ID</th>
              <th className="p-1.5 font-black">Category</th>
              <th className="p-1.5 font-black">Checkpoint Subject &amp; Legislation</th>
              <th className="p-1.5 font-black">Req. Doc</th>
              <th className="p-1.5 font-black">Operational Evidence</th>
              <th className="p-1.5 font-black">Assessment Status</th>
              <th className="p-1.5 font-black">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A45CDE]/30 bg-white">
            {filteredCheckpoints.map((chk) => {
              const evidenced =
                chk.hasOperationalEvidence || chk.assessmentResult === 'Operationally Evidenced';
              return (
                <tr key={chk.id} className="hover:bg-[#F4EAFB]/40">
                  <td className="p-1.5 font-mono font-black text-[#12214B] whitespace-nowrap">
                    {chk.id}
                  </td>
                  <td className="p-1.5 font-bold text-[#442078]">
                    <span className="rounded bg-[#F4EAFB] px-1.5 py-0.5 text-[7.5px] font-black">
                      {chk.categoryId}
                    </span>
                  </td>
                  <td className="p-1.5">
                    <div className="font-black text-[#12214B]">{chk.subject}</div>
                    <div className="text-[7.5px] font-semibold text-[#184A9C]">{chk.legislation}</div>
                  </td>
                  <td className="p-1.5 font-mono font-black text-[#7138B6] whitespace-nowrap">
                    {chk.requiredDocCode}
                  </td>
                  <td className="p-1.5">
                    <div className="font-bold text-[#12214B]">
                      Register: <span className="uppercase">{chk.evidenceEntity}</span> ({chk.evidenceCount} live records)
                    </div>
                    <div className="text-[7px] text-[#442078]">{chk.gapIdentified}</div>
                  </td>
                  <td className="p-1.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[7.5px] font-black text-white ${
                        evidenced ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                    >
                      {chk.assessmentResult}
                    </span>
                  </td>
                  <td className="p-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleVerifyCheckpointEvidence(chk)}
                        className="h-6 bg-[#184A9C] px-2 text-[7.5px] font-black text-white hover:bg-[#12214B]"
                      >
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateCheckpointTask(chk)}
                        className="h-6 border-[#7138B6] px-2 text-[7.5px] font-black text-[#7138B6] hover:bg-[#F4EAFB]"
                      >
                        + Corrective Task
                      </Button>
                      <Link
                        to={chk.route}
                        className="inline-flex h-6 items-center rounded border border-[#12214B] px-1.5 text-[7.5px] font-black text-[#12214B]"
                      >
                        Register
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocumentControl98Tab({
  docSearch,
  setDocSearch,
  docCatFilter,
  setDocCatFilter,
  previewDoc,
  setPreviewDoc,
  filtered98Docs,
  handleDownloadWordDoc,
  handleFileDocToPolicyRegister,
}) {
  return (
    <div className="p-3 space-y-2.5 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#12214B] bg-[#F4EAFB]/50 p-2.5">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#12214B]">
            Section 5 &amp; 25 — Master Document &amp; Document Control Register (All 98 Reconciled Entries · DOC-001 to DOC-098)
          </h3>
          <p className="text-[8px] font-semibold text-[#442078]">
            Reconciled with all 356 Audit Checkpoints · Approved Dark Navy (#12214B) &amp; Deep Purple (#442078) Document Styling · Word (.doc), PDF &amp; Excel Register Exports
          </p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            downloadCsv(
              'master-document-control-register-98.csv',
              [
                { key: 'code', label: 'Doc Code' },
                { key: 'docNumber', label: 'Controlled Number' },
                { key: 'categoryId', label: 'Audit Category' },
                { key: 'title', label: 'Document Title' },
                { key: 'docType', label: 'Type' },
                { key: 'version', label: 'Version' },
                { key: 'issueDate', label: 'Issue Date' },
                { key: 'reviewDate', label: 'Review Date' },
                { key: 'approvedBy', label: 'Approved By' },
                { key: 'status', label: 'Status' },
                { key: 'audience', label: 'Audience' },
              ],
              MASTER_98_DOCUMENTS
            )
          }
          className="h-7 bg-[#12214B] px-2.5 text-[8.5px] font-black text-white hover:bg-[#184A9C]"
        >
          <Download className="mr-1 h-3 w-3" />
          Export 98-Doc Master Register (Excel/CSV)
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-[#442078]" />
          <Input
            value={docSearch}
            onChange={(e) => setDocSearch(e.target.value)}
            placeholder="Search 98 controlled documents by code (DOC-001), number (CHR-2026-001), title, or type..."
            className="h-7 pl-8 text-xs"
          />
        </div>
        <select
          value={docCatFilter}
          onChange={(e) => setDocCatFilter(e.target.value)}
          className="h-7 rounded-md border border-[#A45CDE] bg-white px-2 text-xs font-bold text-[#12214B]"
        >
          <option value="ALL">All 17 Audit Categories ({MASTER_98_DOCUMENTS.length} Docs)</option>
          {MASTER_17_AUDIT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id}: {c.title}
            </option>
          ))}
        </select>
      </div>

      {previewDoc && (
        <div className="rounded-xl border-4 border-[#12214B] bg-white p-3 shadow-lg space-y-2">
          <div className="border-t-8 border-[#12214B] bg-[#F4EAFB] p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[8px] font-black uppercase tracking-wider text-[#7138B6]">
                SECTION 25 APPROVED MASTER DOCUMENT PREVIEW · {previewDoc.docNumber}
              </span>
              <h4 className="text-sm font-black text-[#12214B]">
                {previewDoc.code}: {previewDoc.title}
              </h4>
              <p className="text-[8px] font-bold text-[#184A9C]">
                Version: {previewDoc.version} · Issue: {previewDoc.issueDate} · Review: {previewDoc.reviewDate} · Approved By: {previewDoc.approvedBy}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                onClick={() => handleDownloadWordDoc(previewDoc)}
                className="h-7 bg-[#184A9C] px-2.5 text-[8px] font-black text-white"
              >
                <Download className="mr-1 h-3 w-3" /> Word (.doc)
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="h-7 bg-[#7138B6] px-2.5 text-[8px] font-black text-white"
              >
                <Printer className="mr-1 h-3 w-3" /> Print / Save PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewDoc(null)}
                className="h-7 px-2 text-[8px] font-black"
              >
                Close
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[8.5px]">
            <div className="rounded-lg border border-[#A45CDE] p-2">
              <div className="font-black text-[#442078] uppercase">1. Subject &amp; Purpose</div>
              <p className="mt-0.5 text-[#12214B]">{previewDoc.purpose}</p>
            </div>
            <div className="rounded-lg border border-[#A45CDE] p-2">
              <div className="font-black text-[#442078] uppercase">2. Procedures &amp; Responsibilities</div>
              <p className="mt-0.5 text-[#12214B]">{previewDoc.responsibilities}</p>
            </div>
            <div className="rounded-lg border border-[#A45CDE] p-2">
              <div className="font-black text-[#442078] uppercase">3. Reconciled Audit Checkpoints</div>
              <p className="mt-0.5 font-mono font-bold text-[#184A9C]">
                {previewDoc.linkedCheckpoints.join(', ')}
              </p>
              <p className="mt-1 text-[#442078]">{previewDoc.requiredFields}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-[420px] overflow-auto rounded-xl border-2 border-[#12214B]">
        <table className="w-full border-collapse text-left text-[8.5px]">
          <thead className="sticky top-0 z-10 bg-[#442078] text-white">
            <tr>
              <th className="p-1.5 font-black">Code</th>
              <th className="p-1.5 font-black">Doc Number</th>
              <th className="p-1.5 font-black">Controlled Document Title</th>
              <th className="p-1.5 font-black">Type / Audience</th>
              <th className="p-1.5 font-black">Version &amp; Review</th>
              <th className="p-1.5 font-black">Linked Checkpoints</th>
              <th className="p-1.5 font-black">Actions (Word / PDF / Register)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A45CDE]/30 bg-white">
            {filtered98Docs.map((doc) => (
              <tr key={doc.code} className="hover:bg-[#F4EAFB]/40">
                <td className="p-1.5 font-mono font-black text-[#12214B] whitespace-nowrap">
                  {doc.code}
                </td>
                <td className="p-1.5 font-mono font-bold text-[#184A9C] whitespace-nowrap">
                  {doc.docNumber}
                </td>
                <td className="p-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-[#12214B]">{doc.title}</span>
                    {doc.confidential && (
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[7px] font-black text-rose-800">
                        Confidential
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-1.5 text-[#442078] font-semibold">
                  {doc.docType} · {doc.audience}
                </td>
                <td className="p-1.5 whitespace-nowrap">
                  <span className="font-black text-[#12214B]">{doc.version}</span> · Due {doc.reviewDate}
                </td>
                <td className="p-1.5 font-mono text-[7.5px] font-bold text-[#7138B6]">
                  {doc.linkedCheckpoints.join(', ')}
                </td>
                <td className="p-1.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewDoc(doc)}
                      className="h-6 border-[#12214B] px-2 text-[7.5px] font-black text-[#12214B]"
                    >
                      <Eye className="mr-1 h-2.5 w-2.5" /> Inspect
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownloadWordDoc(doc)}
                      className="h-6 bg-[#184A9C] px-2 text-[7.5px] font-black text-white hover:bg-[#12214B]"
                    >
                      Word (.doc)
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleFileDocToPolicyRegister(doc)}
                      className="h-6 bg-[#7138B6] px-2 text-[7.5px] font-black text-white hover:bg-[#442078]"
                    >
                      + File to Register
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}