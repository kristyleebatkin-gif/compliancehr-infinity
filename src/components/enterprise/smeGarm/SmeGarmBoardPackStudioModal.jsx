import React, { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Download,
  FileText, Presentation, Database, Vote,
} from 'lucide-react';
import {
  BOARD_PACK_25_SLIDES,
  CONSTITUTIONAL_PRINCIPLE,
  MANDATORY_CLOSING_STATEMENT,
} from '@/lib/careSphereSmeGarmData';

export default function SmeGarmBoardPackStudioModal({
  open,
  onClose,
  activeRole,
  orgHealthIndex,
  omegaReadinessIndex,
  lqiScore,
  onExportPdf,
  onExportWord,
  onExportPpt,
  onExportPowerBi,
}) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [votes, setVotes] = useState(() => ({
    1: 'Note',
    2: 'Endorse',
    4: 'Approve',
    21: 'Approve',
    22: 'Approve',
  }));

  if (!open) return null;

  const slide = BOARD_PACK_25_SLIDES[currentSlideIdx] || BOARD_PACK_25_SLIDES[0];
  const recordedDecision = votes[slide.slide] || slide.decisionRequired;

  const handleRecordVote = (decision) => {
    setVotes((prev) => ({ ...prev, [slide.slide]: decision }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'rgba(8,16,24,0.88)' }}
      role="dialog"
      aria-modal="true"
      aria-label="CareSphere 25-Slide Board Pack Studio"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ backgroundColor: '#081018', borderColor: '#39E6FF' }}
      >
        {/* Top Studio Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3"
          style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.28)' }}
        >
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              CareSphere SME-GARM Board Pack Studio · Microsoft Entra ID Role: {activeRole}
            </div>
            <h2 className="text-sm font-black text-white sm:text-base">
              Slide {slide.slide} of {BOARD_PACK_25_SLIDES.length}: {slide.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onExportPpt}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black"
              style={{ backgroundColor: '#39E6FF', color: '#081018' }}
            >
              <Presentation className="h-3.5 w-3.5" /> PowerPoint
            </button>
            <button
              type="button"
              onClick={onExportWord}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black"
              style={{ backgroundColor: '#22C55E', color: '#081018' }}
            >
              <FileText className="h-3.5 w-3.5" /> Word
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black"
              style={{ backgroundColor: '#FBBF24', color: '#081018' }}
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
            <button
              type="button"
              onClick={onExportPowerBi}
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-black text-white"
              style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
            >
              <Database className="h-3.5 w-3.5" /> Power BI
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Close Board Pack Studio"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12">
          {/* Left Slide Index (25 Mandatory Slides) */}
          <div
            className="max-h-52 overflow-y-auto border-b p-2.5 lg:col-span-4 lg:max-h-none lg:border-b-0 lg:border-r"
            style={{ backgroundColor: '#162235', borderColor: 'rgba(57,230,255,0.2)' }}
          >
            <div className="mb-2 text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              25 Mandatory Board Pack Sections
            </div>
            <div className="space-y-1">
              {BOARD_PACK_25_SLIDES.map((s, idx) => {
                const selected = idx === currentSlideIdx;
                return (
                  <button
                    key={s.slide}
                    type="button"
                    onClick={() => setCurrentSlideIdx(idx)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition"
                    style={{
                      backgroundColor: selected ? '#39E6FF' : '#1E293B',
                      color: selected ? '#081018' : '#FFFFFF',
                    }}
                  >
                    <span className="truncate font-extrabold">
                      {s.slide}. {s.title}
                    </span>
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black uppercase"
                      style={{
                        backgroundColor: selected ? '#081018' : 'rgba(57,230,255,0.15)',
                        color: selected ? '#39E6FF' : '#39E6FF',
                      }}
                    >
                      {votes[s.slide] || s.decisionRequired}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Slide Stage + Mandatory Speaker Note Standard */}
          <div className="flex flex-col justify-between p-4 sm:p-6 lg:col-span-8">
            <div className="space-y-4">
              {/* Slide Banner */}
              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: '#162235', borderColor: '#39E6FF' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase" style={{ color: '#39E6FF' }}>
                    {slide.committee} · Slide {slide.slide} of 25
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                    style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
                  >
                    OHI {orgHealthIndex} · Ω∞ {omegaReadinessIndex} · LQI {lqiScore}%
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-black text-white sm:text-xl">{slide.title}</h3>
                <div className="mt-1 text-xs font-extrabold" style={{ color: '#22C55E' }}>
                  {slide.metricSummary}
                </div>
              </div>

              {/* Mandatory Speaker Note Standard */}
              <div className="space-y-3">
                <div
                  className="rounded-xl border-l-4 p-3.5"
                  style={{ backgroundColor: '#1E293B', borderColor: '#39E6FF' }}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                    Speaker Note 1 — What the Board Needs to Know (Executive Summary)
                  </div>
                  <p className="mt-1 text-sm font-bold text-white">{slide.whatBoardNeedsToKnow}</p>
                </div>

                <div
                  className="rounded-xl border-l-4 p-3.5"
                  style={{ backgroundColor: '#1E293B', borderColor: '#22C55E' }}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#22C55E' }}>
                    Speaker Note 2 — Why It Matters (Strategic &amp; Constitutional Implications)
                  </div>
                  <p className="mt-1 text-sm font-bold text-white">{slide.whyItMatters}</p>
                </div>

                <div
                  className="rounded-xl border-l-4 p-3.5"
                  style={{ backgroundColor: '#1E293B', borderColor: '#FBBF24' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#FBBF24' }}>
                      Speaker Note 3 — Decision Required (Board Voting &amp; Resolution Determination)
                    </div>
                    <span className="text-xs font-black text-white">
                      Recorded Determination: <span style={{ color: '#39E6FF' }}>{recordedDecision.toUpperCase()}</span>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {['Approve', 'Endorse', 'Challenge', 'Note', 'Monitor'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleRecordVote(opt)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-black transition"
                        style={{
                          backgroundColor: recordedDecision === opt ? '#FBBF24' : '#081018',
                          color: recordedDecision === opt ? '#081018' : '#FFFFFF',
                          border: '1px solid rgba(251,191,36,0.45)',
                        }}
                      >
                        <Vote className="h-3 w-3" /> {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Footer Navigation + Constitutional Closing */}
            <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentSlideIdx === 0}
                  onClick={() => setCurrentSlideIdx((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black disabled:opacity-40"
                  style={{ backgroundColor: '#1E293B', color: '#FFFFFF' }}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous Slide
                </button>
                <span className="text-xs font-black" style={{ color: '#39E6FF' }}>
                  Slide {currentSlideIdx + 1} / {BOARD_PACK_25_SLIDES.length}
                </span>
                <button
                  type="button"
                  disabled={currentSlideIdx === BOARD_PACK_25_SLIDES.length - 1}
                  onClick={() => setCurrentSlideIdx((i) => Math.min(BOARD_PACK_25_SLIDES.length - 1, i + 1))}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black disabled:opacity-40"
                  style={{ backgroundColor: '#39E6FF', color: '#081018' }}
                >
                  Next Slide <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="rounded-lg p-2 text-[10px] text-slate-300" style={{ backgroundColor: '#162235' }}>
                <strong style={{ color: '#39E6FF' }}>{CONSTITUTIONAL_PRINCIPLE}</strong> {MANDATORY_CLOSING_STATEMENT}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}