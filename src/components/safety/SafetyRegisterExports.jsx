import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import SectionCard from '@/components/SectionCard';
import { downloadCsv } from '@/lib/csvExport';
import { downloadSafetyDocument, SAFETY_DOCUMENTS } from '@/lib/safetyDocuments';
import { Download, FileDown, Loader2 } from 'lucide-react';

const QUICK_FORMS = ['Incident Report', 'Investigation Report', 'Take Five Assessment', 'Risk Assessment'];

export const INCIDENT_CSV_COLUMNS = [
  { key: 'incident_id', label: 'Incident ID' }, { key: 'title', label: 'Title' },
  { key: 'date_occurred', label: 'Date' }, { key: 'time_occurred', label: 'Time' },
  { key: 'reported_by', label: 'Reported By' }, { key: 'received_by', label: 'Received By' },
  { key: 'participant_name', label: 'Participant' }, { key: 'staff_name', label: 'Staff' },
  { key: 'category', label: 'Category' }, { key: 'severity', label: 'Severity' }, { key: 'status', label: 'Status' },
  { key: 'description', label: 'What Happened' }, { key: 'immediate_actions', label: 'Follow-up Actions' },
  { key: 'requires_ndis_report', label: 'NDIS Reportable' },
];

export const INVESTIGATION_CSV_COLUMNS = [
  { key: 'investigation_id', label: 'Investigation ID' }, { key: 'title', label: 'Title' },
  { key: 'incident_id', label: 'Related Incident' }, { key: 'investigator', label: 'Investigator (Person Performed)' },
  { key: 'start_date', label: 'Date' }, { key: 'time', label: 'Time' }, { key: 'status', label: 'Status' },
  { key: 'findings', label: 'Findings' }, { key: 'recommendations', label: 'Follow-up Actions' },
  { key: 'corrective_actions', label: 'Corrective Actions / Responsible' },
];

export const RISK_CSV_COLUMNS = [
  { key: 'risk_id', label: 'Risk ID' }, { key: 'title', label: 'Title' }, { key: 'report_type', label: 'Report Type' },
  { key: 'category', label: 'Category' }, { key: 'participant_name', label: 'Participant' },
  { key: 'likelihood', label: 'Likelihood' }, { key: 'consequence', label: 'Consequence' },
  { key: 'rating', label: 'Risk Rating' }, { key: 'status', label: 'Status' }, { key: 'owner', label: 'Owner' },
  { key: 'mitigation_plan', label: 'Mitigation Plan' }, { key: 'review_date', label: 'Review Date' },
];

export const HAZARD_CSV_COLUMNS = [
  { key: 'risk_id', label: 'Hazard ID' }, { key: 'title', label: 'Hazard' }, { key: 'report_type', label: 'Report Type' },
  { key: 'description', label: 'Location / Details' }, { key: 'identified_date', label: 'Date Identified' },
  { key: 'likelihood', label: 'Likelihood' }, { key: 'consequence', label: 'Consequence' },
  { key: 'rating', label: 'Risk Rating' }, { key: 'status', label: 'Status' }, { key: 'owner', label: 'Owner' },
];

export const TAKE5_CSV_COLUMNS = [
  { key: 'assessment_id', label: 'Assessment ID' }, { key: 'task', label: 'Task / Activity' },
  { key: 'worker_name', label: 'Worker' }, { key: 'supervisor', label: 'Supervisor' },
  { key: 'location', label: 'Location' }, { key: 'assessment_date', label: 'Date' }, { key: 'assessment_time', label: 'Time' },
  { key: 'hazards_identified', label: 'Risks / Hazards Identified' }, { key: 'potential_harm', label: 'Potential Harm' },
  { key: 'likelihood', label: 'Likelihood' }, { key: 'consequence', label: 'Consequence' },
  { key: 'risk_rating', label: 'Risk Rating' }, { key: 'residual_risk', label: 'Residual Risk' },
  { key: 'control_measures', label: 'Control Measures' }, { key: 'safe_to_proceed', label: 'Safe to Proceed' },
  { key: 'status', label: 'Status' },
];

export default function SafetyRegisterExports({ incidents = [], investigations = [], risks = [] }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState('');

  const guard = (name, run) => {
    if (busy) return;
    setBusy(name);
    setTimeout(() => {
      try {
        run();
      } catch (error) {
        toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
      } finally {
        setBusy('');
      }
    }, 30);
  };

  const exportIncidents = () => guard('inc', () => {
    if (!incidents.length) { toast({ title: 'No incidents to export' }); return; }
    downloadCsv('Incident Register.csv', INCIDENT_CSV_COLUMNS, incidents);
    toast({ title: 'Incident register exported' });
  });

  const exportInvestigations = () => guard('inv', () => {
    if (!investigations.length) { toast({ title: 'No investigations to export' }); return; }
    downloadCsv('Investigation Register.csv', INVESTIGATION_CSV_COLUMNS, investigations);
    toast({ title: 'Investigation register exported' });
  });

  const downloadForm = (type) => {
    const document = SAFETY_DOCUMENTS.find((d) => d.type === type);
    if (!document) return;
    downloadSafetyDocument(document);
  };

  return (
    <SectionCard
      title="Registers & Form Downloads"
      description="Export the live registers as CSV, or download branded fillable forms. Completed uploads stay registered."
    >
      <div className="flex flex-wrap gap-2">
        <button onClick={exportIncidents} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-sm font-semibold text-white hover:bg-teal/90 disabled:opacity-60">
          {busy === 'inc' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Export Incident Register (CSV)
        </button>
        <button onClick={exportInvestigations} disabled={!!busy} className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-sm font-semibold text-white hover:bg-teal/90 disabled:opacity-60">
          {busy === 'inv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Export Investigation Register (CSV)
        </button>
      </div>
      {risks.length > 0 && (
        <button onClick={() => guard('risk', () => {
          downloadCsv('Risk Register.csv', RISK_CSV_COLUMNS, risks);
          toast({ title: 'Risk register exported' });
        })} disabled={!!busy} className="ml-0 flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-sm font-semibold text-white hover:bg-teal/90 disabled:opacity-60">
          {busy === 'risk' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Export Risk Register (CSV)
        </button>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_FORMS.map((type) => (
          <button key={type} onClick={() => downloadForm(type)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
            <FileDown className="h-3.5 w-3.5 text-brand" />Download {type} form
          </button>
        ))}
      </div>
    </SectionCard>
  );
}