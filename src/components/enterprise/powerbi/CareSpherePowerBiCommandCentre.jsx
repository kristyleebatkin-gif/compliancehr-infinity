import React, { useState, useRef, useEffect } from 'react';
import {
  Shield, Compass, Activity, Cpu, AlertTriangle, CheckCircle2,
  ClipboardCheck, TrendingUp, Layers, ListChecks, Vote, Database,
  RefreshCw, Maximize2, Minimize2, ChevronLeft, ChevronRight,
  Mic, MessageSquareText, X, CheckSquare,
} from 'lucide-react';
import {
  POWER_BI_PAGES,
  ROLE_DRILL_THROUGH_PATHS,
} from '@/lib/careSpherePowerBiData';
import {
  CONSTITUTIONAL_PRINCIPLE,
  MANDATORY_CLOSING_STATEMENT,
  MANDATORY_OUTPUT_PILLARS,
} from '@/lib/careSphereSmeGarmData';
import {
  exportBoardPackPdf,
  exportBoardPackWord,
  exportBoardPackPowerPoint,
  exportPowerBiSemanticModel,
} from '@/lib/careSphereBoardPackExporter';
import PowerBiPagesOneToSix from '@/components/enterprise/powerbi/PowerBiPagesOneToSix';
import PowerBiPagesSevenToTwelve from '@/components/enterprise/powerbi/PowerBiPagesSevenToTwelve';

const ICON_MAP = {
  shield: Shield,
  governance: Compass,
  health: Activity,
  readiness: Cpu,
  risk: AlertTriangle,
  assurance: CheckCircle2,
  capa: ClipboardCheck,
  benefit: TrendingUp,
  raid: Layers,
  actions: ListChecks,
  board: Vote,
  ai: Database,
};

