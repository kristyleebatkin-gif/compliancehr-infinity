import React, { useState, useRef, useEffect } from 'react';
import { Image } from '@/components/ui/image';
import {
  Pause, Volume2, Sparkles, Copy, Check, FileText, Film, HeartHandshake, CheckCircle2,
} from 'lucide-react';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const FOUNDER_PORTRAIT_URL =
  'https://base44.app/api/apps/6ac9f91f0d82b1f80ec6a25f/files/mp/public/6ac9f91f0d82b1f80ec6a25f/2a65ee674_kristy-whelan-director-portrait.png';

const VIDEO_1_URL =
  'https://media.base44.com/videos/public/6ac9f91f0d82b1f80ec6a25f/fdac19a47_My_Story_Founder_Video.mp4';
const VIDEO_2_URL =
  'https://media.base44.com/videos/public/6ac9f91f0d82b1f80ec6a25f/864197399_Future_of_Compliance_App_Video.mp4';

const TRANSFORMATION_OUTCOMES = [
  'Less stress',
  'More confidence',
  'Better visibility',
  'More time',
  'Better outcomes',
];

const VIDEO_1_LINES = [
  'My name is Kristy Whelan.',
  "I've spent years working as a Case Manager, Compliance Manager, Business Owner and Director.",
  "Throughout my journey, I've had the privilege of supporting people, organisations and teams to achieve their goals.",
  'Along the way, I noticed something.',
  'Some of the most caring and dedicated people were spending an unbelievable amount of time buried in paperwork, audits, compliance requirements and administration.',
  "Not because they weren't doing a great job.",
  'But because proving it had become harder than doing it.',
  'I watched passionate people become exhausted trying to keep up with documentation, evidence, reporting and endless systems that never seemed to connect.',
  'I remember thinking there has to be a better way.',
  'A way to make compliance simple, visible, and understandable.',
  'A way to help organisations spend more time supporting people and less time searching for paperwork.',
  "That's why I created ComplianceHR Infinity.",
  'Not just as software, but as a vision for a better future where quality becomes part of everyday operations.',
  'Because our purpose was never compliance — our purpose has always been helping people achieve their goals.',
];

const VIDEO_2_LINES = [
  'Imagine knowing exactly where your organisation stands every single day.',
  'Imagine having complete visibility across your operations without searching through folders, spreadsheets, emails or disconnected systems.',
  "Imagine a workplace where quality isn't something reviewed once a year — it's something visible every day.",
  "That's the vision behind ComplianceHR Infinity.",
  'A complete enterprise operating system designed to bring together governance, compliance, quality, risk, workforce capability and operational performance.',
  'One source of truth. One connected ecosystem. One place to understand what matters most.',
  'ComplianceHR Infinity. Audit Ready. Every Day.',
];

const VIDEOS = [
  {
    id: 'story',
    tabLabel: 'Video 1 · My Story (Kristy Whelan)',
    title: 'Kristy Whelan — Why I Created ComplianceHR Infinity',
    subtitle: 'Supporting people, organisations, and teams to focus on people, not paperwork.',
    badge: 'VIDEO 1 · MY STORY',
    videoUrl: VIDEO_1_URL,
    lines: VIDEO_1_LINES,
  },
  {
    id: 'future',
    tabLabel: 'Video 2 · The Future of Compliance',
    title: 'The Future of Compliance — Enterprise Operating System',
    subtitle: 'Visibility, accountability, traceability, and confidence across every level of your organisation.',
    badge: 'VIDEO 2 · PLATFORM VISION',
    videoUrl: VIDEO_2_URL,
    lines: VIDEO_2_LINES,
  },
];

