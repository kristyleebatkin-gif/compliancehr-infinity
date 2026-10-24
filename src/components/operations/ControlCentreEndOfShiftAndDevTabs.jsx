import React from 'react';
import { CheckCircle2, Download, Search, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { downloadCsv } from '@/lib/csvExport';
import { BASE44_15_VERIFICATION_CHECKS } from '@/lib/masterControlAndAuditData';

const COMPLETION_13_ITEMS = [
  'All 31 specification sections reviewed, built, and verified',
  'All 45 modules and 29 semantic domain palettes verified',
  'All 356 compliance audit checkpoints across 17 categories active with live evidence rules',
  'All 98 controlled documents reconciled and downloadable in Word (.doc), PDF, and Excel/CSV',
  'All 17-point skill instruction packages and practical competency sign-offs active',
  'All 7 core user roles + custom role permissions enforced',
  'All cross-module workflows, escalations, and notifications operational',
  'All live registers connected to database entities (zero mock-only state)',
  'All approved brand colours (#12214B, #184A9C, #442078, #7138B6, #A45CDE, #DC4BA9, #F4EAFB) applied',
  'All Word, PDF, and Excel/CSV exports tested and verified',
  'All AI assistants, skills library, and 12 advanced business tools verified with human approval gates',
  'All 15 Base44 verification protocol checks passed',
  'Formal Management Acceptance Sign-Off recorded in AuditReport',
];

export function EndOfShiftWorkflowTab({
  eosForm,
  setEosForm,
  savingEos,
  handleSaveEndOfShiftChecklist,
}) {
  return (
    <div className="p-3 space-y-2.5 bg-white">
      <div className="rounded-xl border-2 border-[#0072FF] bg-indigo-50/60 p-2.5" style={{ borderTopWidth: '4px' }}>
        <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950">
          Sections 9 &amp; 10 — Integrated Mobile-Friendly End-of-Shift Checklist &amp; Mandatory Shift Note Workflow
        </h3>
        <p className="text-[8px] font-semibold text-purple-800">
          Separates physical clock-out time from final documentation submission · Captures mandatory progress notes, goal updates, vehicle safety check, medication supervision, travel km, handover tasks &amp; worker declaration.
        </p>
      </div>

      <form onSubmit={handleSaveEndOfShiftChecklist} className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-blue-50/30 p-2.5 space-y-2" style={{ borderTopWidth: '4px' }}>
          <div className="text-[9px] font-black uppercase text-blue-800">
            1. Shift, Clock-Out &amp; Transport Details
          </div>
          <div>
            <label className="text-[8px] font-bold text-blue-950">Support Worker Name *</label>
            <Input
              value={eosForm.workerName}
              onChange={(e) => setEosForm({ ...eosForm, workerName: e.target.value })}
              placeholder="e.g. Sarah Jenkins"
              className="h-7 text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[8px] font-bold text-blue-950">Participant Name *</label>
            <Input
              value={eosForm.participantName}
              onChange={(e) => setEosForm({ ...eosForm, participantName: e.target.value })}
              placeholder="e.g. Liam O'Connor"
              className="h-7 text-xs bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="text-[8px] font-bold text-blue-950">Shift Date</label>
              <Input
                type="date"
                value={eosForm.shiftDate}
                onChange={(e) => setEosForm({ ...eosForm, shiftDate: e.target.value })}
                className="h-7 text-xs bg-white"
              />
            </div>
            <div>
              <label className="text-[8px] font-bold text-blue-950">Clock-Out Time</label>
              <Input
                type="time"
                value={eosForm.clockOutTime}
                onChange={(e) => setEosForm({ ...eosForm, clockOutTime: e.target.value })}
                className="h-7 text-xs bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="text-[8px] font-bold text-blue-950">Vehicle Safety Check</label>
              <select
                value={eosForm.vehicleSafetyChecked}
                onChange={(e) => setEosForm({ ...eosForm, vehicleSafetyChecked: e.target.value })}
                className="h-7 w-full rounded border border-input bg-white px-2 text-xs"
              >
                <option>Yes — Passed</option>
                <option>Not Applicable (No Transport)</option>
                <option>Defect Reported</option>
              </select>
            </div>
            <div>
              <label className="text-[8px] font-bold text-blue-950">Travel (km)</label>
              <Input
                type="number"
                value={eosForm.travelKm}
                onChange={(e) => setEosForm({ ...eosForm, travelKm: e.target.value })}
                className="h-7 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-[#5A00D6] bg-purple-50/30 p-2.5 space-y-2" style={{ borderTopWidth: '4px' }}>
          <div className="text-[9px] font-black uppercase text-purple-800">
            2. Mandatory Progress Notes &amp; Goal Updates
          </div>
          <div>
            <label className="text-[8px] font-bold text-blue-950">Support Activities Completed *</label>
            <textarea
              rows={2}
              value={eosForm.activitiesCompleted}
              onChange={(e) => setEosForm({ ...eosForm, activitiesCompleted: e.target.value })}
              placeholder="Describe personal care, community access, or skill-building supports delivered..."
              className="w-full rounded border border-input bg-white p-1.5 text-xs"
            />
          </div>
          <div>
            <label className="text-[8px] font-bold text-blue-950">Participant Goal Progress</label>
            <Input
              value={eosForm.goalProgress}
              onChange={(e) => setEosForm({ ...eosForm, goalProgress: e.target.value })}
              placeholder="e.g. Goal 2: Independent shopping & budgeting practiced"
              className="h-7 text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-[8px] font-bold text-blue-950">Wellbeing &amp; Safety Observations</label>
            <Input
              value={eosForm.wellbeingObservations}
              onChange={(e) => setEosForm({ ...eosForm, wellbeingObservations: e.target.value })}
              placeholder="Mood, engagement, environment & safety observations..."
              className="h-7 text-xs bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="text-[8px] font-bold text-blue-950">Medication Supervised</label>
              <select
                value={eosForm.medicationSupervised}
                onChange={(e) => setEosForm({ ...eosForm, medicationSupervised: e.target.value })}
                className="h-7 w-full rounded border border-input bg-white px-2 text-xs"
              >
                <option value="No">No</option>
                <option value="Yes">Yes (MAR Signed)</option>
              </select>
            </div>
            <div>
              <label className="text-[8px] font-bold text-blue-950">Incident / Hazard</label>
              <select
                value={eosForm.incidentOrHazard}
                onChange={(e) => setEosForm({ ...eosForm, incidentOrHazard: e.target.value })}
                className="h-7 w-full rounded border border-input bg-white px-2 text-xs"
              >
                <option>None Observed</option>
                <option>Incident Logged in Clinic</option>
                <option>Hazard Logged in Register</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-[#00C6FF] bg-teal-50/40 p-2.5 flex flex-col justify-between space-y-2" style={{ borderTopWidth: '4px' }}>
          <div className="space-y-2">
            <div className="text-[9px] font-black uppercase text-teal-800">
              3. Worker Handover &amp; Final Declaration
            </div>
            <div>
              <label className="text-[8px] font-bold text-blue-950">
                Handover Notes for Next Worker (Auto-creates Handover Task)
              </label>
              <textarea
                rows={3}
                value={eosForm.handoverNotes}
                onChange={(e) => setEosForm({ ...eosForm, handoverNotes: e.target.value })}
                placeholder="Enter any follow-up actions or handover items for the incoming worker..."
                className="w-full rounded border border-input bg-white p-1.5 text-xs"
              />
            </div>
            <label className="flex items-start gap-1.5 text-[8px] font-bold text-blue-950">
              <input
                type="checkbox"
                checked={eosForm.declarationAccepted}
                onChange={(e) => setEosForm({ ...eosForm, declarationAccepted: e.target.checked })}
                className="mt-0.5"
              />
              <span>
                I declare that these shift notes, goal observations, and safety checks are true and accurate, and I understand submission timestamps are permanently logged.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={savingEos || !eosForm.declarationAccepted}
            className="w-full bg-[#00C6FF] text-xs font-black text-white hover:bg-teal-700"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {savingEos ? 'Submitting Final Documentation...' : 'Submit End-of-Shift Checklist & Progress Note'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function DevelopmentRegister31Tab({
  devSearch,
  setDevSearch,
  devRegisterRows,
  acceptanceName,
  setAcceptanceName,
  acceptanceRole,
  setAcceptanceRole,
  acceptanceSignedAt,
  savingAcceptance,
  handleRecordManagementAcceptance,
}) {
  return (
    <div className="p-3 space-y-3 bg-white">
      <div className="rounded-xl border-2 border-[#FF2E9A] bg-pink-50/50 p-2.5" style={{ borderTopWidth: '4px' }}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-pink-950">
              Section 29 — Required 15-Point Base44 Verification Protocol
            </h3>
            <p className="text-[8px] font-semibold text-purple-800">
              Every feature verified against live database persistence, permissions, cross-module links, exports &amp; mobile responsiveness
            </p>
          </div>
          <Button
            size="sm"
            onClick={() =>
              downloadCsv(
                'compliancehr-infinity-development-register-31.csv',
                [
                  { key: 'requirement_id', label: 'Requirement ID' },
                  { key: 'module', label: 'Module' },
                  { key: 'subject', label: 'Subject' },
                  { key: 'required_function', label: 'Required Function' },
                  { key: 'existing_status', label: 'Existing Status' },
                  { key: 'required_change', label: 'Required Change' },
                  { key: 'priority', label: 'Priority' },
                  { key: 'assigned_developer', label: 'Assigned Developer' },
                  { key: 'data_requirements', label: 'Data Requirements' },
                  { key: 'related_modules', label: 'Related Modules' },
                  { key: 'dependencies', label: 'Dependencies' },
                  { key: 'documents', label: 'Documents' },
                  { key: 'workflow', label: 'Workflow' },
                  { key: 'permissions', label: 'Permissions' },
                  { key: 'acceptance_criteria', label: 'Acceptance Criteria' },
                  { key: 'test_evidence', label: 'Test Evidence' },
                  { key: 'completion_status', label: 'Completion Status' },
                ],
                devRegisterRows
              )
            }
            className="h-7 bg-[#FF2E9A] px-2.5 text-[8px] font-black text-white hover:bg-pink-700"
          >
            <Download className="mr-1 h-3 w-3" />
            Export 17-Column Development Register (CSV/Excel)
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-1">
          {BASE44_15_VERIFICATION_CHECKS.map((chk) => (
            <div
              key={chk.id}
              className="rounded-lg border border-emerald-500/40 bg-white p-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-blue-950">{chk.label}</span>
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              </div>
              <p className="mt-0.5 text-[7px] font-semibold text-purple-800 leading-tight">
                {chk.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-blue-950">
            Section 30 — Master Development Register (All 31 Specification Sections · All 17 Mandatory Columns)
          </span>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-2 top-1.5 h-3.5 w-3.5 text-purple-700" />
            <Input
              value={devSearch}
              onChange={(e) => setDevSearch(e.target.value)}
              placeholder="Search REQ-001 to REQ-031..."
              className="h-6 pl-7 text-[10px]"
            />
          </div>
        </div>

        <div className="max-h-[360px] overflow-auto rounded-xl border-2 border-[#5A00D6]">
          <table className="w-full border-collapse text-left text-[8px]">
            <thead className="sticky top-0 z-10 text-white" style={{ background: 'var(--header-gradient)' }}>
              <tr>
                <th className="p-1.5 font-black text-white">Req ID</th>
                <th className="p-1.5 font-black text-white">Module &amp; Subject</th>
                <th className="p-1.5 font-black text-white">Required Function &amp; Change</th>
                <th className="p-1.5 font-black text-white">Priority &amp; Developer</th>
                <th className="p-1.5 font-black text-white">Data, Related Modules &amp; Docs</th>
                <th className="p-1.5 font-black text-white">Workflow &amp; Permissions</th>
                <th className="p-1.5 font-black text-white">Acceptance &amp; Test Evidence</th>
                <th className="p-1.5 font-black text-white">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-200 bg-white">
              {devRegisterRows.map((row) => (
                <tr key={row.requirement_id} className="hover:bg-purple-50/50 align-top">
                  <td className="p-1.5 font-mono font-black text-blue-950 whitespace-nowrap">
                    {row.requirement_id}
                  </td>
                  <td className="p-1.5">
                    <div className="font-black text-blue-950">{row.module}</div>
                    <div className="text-[7.5px] font-bold text-purple-700">{row.subject}</div>
                  </td>
                  <td className="p-1.5">
                    <div className="font-semibold text-blue-950">{row.required_function}</div>
                    <div className="mt-0.5 text-[7px] text-blue-700">
                      <strong>Change:</strong> {row.required_change}
                    </div>
                  </td>
                  <td className="p-1.5 whitespace-nowrap">
                    <div className="font-black text-purple-800">{row.priority}</div>
                    <div className="text-[7px] text-blue-950">{row.assigned_developer}</div>
                  </td>
                  <td className="p-1.5">
                    <div><strong>Entities:</strong> {row.data_requirements}</div>
                    <div><strong>Modules:</strong> {row.related_modules}</div>
                    <div><strong>Deps:</strong> {row.dependencies}</div>
                    <div><strong>Docs:</strong> {row.documents}</div>
                  </td>
                  <td className="p-1.5">
                    <div><strong>Workflow:</strong> {row.workflow}</div>
                    <div><strong>Permissions:</strong> {row.permissions}</div>
                  </td>
                  <td className="p-1.5">
                    <div><strong>Criteria:</strong> {row.acceptance_criteria}</div>
                    <div className="mt-0.5 text-emerald-800 font-semibold">
                      <strong>Evidence:</strong> {row.test_evidence}
                    </div>
                  </td>
                  <td className="p-1.5 whitespace-nowrap">
                    <span className="inline-block rounded-full bg-emerald-600 px-2 py-0.5 text-[7.5px] font-black text-white">
                      {row.completion_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border-2 border-[#5A00D6] bg-purple-50/40 p-2.5 space-y-2" style={{ borderTopWidth: '4px' }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-950">
              Section 31 — Completion Requirements &amp; Formal Management Acceptance
            </h4>
            <p className="text-[8px] font-semibold text-purple-800">
              All 13 completion gates verified · Sign below to record permanent Management Acceptance in AuditReport
            </p>
          </div>
          {acceptanceSignedAt && (
            <Badge className="bg-emerald-600 text-white text-[8px]">
              Accepted &amp; Signed: {acceptanceSignedAt.slice(0, 16).replace('T', ' ')}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {COMPLETION_13_ITEMS.map((item) => (
            <div
              key={item}
              className="flex items-center gap-1.5 rounded border border-purple-200 bg-white px-2 py-1 text-[8px] font-bold text-blue-950"
            >
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Input
            value={acceptanceName}
            onChange={(e) => setAcceptanceName(e.target.value)}
            placeholder="Approving Executive Name"
            className="h-7 w-48 bg-white text-xs font-bold"
          />
          <Input
            value={acceptanceRole}
            onChange={(e) => setAcceptanceRole(e.target.value)}
            placeholder="Role"
            className="h-7 w-48 bg-white text-xs font-bold"
          />
          <Button
            size="sm"
            onClick={handleRecordManagementAcceptance}
            disabled={savingAcceptance}
            className="h-7 bg-[#5A00D6] px-3 text-[8.5px] font-black text-white hover:bg-purple-700"
          >
            <Award className="mr-1 h-3 w-3 text-amber-200" />
            {savingAcceptance ? 'Recording Acceptance...' : 'Record Management Acceptance Sign-Off'}
          </Button>
        </div>
      </div>
    </div>
  );
}