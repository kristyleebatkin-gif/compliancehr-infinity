import { buildChecklistPdf, downloadChecklistPdf } from '@/lib/checklistsPdf';

const manualFields = (m) => [
  { label: 'Equipment', value: m.equipment_name || '' },
  { label: 'Category', value: m.category || '' },
  { label: 'Manufacturer / model', value: [m.manufacturer, m.model].filter(Boolean).join('  |  ') },
  { label: 'Manual version', value: m.version || '' },
  { label: 'Operating instructions', value: m.operating_instructions || '', multiline: true },
  { label: 'Maintenance schedule', value: m.maintenance_schedule || '', multiline: true },
  { label: 'Safety notes', value: m.safety_notes || '', multiline: true },
  { label: 'Stored manual file', value: m.manual_file_name || (m.manual_url ? `Online: ${m.manual_url}` : '') },
  { label: 'Next review', value: m.review_date || '' },
  { label: 'Notes', value: m.notes || '', multiline: true },
];

export function downloadManualRecordPdf(manual) {
  downloadChecklistPdf({
    title: manual.title,
    code: 'EM-001',
    subtitle: 'Equipment operating, maintenance and safety manual',
    fields: manualFields(manual),
    signoffFields: ['Reviewed by', 'Date', 'Next review'],
  });
}

export function manualCsvColumns() {
  return [
    { key: 'title', label: 'Title' }, { key: 'equipment_name', label: 'Equipment' },
    { key: 'category', label: 'Category' }, { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'model', label: 'Model' }, { key: 'version', label: 'Version' },
    { key: 'manual_url', label: 'Manual Link' }, { key: 'manual_file_name', label: 'Stored Manual' },
    { key: 'operating_instructions', label: 'Operating Instructions' },
    { key: 'maintenance_schedule', label: 'Maintenance Schedule' },
    { key: 'safety_notes', label: 'Safety Notes' }, { key: 'review_date', label: 'Next Review' },
    { key: 'notes', label: 'Notes' },
  ];
}