export default function CareSpherePowerBiCommandCentre() {
  const [activePage, setActivePage] = useState('p1_command');
  const [reportingPeriod, setReportingPeriod] = useState('FY27 Q2 (Current)');
  const [lastRefresh, setLastRefresh] = useState('07 Nov 2026 · 04:55 AEST (DirectLake Live)');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const containerRef = useRef(null);

  const currentIndex = Math.max(0, POWER_BI_PAGES.findIndex((p) => p.id === activePage));
  const currentPageMeta = POWER_BI_PAGES[currentIndex] || POWER_BI_PAGES[0];

  const goPrevPage = () => {
    const prevIdx = (currentIndex - 1 + POWER_BI_PAGES.length) % POWER_BI_PAGES.length;
    setActivePage(POWER_BI_PAGES[prevIdx].id);
  };

  const goNextPage = () => {
    const nextIdx = (currentIndex + 1) % POWER_BI_PAGES.length;
    setActivePage(POWER_BI_PAGES[nextIdx].id);
  };

  const togglePresentationMode = async () => {
    const nextState = !isPresentationMode;
    setIsPresentationMode(nextState);
    if (nextState && containerRef.current?.requestFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
      } catch {
        // Fallback to fixed viewport 16:9 presentation overlay when iframe blocks native fullscreen
      }
    } else if (!nextState && document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && isPresentationMode) {
        // Keep overlay unless Esc was pressed, handled below
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [isPresentationMode]);

  useEffect(() => {
    if (!isPresentationMode) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPresentationMode(false);
      } else if (e.key === 'ArrowRight') {
        goNextPage();
      } else if (e.key === 'ArrowLeft') {
        goPrevPage();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowSpeakerNotes((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPresentationMode, currentIndex]);

  const handleRefresh = () => {
    const now = new Date();
    setLastRefresh(`${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} AEST (DirectLake Synced)`);
  };

  return (
    <section
      ref={containerRef}
      aria-label="CareSphere Power BI Executive Command Centre (12-Page Suite)"
      className={`preserve-island-theme border shadow-2xl transition-all ${
        isPresentationMode
          ? 'fixed inset-0 z-[100] flex flex-col overflow-y-auto rounded-none p-2 sm:p-4'
          : 'overflow-hidden rounded-2xl'
      }`}
      style={{
        backgroundColor: '#081018',
        borderColor: '#39E6FF',
        color: '#FFFFFF',
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        className={
          isPresentationMode
            ? 'mx-auto flex w-full max-w-[1920px] flex-1 flex-col justify-between lg:aspect-video'
            : 'flex flex-col'
        }
      >
      {/* Top Power BI Widescreen Header Bar (Wireframe Header) */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
        style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.28)' }}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(57,230,255,0.16)', color: '#39E6FF', border: '1px solid #39E6FF' }}
            >
              Power BI 16:9 Widescreen (1920×1080) · Midnight Command
            </span>
            <span className="text-[12px] text-slate-300">
              Page {currentPageMeta.pageNum} of 12 · {currentPageMeta.shortLabel}
            </span>
          </div>
          <h1 className="mt-0.5 text-[24px] font-semibold leading-tight text-white">
            CareSphere Executive Command Centre
          </h1>
        </div>

        {/* Reporting Period | Last Refresh | RAG Status + Export Controls */}
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <div className="rounded-lg border px-2.5 py-1" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.12)' }}>
            <span className="text-slate-400">Reporting Period: </span>
            <select
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-none"
            >
              <option value="FY27 Q2 (Current)" className="bg-slate-900">FY27 Q2 (Current)</option>
              <option value="FY27 Q1" className="bg-slate-900">FY27 Q1</option>
              <option value="FY26 Full Year" className="bg-slate-900">FY26 Full Year</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-semibold text-slate-200 hover:border-[#39E6FF]"
            style={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.12)' }}
          >
            <RefreshCw className="h-3.5 w-3.5" style={{ color: '#39E6FF' }} />
            <span>Last Refresh: {lastRefresh}</span>
          </button>

          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold"
            style={{ backgroundColor: 'rgba(34,197,94,0.18)', color: '#22C55E', border: '1px solid #22C55E' }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#22C55E' }} />
            RAG Status: GREEN (Ω∞ READY)
          </span>

          {/* 16:9 Presentation Mode & Page Step Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrevPage}
              className="inline-flex items-center justify-center rounded-lg border p-1.5 text-white transition hover:border-[#39E6FF]"
              style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.3)' }}
              title="Previous Page (←)"
              aria-label="Previous Power BI Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" style={{ color: '#39E6FF' }} />
            </button>
            <button
              type="button"
              onClick={goNextPage}
              className="inline-flex items-center justify-center rounded-lg border p-1.5 text-white transition hover:border-[#39E6FF]"
              style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.3)' }}
              title="Next Page (→)"
              aria-label="Next Power BI Page"
            >
              <ChevronRight className="h-3.5 w-3.5" style={{ color: '#39E6FF' }} />
            </button>
            <button
              type="button"
              onClick={() => setShowSpeakerNotes((prev) => !prev)}
              aria-pressed={showSpeakerNotes}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition"
              style={{
                backgroundColor: showSpeakerNotes ? 'rgba(57,230,255,0.18)' : '#1E293B',
                borderColor: showSpeakerNotes ? '#39E6FF' : 'rgba(255,255,255,0.16)',
                color: showSpeakerNotes ? '#39E6FF' : '#FFFFFF',
              }}
              title="Toggle Board Meeting Speaker Notes Overlay (Shortcut: N)"
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Speaker Notes {showSpeakerNotes ? 'ON' : 'OFF'}</span>
            </button>
            <button
              type="button"
              onClick={togglePresentationMode}
              aria-pressed={isPresentationMode}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold transition hover:opacity-95"
              style={{
                backgroundColor: isPresentationMode ? '#EF4444' : '#39E6FF',
                color: isPresentationMode ? '#FFFFFF' : '#081018',
              }}
              title="Toggle 16:9 Full-Screen Presentation Mode (Esc to exit)"
            >
              {isPresentationMode ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Exit 16:9 Presentation</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>16:9 Presentation Mode</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => exportBoardPackPowerPoint({ orgHealthIndex: 87, omegaReadinessIndex: 82, lqiScore: 92 })}
              className="rounded px-2 py-1 text-[11px] font-bold"
              style={{ backgroundColor: '#39E6FF', color: '#081018' }}
              title="Export PowerPoint"
            >
              PPTX
            </button>
            <button
              type="button"
              onClick={() => exportBoardPackWord({ orgHealthIndex: 87, omegaReadinessIndex: 82, lqiScore: 92 })}
              className="rounded px-2 py-1 text-[11px] font-bold"
              style={{ backgroundColor: '#22C55E', color: '#081018' }}
              title="Export Word"
            >
              DOCX
            </button>
            <button
              type="button"
              onClick={() => exportBoardPackPdf({ orgHealthIndex: 87, omegaReadinessIndex: 82, lqiScore: 92 })}
              className="rounded px-2 py-1 text-[11px] font-bold"
              style={{ backgroundColor: '#FBBF24', color: '#081018' }}
              title="Export PDF"
            >
              PDF
            </button>
            <button
              type="button"
              onClick={() => exportPowerBiSemanticModel({ orgHealthIndex: 87, omegaReadinessIndex: 82, lqiScore: 92 })}
              className="rounded border px-2 py-1 text-[11px] font-bold text-white"
              style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
              title="Export Power BI Semantic Model"
            >
              PBIDS
            </button>
          </div>
        </div>
      </div>

      {/* Role-Based Drill-Through Strip (Recommended Landing Page Pathways) */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-[12px]"
        style={{ backgroundColor: '#081018', borderColor: 'rgba(57,230,255,0.18)' }}
      >
        <span className="font-semibold text-slate-300">
          Role-Based Drill-Through Pathways:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ROLE_DRILL_THROUGH_PATHS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePage(p.targetPage)}
              className="rounded-md border px-2.5 py-0.5 text-[11px] font-bold transition hover:opacity-90"
              style={{
                backgroundColor: '#162235',
                borderColor: p.color,
                color: p.color,
              }}
            >
              {p.label} →
            </button>
          ))}
        </div>
      </div>

      {/* Main 16:9 Power BI Workspace: Left-Side 12-Page Navigation Menu + Right Visual Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left-Side Navigation Panel (All 12 Pages) */}
        <nav
          aria-label="Power BI 12-Page Navigation Menu"
          className="border-b p-2.5 lg:col-span-3 xl:col-span-2 lg:border-b-0 lg:border-r"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.22)' }}
        >
          <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#39E6FF' }}>
            Power BI Report Pages (12)
          </div>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {POWER_BI_PAGES.map((pg) => {
              const Icon = ICON_MAP[pg.icon] || Shield;
              const isSelected = activePage === pg.id;
              return (
                <button
                  key={pg.id}
                  type="button"
                  onClick={() => setActivePage(pg.id)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold transition"
                  style={{
                    backgroundColor: isSelected ? '#39E6FF' : '#1E293B',
                    color: isSelected ? '#081018' : '#FFFFFF',
                    border: isSelected ? '1px solid #39E6FF' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: isSelected ? '#081018' : '#39E6FF' }}
                  />
                  <span className="truncate">
                    {pg.pageNum}. {pg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right Widescreen Report Canvas */}
        <div className="relative p-4 lg:col-span-9 xl:col-span-10" style={{ backgroundColor: '#081018' }}>
          {currentPageMeta.pageNum <= 6 ? (
            <PowerBiPagesOneToSix
              activePage={activePage}
              onNavigatePage={setActivePage}
            />
          ) : (
            <PowerBiPagesSevenToTwelve activePage={activePage} />
          )}

          {/* Board Meeting Speaker Notes Overlay (Active in 16:9 Presentation Mode or when toggled ON) */}
          {showSpeakerNotes && (
            <aside
              aria-label="Board Meeting Speaker Notes Overlay"
              className="mt-4 rounded-xl border p-4 shadow-2xl"
              style={{
                backgroundColor: 'rgba(22, 34, 53, 0.96)',
                borderColor: '#39E6FF',
                boxShadow: '0 0 24px rgba(57, 230, 255, 0.2)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: 'rgba(57,230,255,0.24)' }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: '#39E6FF', color: '#081018' }}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Board Speaker Notes · Slide {currentPageMeta.pageNum} of 12
                  </span>
                  <span className="text-[13px] font-bold text-white">
                    {currentPageMeta.shortLabel}
                  </span>
                  {currentPageMeta.presenterRole && (
                    <span
                      className="rounded border px-2 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.35)', color: '#39E6FF' }}
                    >
                      Presenter: {currentPageMeta.presenterRole}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowSpeakerNotes(false)}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:border-[#39E6FF] hover:text-white"
                  style={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.15)' }}
                >
                  <X className="h-3 w-3" />
                  <span>Hide Notes (N)</span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
                <div className="space-y-2 lg:col-span-7">
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                    Executive Narrative (Verbatim Board Script)
                  </div>
                  <p className="text-[13px] leading-relaxed text-white">
                    “{currentPageMeta.speakerNotes}”
                  </p>
                  {currentPageMeta.decisionPrompt && (
                    <div
                      className="mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-bold"
                      style={{ backgroundColor: '#1E293B', borderColor: '#22C55E', color: '#22C55E' }}
                    >
                      <CheckSquare className="h-4 w-4 shrink-0" />
                      <span>Board Resolution / Action Prompt: {currentPageMeta.decisionPrompt}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border p-3 lg:col-span-5" style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.22)' }}>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#FBBF24' }}>
                    <MessageSquareText className="h-3.5 w-3.5" />
                    Key Board Talking Points
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-slate-200">
                    {(currentPageMeta.boardTalkingPoints || []).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: '#39E6FF' }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Dedicated Slide Navigation Bar (Always visible in 16:9 Presentation Mode + Quick Deck Strip) */}
      <div
        aria-label="Presentation Slide Navigation Bar"
        className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5"
        style={{ backgroundColor: '#081018', borderColor: 'rgba(57,230,255,0.32)' }}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goPrevPage}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold text-white transition hover:border-[#39E6FF]"
            style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.35)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" style={{ color: '#39E6FF' }} />
            <span>Prev Slide</span>
          </button>
          <span className="px-2 text-[11px] font-bold text-slate-300">
            Slide {currentPageMeta.pageNum} / {POWER_BI_PAGES.length}
          </span>
          <button
            type="button"
            onClick={goNextPage}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold text-white transition hover:border-[#39E6FF]"
            style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.35)' }}
          >
            <span>Next Slide</span>
            <ChevronRight className="h-3.5 w-3.5" style={{ color: '#39E6FF' }} />
          </button>
        </div>

        {/* 12-Slide Interactive Progress Strip */}
        <div className="flex flex-1 flex-wrap items-center justify-center gap-1">
          {POWER_BI_PAGES.map((pg) => {
            const active = pg.id === activePage;
            return (
              <button
                key={pg.id}
                type="button"
                onClick={() => setActivePage(pg.id)}
                title={`Slide ${pg.pageNum}: ${pg.shortLabel}`}
                className="rounded-md px-2 py-1 text-[10.5px] font-bold transition"
                style={{
                  backgroundColor: active ? '#39E6FF' : '#1E293B',
                  color: active ? '#081018' : '#FFFFFF',
                  border: active ? '1px solid #39E6FF' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {pg.pageNum}. {pg.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSpeakerNotes((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold"
            style={{
              backgroundColor: showSpeakerNotes ? '#39E6FF' : '#1E293B',
              borderColor: '#39E6FF',
              color: showSpeakerNotes ? '#081018' : '#39E6FF',
            }}
          >
            <Mic className="h-3 w-3" />
            <span>{showSpeakerNotes ? 'Hide Notes' : 'Show Notes'}</span>
          </button>
          {isPresentationMode && (
            <button
              type="button"
              onClick={togglePresentationMode}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white"
              style={{ backgroundColor: '#EF4444' }}
            >
              <Minimize2 className="h-3 w-3" />
              <span>Exit (Esc)</span>
            </button>
          )}
        </div>
      </div>

      {/* 10 Mandatory Output Quality Pillars + Constitutional Closing Statement Footer */}
      <div
        className="space-y-2 border-t px-4 py-3 text-[11px]"
        style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.28)' }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#39E6FF' }}>
            Constitutional Output Standard:
          </span>
          {MANDATORY_OUTPUT_PILLARS.map((pillar) => (
            <span
              key={pillar}
              className="rounded border px-2 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: '#1E293B',
                borderColor: 'rgba(57,230,255,0.32)',
                color: '#FFFFFF',
              }}
            >
              ✓ {pillar}
            </span>
          ))}
        </div>

        <div className="rounded-lg border p-2.5 leading-relaxed" style={{ backgroundColor: '#081018', borderColor: 'rgba(57,230,255,0.22)' }}>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#22C55E' }}>
            Mandatory Closing Statement
          </div>
          <p className="mt-0.5 text-[12px] font-bold" style={{ color: '#39E6FF' }}>
            {CONSTITUTIONAL_PRINCIPLE}
          </p>
          <p className="mt-1 text-[11.5px] text-slate-200">
            These principles form the constitutional foundation of the CareSphere Senior Master Enterprise Governance, Assurance &amp; Readiness Management System and provide the governance standard against which all enterprise decisions, investments, controls, risks, benefits, assurance activities, organisational health assessments, and Ω∞ Readiness outcomes are governed and continuously improved.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}