import React, { useState, useMemo } from 'react';
import {
  Search, Download, FileCheck2, CheckCircle2, Layers, Stethoscope, BookOpen, Filter,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { downloadCsv } from '@/lib/csvExport';
import { logUserAction } from '@/lib/actionLog';
import {
  ALLIED_HEALTH_NUMBERED_CATALOGUE,
  MASTER_12_DOCUMENT_REGISTERS,
} from '@/lib/masterDocumentAndAlliedHealthCatalogueData';
import MasterDocumentAndAlliedHealthCatalogueModal from '@/components/enterprise/MasterDocumentAndAlliedHealthCatalogueModal';

export default function AlliedHealthMasterCataloguePanel({ participants = [], staff = [] }) {
  const { toast } = useToast();
  const [catalogueView, setCatalogueView] = useState('allied-health'); // allied-health | master-12
  const [selectedDiscipline, setSelectedDiscipline] = useState('ALL');
  const [selectedRegister, setSelectedRegister] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [syncingRegister, setSyncingRegister] = useState(false);

  const alliedDisciplines = useMemo(() => {
    const set = new Set(ALLIED_HEALTH_NUMBERED_CATALOGUE.map((i) => i.discipline));
    return ['ALL', ...Array.from(set)];
  }, []);

  const masterRegistersList = useMemo(() => {
    const set = new Set(MASTER_12_DOCUMENT_REGISTERS.map((i) => i.registerTitle));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredItems = useMemo(() => {
    const source =
      catalogueView === 'allied-health'
        ? ALLIED_HEALTH_NUMBERED_CATALOGUE
        : MASTER_12_DOCUMENT_REGISTERS;

    return source.filter((item) => {
      if (catalogueView === 'allied-health' && selectedDiscipline !== 'ALL' && item.discipline !== selectedDiscipline) {
        return false;
      }
      if (catalogueView === 'master-12' && selectedRegister !== 'ALL' && item.registerTitle !== selectedRegister) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.code?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.subGroup?.toLowerCase().includes(q) ||
        item.clinicalOwner?.toLowerCase().includes(q) ||
        item.ndisStandard?.toLowerCase().includes(q) ||
        item.agedCareStandard?.toLowerCase().includes(q)
      );
    });
  }, [catalogueView, selectedDiscipline, selectedRegister, searchQuery]);

  const handleExportCatalogueCsv = () => {
    downloadCsv(
      `${catalogueView}-numbered-catalogue-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: 'code', label: 'Catalogue ID' },
        { key: 'domain', label: 'Discipline / Register' },
        { key: 'subGroup', label: 'Category / Sub-Group' },
        { key: 'title', label: 'Official Document / Assessment Name' },
        { key: 'docType', label: 'Document Type' },
        { key: 'clinicalOwner', label: 'Clinical / Operational Owner' },
        { key: 'reviewCycle', label: 'Review Cycle' },
        { key: 'ndisStandard', label: 'NDIS Practice Standard Mapping' },
        { key: 'agedCareStandard', label: 'Strengthened Aged Care Standard Mapping' },
      ],
      filteredItems.map((i) => ({
        code: i.code,
        domain: i.discipline || i.registerTitle,
        subGroup: i.subGroup,
        title: i.title,
        docType: i.docType,
        clinicalOwner: i.clinicalOwner,
        reviewCycle: i.reviewCycle,
        ndisStandard: i.ndisStandard,
        agedCareStandard: i.agedCareStandard,
      }))
    );
  };

  const handleSyncVisibleToDocumentControl = async () => {
    setSyncingRegister(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const batch = filteredItems.slice(0, 15).map((item) => ({
        title: `${item.code} — ${item.title}`,
        document_id: item.code,
        version: 'v2.4',
        status: 'Approved',
        document_category: item.operatingSystem?.includes('HR') ? 'Human Resources' : 'Clinical',
        business_unit: item.discipline || item.registerTitle || 'Allied Health OS',
        owner: item.clinicalOwner,
        approved_by: 'Director of Clinical Governance',
        approval_date: today,
        review_date: today,
        change_summary: `${item.ndisStandard} | ${item.agedCareStandard} | Review Cycle: ${item.reviewCycle}`,
      }));

      await base44.entities.DocumentControl.bulkCreate(batch);
      await logUserAction('Master Catalogue Batch Synced to DocumentControl', 'DocumentControl', {
        record_id: today,
        record_title: `Synced ${batch.length} numbered catalogue items`,
        details: `View: ${catalogueView}`,
      });

      toast({
        title: `Synced ${batch.length} catalogue items to Document Control Register`,
        description: 'Records are now live in Governance & Document Control with owners, review cycles, and standard mappings.',
      });
    } catch (err) {
      toast({
        title: 'Could not sync batch',
        description: err?.message || 'Check permissions and try again.',
        variant: 'destructive',
      });
    } finally {
      setSyncingRegister(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Switcher & Summary Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCatalogueView('allied-health')}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
              catalogueView === 'allied-health'
                ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white'
                : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Numbered Allied Health OS Catalogue ({ALLIED_HEALTH_NUMBERED_CATALOGUE.length} Artefacts)</span>
          </button>

          <button
            type="button"
            onClick={() => setCatalogueView('master-12')}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
              catalogueView === 'master-12'
                ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white'
                : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>12 Master Document Registers ({MASTER_12_DOCUMENT_REGISTERS.length} Documents)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handleExportCatalogueCsv}
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-[#5A00D6]" />
            Export {filteredItems.length} Rows CSV
          </Button>
          <Button
            size="sm"
            type="button"
            disabled={syncingRegister}
            onClick={handleSyncVisibleToDocumentControl}
          >
            <FileCheck2 className="mr-1.5 h-3.5 w-3.5" />
            {syncingRegister ? 'Syncing…' : 'Sync Batch to Document Control'}
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="sm:col-span-5">
          {catalogueView === 'allied-health' ? (
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-[#0A2B6D]"
            >
              {alliedDisciplines.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All 11 Allied Health OS Catalogue Domains' : d}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedRegister}
              onChange={(e) => setSelectedRegister(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-[#0A2B6D]"
            >
              {masterRegistersList.map((r) => (
                <option key={r} value={r}>
                  {r === 'ALL' ? 'All 12 Master Enterprise Document Registers' : r}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="relative sm:col-span-7">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by code (e.g. AH-OT-006, REG01-001), document title, clinical owner, NDIS or Aged Care standard…"
            className="h-10 pl-9 text-sm"
          />
        </div>
      </div>

      {/* High-Density Enterprise Register Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
              <th className="py-3 px-3.5">Code</th>
              <th className="py-3 px-3.5">Discipline / Register &amp; Sub-Group</th>
              <th className="py-3 px-3.5">Document / Assessment / Artefact</th>
              <th className="py-3 px-3.5">Clinical / Operational Owner</th>
              <th className="py-3 px-3.5">Review Cycle</th>
              <th className="py-3 px-3.5">NDIS &amp; Aged Care Standards Mapping</th>
              <th className="py-3 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredItems.map((item) => (
              <tr key={item.code} className="hover:bg-slate-50/80 transition">
                <td className="py-2.5 px-3.5 font-mono font-bold text-[#0072FF] whitespace-nowrap">
                  {item.code}
                </td>
                <td className="py-2.5 px-3.5">
                  <div className="font-bold text-[#0A2B6D]">
                    {item.discipline || item.registerTitle}
                  </div>
                  <div className="text-[#0A2B6D]/65">{item.subGroup} · {item.docType}</div>
                </td>
                <td className="py-2.5 px-3.5 font-extrabold text-[#0A2B6D]">
                  {item.title}
                </td>
                <td className="py-2.5 px-3.5 font-medium text-[#0A2B6D]/85">
                  {item.clinicalOwner}
                </td>
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                    {item.reviewCycle}
                  </Badge>
                </td>
                <td className="py-2.5 px-3.5">
                  <div className="font-semibold text-[#0A2B6D]">{item.ndisStandard}</div>
                  <div className="text-[#5A00D6]">{item.agedCareStandard}</div>
                </td>
                <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setActiveModalItem(item)}
                  >
                    Open 13-Section Form
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeModalItem && (
        <MasterDocumentAndAlliedHealthCatalogueModal
          item={activeModalItem}
          participants={participants}
          staff={staff}
          onClose={() => setActiveModalItem(null)}
        />
      )}
    </div>
  );
}