export default function LandingLaunchVideosSection() {
  const [selectedVideoId, setSelectedVideoId] = useState('story');
  const [isNarrating, setIsNarrating] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [showScript, setShowScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef(null);

  const currentVideo = VIDEOS.find((v) => v.id === selectedVideoId) || VIDEOS[0];

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsNarrating(false);
  };

  const handleSelectVideo = (id) => {
    stopNarration();
    setSelectedVideoId(id);
    setActiveLineIndex(0);
  };

  const toggleNarration = () => {
    if (isNarrating) {
      stopNarration();
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }

    setIsNarrating(true);
    setActiveLineIndex(0);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const speakLine = (idx) => {
      if (idx >= currentVideo.lines.length) {
        setIsNarrating(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
        return;
      }
      setActiveLineIndex(idx);
      const utterance = new SpeechSynthesisUtterance(currentVideo.lines[idx]);
      utterance.rate = 0.96;
      utterance.pitch = 1.02;
      utterance.onend = () => speakLine(idx + 1);
      utterance.onerror = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
    };

    speakLine(0);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(currentVideo.lines.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-label="About Kristy Whelan and ComplianceHR Infinity Vision"
      className="w-full scroll-mt-20"
    >
      <div className="enterprise-surface rounded-2xl p-3.5 sm:p-4 space-y-3">
        {/* Consistent Section Header: Header FIRST -> Sentence SECOND -> Blue & Purple Badges AFTER */}
        <LandingSectionHeader
          badge="Founder & Director Vision · Kristy Whelan"
          tone="blue"
          icon={HeartHandshake}
          title="Built From Frontline & Governance Experience to Give People Their Time Back"
          description="Created by Kristy Whelan (Case Manager, Compliance Manager, Business Owner & Director) so organisations can focus on supporting people rather than searching for paperwork."
          rightTag="Audit Ready · Every Day"
        />

        {/* Single Unified Grid: Left = ONE Consolidated About Me Card · Right = Interactive Video & Voiceover Player */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 items-stretch">
          {/* Left Column (5 cols): Single Consolidated About Me Card */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left">
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5">
                <div
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-xl p-[1.5px] shadow-2xs"
                  style={{
                    background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 45%, #FF2E9A 100%)',
                    boxShadow: '0 0 8px rgba(255,255,255,0.85)',
                  }}
                >
                  <Image
                    src={FOUNDER_PORTRAIT_URL}
                    alt="Kristy Whelan — Founder & Director"
                    className="h-full w-full rounded-[10px] object-cover"
                    fittingType="fill"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-editorial text-sm sm:text-base font-black text-[#0A2B6D] leading-tight">
                    Kristy Whelan
                  </h3>
                  <p className="text-xs font-semibold text-[#0A2B6D]/80">
                    Case Manager · Compliance Manager · Business Owner · Director
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded bg-[#0072FF]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                    <Sparkles className="h-2.5 w-2.5 text-[#0072FF]" />
                    <span>Founder of ComplianceHR Infinity</span>
                  </span>
                </div>
              </div>

              <p className="text-xs font-medium leading-snug text-[#0A2B6D]/85">
                &ldquo;Some of the most caring and dedicated people were spending an unbelievable amount of time buried in paperwork and disconnected systems — not because they weren&apos;t doing a great job, but because proving it had become harder than doing it. I created ComplianceHR Infinity to make compliance simple, visible, and part of everyday operations.&rdquo;
              </p>
            </div>

            <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
              <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                Transformation Outcomes Delivered:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRANSFORMATION_OUTCOMES.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-bold text-[#0A2B6D]"
                  >
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-[#0072FF]" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Single Compact Video & Synchronized Voiceover Studio */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left space-y-2.5">
            {/* Top Bar: Header First -> Sentence -> Switcher & Controls After */}
            <div className="space-y-1 border-b border-slate-100 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-editorial text-sm sm:text-base font-black text-[#0A2B6D]">
                  {currentVideo.title}
                </h3>
                <span className="inline-flex items-center gap-1 rounded bg-[#0A2B6D] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  <Film className="h-2.5 w-2.5 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                  <span>{currentVideo.badge}</span>
                </span>
              </div>

              <p className="text-xs font-medium text-[#0A2B6D]/80">
                {currentVideo.subtitle}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                <div className="inline-flex flex-wrap items-center gap-1">
                  {VIDEOS.map((vid) => {
                    const active = vid.id === selectedVideoId;
                    return (
                      <button
                        key={vid.id}
                        type="button"
                        onClick={() => handleSelectVideo(vid.id)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                          active
                            ? 'bg-[#0A2B6D] text-white shadow-2xs'
                            : 'border border-slate-200 bg-slate-50 text-[#0A2B6D] hover:bg-white'
                        }`}
                      >
                        {vid.tabLabel}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleNarration}
                    className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
                    style={{
                      background: isNarrating
                        ? '#FF2E9A'
                        : 'linear-gradient(120deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                    }}
                  >
                    {isNarrating ? (
                      <>
                        <Pause className="h-3 w-3" />
                        <span>Stop Voiceover</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3" />
                        <span>Play + Voiceover</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowScript((v) => !v)}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-[#F8FAFC] px-2.5 text-[11px] font-bold text-[#0A2B6D] hover:bg-slate-100"
                  >
                    <FileText className="h-3 w-3 text-[#0072FF]" />
                    <span>{showScript ? 'Hide Script' : 'Script'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Compact Video Player + Live Subtitle Strip */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 items-center">
              <div className="sm:col-span-7 overflow-hidden rounded-lg border border-[#0A2B6D] bg-[#061A44]">
                <div className="relative aspect-video w-full bg-[#061A44]">
                  <video
                    key={currentVideo.videoUrl}
                    ref={videoRef}
                    src={currentVideo.videoUrl}
                    controls
                    loop
                    playsInline
                    aria-label={currentVideo.title}
                    className="h-full w-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              <div className="sm:col-span-5 flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-[#F8FAFC] p-2.5">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                    {isNarrating ? '◉ Live Voiceover Active' : '◉ Synchronized Caption'}
                  </div>
                  <p className="mt-1 text-xs font-bold leading-snug text-[#0A2B6D]">
                    &ldquo;{currentVideo.lines[activeLineIndex] || currentVideo.lines[0]}&rdquo;
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-1.5 text-[10.5px] font-semibold text-[#5A00D6]">
                  <span>Line {activeLineIndex + 1} of {currentVideo.lines.length}</span>
                  <span>Audit Ready · Every Day</span>
                </div>
              </div>
            </div>

            {showScript && (
              <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-2.5 space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-[11px] font-extrabold text-[#0A2B6D]">
                    Full Voiceover Script ({currentVideo.lines.length} lines)
                  </span>
                  <button
                    type="button"
                    onClick={copyScript}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-bold text-[#0072FF]"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
                  {currentVideo.lines.map((line, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveLineIndex(idx)}
                      className={`block w-full rounded px-2 py-0.5 text-left text-[11px] ${
                        idx === activeLineIndex
                          ? 'bg-[#0072FF]/10 font-extrabold text-[#0A2B6D]'
                          : 'font-medium text-[#0A2B6D]/80 hover:bg-white'
                      }`}
                    >
                      {idx + 1}. {line}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}