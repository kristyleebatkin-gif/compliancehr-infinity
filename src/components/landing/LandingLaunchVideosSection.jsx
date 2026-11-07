import React, { useState, useRef, useEffect } from 'react';
import { Image } from '@/components/ui/image';
import {
  Pause, Volume2, Sparkles, Copy, Check, FileText, Film, HeartHandshake, ShieldCheck, XCircle, CheckCircle2,
} from 'lucide-react';

const FOUNDER_PORTRAIT_URL =
  'https://base44.app/api/apps/6ac9f91f0d82b1f80ec6a25f/files/mp/public/6ac9f91f0d82b1f80ec6a25f/2a65ee674_kristy-whelan-director-portrait.png';

const VIDEO_1_URL =
  'https://media.base44.com/videos/public/6ac9f91f0d82b1f80ec6a25f/fdac19a47_My_Story_Founder_Video.mp4';
const VIDEO_2_URL =
  'https://media.base44.com/videos/public/6ac9f91f0d82b1f80ec6a25f/864197399_Future_of_Compliance_App_Video.mp4';

const NOT_WHAT_PEOPLE_WAKE_UP_WANTING = [
  'A compliance register',
  'A risk matrix',
  'An evidence library',
];

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
  'A way to make compliance simple.',
  'Visible.',
  'Understandable.',
  'A way to help organisations spend more time supporting people and less time searching for paperwork.',
  "That's why I created ComplianceHR Infinity.",
  'Not just as software.',
  'But as a vision for a better future.',
  'One where quality becomes part of everyday operations.',
  'One where organisations can focus on people, not paperwork.',
  'Because our purpose was never compliance.',
  'Our purpose has always been helping people achieve their goals.',
];

const VIDEO_1_PROMPT =
  'Create a cinematic founder story featuring a stylised illustrated female business founder matching the uploaded portrait. Professional enterprise technology commercial. Modern Australian office environment. Working late at a laptop with compliance documents, folders, notebooks and business plans. Transition from chaos and paperwork into clarity, organisation and innovation. Blue, purple and pink enterprise branding. Premium SaaS founder documentary style. Inspirational and authentic. Focus on resilience, leadership, helping people and creating positive change. Soft cinematic lighting, smooth camera movement, emotional storytelling, professional corporate quality. No text on screen. No empty space. High-end startup launch video.';

const VIDEO_2_LINES = [
  'Imagine knowing exactly where your organisation stands every single day.',
  'Imagine having complete visibility across your operations without searching through folders, spreadsheets, emails or disconnected systems.',
  "Imagine a workplace where quality isn't something reviewed once a year.",
  "It's something visible every day.",
  "That's the vision behind ComplianceHR Infinity.",
  'A complete enterprise operating system designed to bring together the information leaders need to confidently manage their organisations.',
  'From governance and compliance to quality, risk, workforce capability and operational performance.',
  'One source of truth.',
  'One connected ecosystem.',
  'One place to understand what matters most.',
  'ComplianceHR Infinity helps organisations move from reacting to problems to proactively managing performance.',
  'It provides visibility, accountability, traceability and confidence across every level of the organisation.',
  'Not because technology replaces people.',
  'But because the right technology empowers people.',
  'It reduces complexity.',
  'Improves decision making.',
  'Creates confidence.',
  'And allows organisations to focus on what they were created to do.',
  'Support people.',
  'Deliver quality services.',
  'Achieve meaningful outcomes.',
  'ComplianceHR Infinity.',
  'Audit Ready.',
  'Every Day.',
];

const VIDEO_2_PROMPT =
  'Premium enterprise software demonstration. Futuristic compliance operating system. Professional dashboard fly-through. Smooth transitions between compliance, governance, quality, audit, workforce, risk and evidence management screens. Executive command centre aesthetic. Modern Microsoft-quality design. Glassmorphism cards. Blue, purple and pink branding. Realistic user interactions. Data visualisations. Enterprise SaaS launch video. Focus on visibility, confidence, organisation, accountability and operational excellence. Cinematic camera movements. High-end product reveal. Professional software commercial quality. No text overlays. No empty space.';

function StoryVideoCard({
  badge,
  title,
  subtitle,
  durationLabel,
  videoUrl,
  lines,
  aiPrompt,
  referenceLabel,
  portraitUrl,
  endingCard,
  accentColor = '#0072FF',
}) {
  const videoRef = useRef(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [showScript, setShowScript] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

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

  const startSynchronizedNarration = () => {
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
      if (idx >= lines.length) {
        setIsNarrating(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
        return;
      }
      setActiveLineIndex(idx);
      const utterance = new SpeechSynthesisUtterance(lines[idx]);
      utterance.rate = 0.96;
      utterance.pitch = 1.02;
      utterance.onend = () => {
        speakLine(idx + 1);
      };
      utterance.onerror = () => {
        setIsNarrating(false);
      };
      window.speechSynthesis.speak(utterance);
    };

    speakLine(0);
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div
      className="overflow-hidden rounded-2xl p-[2px] shadow-md"
      style={{
        background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 30%, #5A00D6 68%, #FF2E9A 100%)',
      }}
    >
      <div className="rounded-[14px] bg-white p-3.5 space-y-3">
        {/* Card Header: Header FIRST -> Sentence -> Blue/Purple Badges & Action Buttons After */}
        <div className="space-y-1 border-b border-sky-100 pb-2.5 text-left">
          <div className="flex items-center gap-2.5">
            {portraitUrl && (
              <div
                className="h-10 w-10 shrink-0 overflow-hidden rounded-xl p-[1.5px] shadow-2xs"
                style={{
                  background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 45%, #FF2E9A 100%)',
                }}
              >
                <Image
                  src={portraitUrl}
                  alt="Kristy Whelan — Founder & Director Portrait"
                  className="h-full w-full rounded-[9px] object-cover"
                  fittingType="fill"
                />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-[#0A2B6D] leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs font-semibold text-[#0A2B6D]/80">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-white"
                style={{
                  background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
                }}
              >
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded bg-white/15"
                  style={{ boxShadow: '0 0 6px rgba(255,255,255,0.9)' }}
                >
                  <Film className="h-2.5 w-2.5 text-white" />
                </span>
                <span>{badge}</span>
              </span>
              <span className="inline-flex items-center rounded-md border border-[#5A00D6]/25 bg-[#F5F0FF] px-2 py-0.5 text-[10.5px] font-extrabold text-[#5A00D6]">
                {durationLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={startSynchronizedNarration}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
                style={{
                  background: isNarrating
                    ? '#FF2E9A'
                    : 'linear-gradient(120deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                }}
              >
                {isNarrating ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Stop Voiceover</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Play Video + Voiceover</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowScript((v) => !v)}
                className="inline-flex h-7 items-center gap-1 rounded-lg border border-sky-200 bg-[#F0F7FF] px-2.5 text-[11px] font-extrabold text-[#0A2B6D] transition hover:bg-sky-100"
              >
                <FileText className="h-3 w-3 text-[#0072FF]" />
                <span>{showScript ? 'Hide Script' : 'Script & Prompt'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Video + Ending Screen Grid */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch">
          {/* Video Player Column */}
          <div className="lg:col-span-8 flex flex-col justify-between overflow-hidden rounded-xl border border-[#0A2B6D] bg-[#061A44]">
            <div className="relative aspect-video w-full bg-[#061A44]">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                loop
                playsInline
                aria-label={title}
                className="h-full w-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Live Synchronized Voiceover Subtitle + Status Bar */}
            <div className="border-t border-white/15 bg-[#0A2B6D] px-3 py-2 text-white space-y-1">
              <div className="rounded-lg border border-white/15 bg-[#061A44]/90 px-3 py-1.5 text-center">
                <p className="text-xs font-extrabold leading-snug text-white">
                  “{lines[activeLineIndex] || lines[0]}”
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                <span className="font-bold text-[#00C6FF]">
                  {isNarrating ? '◉ Live Voiceover Narration Active' : '◉ Ready — Click Play Video + Voiceover'}
                </span>
                <span className="font-semibold text-white/80">
                  Line {activeLineIndex + 1} of {lines.length}
                </span>
              </div>
            </div>
          </div>

          {/* Ending / Final Tagline Card */}
          <div
            className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-[#0A2B6D] p-3.5 text-white"
            style={{
              background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
            }}
          >
            <div className="space-y-2">
              <h4 className="text-base sm:text-lg font-black tracking-tight text-white">
                {endingCard.headline}
              </h4>
              <p className="text-xs font-extrabold text-[#00C6FF]">
                {endingCard.role}
              </p>
              <p className="text-xs font-bold text-white/95">
                {endingCard.company}
              </p>
              {endingCard.extraLine && (
                <p className="text-xs font-extrabold text-[#FF2E9A]">
                  {endingCard.extraLine}
                </p>
              )}

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                <Sparkles className="h-3 w-3 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                <span>{endingCard.tag}</span>
              </span>
            </div>

            <div className="mt-3 rounded-lg border border-white/20 bg-white/10 p-2.5">
              <p className="text-xs font-extrabold italic leading-snug text-white">
                “{endingCard.quote}”
              </p>
            </div>
          </div>
        </div>

        {/* Full Voiceover Script & AI Video Prompt Drawer */}
        {showScript && (
          <div className="grid grid-cols-1 gap-3 pt-1 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-xl border border-sky-200 bg-[#F8FAFC] p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-sky-200 pb-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#0072FF]">
                  Voiceover Script ({durationLabel})
                </span>
                <button
                  type="button"
                  onClick={() => copyText(lines.join('\n\n'), 'script')}
                  className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0A2B6D] hover:bg-[#F0F7FF]"
                >
                  {copiedKey === 'script' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-[#0072FF]" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                {lines.map((line, idx) => {
                  const active = idx === activeLineIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveLineIndex(idx)}
                      className={`w-full rounded-md px-2.5 py-1 text-left text-xs transition ${
                        active
                          ? 'border border-[#0072FF] bg-[#F0F7FF] font-extrabold text-[#0A2B6D]'
                          : 'font-semibold text-[#0A2B6D]/85 hover:bg-white'
                      }`}
                    >
                      <span className="mr-1.5 font-black text-[#0072FF]">{idx + 1}.</span>
                      {line}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-purple-200 bg-[#F5F0FF]/60 p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-purple-200 pb-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-[#5A00D6]">
                    AI Video Prompt
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(aiPrompt, 'prompt')}
                    className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#5A00D6] hover:bg-purple-50"
                  >
                    {copiedKey === 'prompt' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-[#5A00D6]" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                {referenceLabel && (
                  <div className="rounded-md border border-purple-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#5A00D6]">
                    Reference: {referenceLabel}
                  </div>
                )}

                <p className="text-[11px] font-semibold leading-snug text-[#0A2B6D]">
                  {aiPrompt}
                </p>
              </div>

              <div className="mt-2 rounded-lg border border-sky-200 bg-white p-2 text-[11px] font-bold text-[#0A2B6D]">
                <span style={{ color: accentColor }}>◉</span> Sells less stress, more confidence, better visibility, more time, and better outcomes.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LandingLaunchVideosSection() {
  return (
    <section
      aria-label="ComplianceHR Infinity Launch Transformation Videos"
      className="overflow-hidden rounded-2xl p-[2px] shadow-xl"
      style={{
        background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
      }}
    >
      <div className="rounded-[14px] bg-white p-3.5 sm:p-4 space-y-3">
        {/* Unified Top Header on the Single Master Tile: Header FIRST -> Sentence -> Blue/Purple Badges After */}
        <div
          className="rounded-xl p-3.5 text-white shadow-md space-y-2.5"
          style={{
            background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
          }}
        >
          <div className="flex flex-col gap-2.5 border-b border-white/15 pb-2.5 text-left">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 shrink-0 overflow-hidden rounded-xl p-[1.5px] shadow-md"
                style={{
                  background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 45%, #FF2E9A 100%)',
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                }}
              >
                <Image
                  src={FOUNDER_PORTRAIT_URL}
                  alt="Kristy Whelan — Founder & Director Portrait"
                  className="h-full w-full rounded-[10px] object-cover"
                  fittingType="fill"
                />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h2 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-white leading-tight lg:whitespace-nowrap">
                  People Don&apos;t Buy Features — They Buy Transformation &amp; The Future of Compliance
                </h2>
                <p className="text-xs font-semibold leading-snug text-white/90">
                  Built from experience. Designed for excellence. Created to give people their time back — because our purpose has always been helping people achieve their goals.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#00C6FF]/40 bg-[#0072FF]/25 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/15"
                  style={{ boxShadow: '0 0 6px rgba(255,255,255,0.9)' }}
                >
                  <HeartHandshake className="h-2.5 w-2.5 text-white" />
                </span>
                <span>Kristy Whelan · Founder &amp; Director Transformation Suite</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#A855F7]/50 bg-[#5A00D6]/35 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
                <ShieldCheck className="h-3 w-3 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                <span>See ComplianceHR Infinity in Action</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-rose-300">
                Not just:
              </span>
              {NOT_WHAT_PEOPLE_WAKE_UP_WANTING.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/90"
                >
                  <XCircle className="h-3 w-3 text-rose-300 shrink-0" />
                  <span>{item}</span>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#00C6FF]/40 bg-[#081018] px-2.5 py-1.5">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                Transformation:
              </span>
              {TRANSFORMATION_OUTCOMES.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full border border-[#00C6FF]/40 bg-[#0072FF]/25 px-2 py-0.5 text-[11px] font-extrabold text-white"
                >
                  <CheckCircle2 className="h-3 w-3 text-white shrink-0" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Both Videos Neatly Together Inside the Same Single Tile */}
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 items-stretch">
          <StoryVideoCard
            badge='VIDEO 1 · "MY STORY"'
            title='KRISTY WHELAN — "Why I Created ComplianceHR Infinity"'
            subtitle="Supporting people, organisations and teams to focus on people, not paperwork."
            durationLabel="Founder Story Voiceover"
            videoUrl={VIDEO_1_URL}
            lines={VIDEO_1_LINES}
            aiPrompt={VIDEO_1_PROMPT}
            referenceLabel="Use your uploaded cartoon image as the character reference."
            portraitUrl={FOUNDER_PORTRAIT_URL}
            accentColor="#0072FF"
            endingCard={{
              tag: 'Founder Vision',
              headline: 'KRISTY WHELAN',
              role: 'Case Manager · Compliance Manager · Business Owner · Director',
              company: 'ComplianceHR Infinity',
              quote: 'Because our purpose was never compliance. Our purpose has always been helping people achieve their goals.',
            }}
          />

          <StoryVideoCard
            badge='VIDEO 2 · "THE FUTURE OF COMPLIANCE"'
            title='THE FUTURE OF COMPLIANCE — Enterprise Operating System'
            subtitle="Visibility, accountability, traceability and confidence across every level of your organisation."
            durationLabel="App Vision Voiceover"
            videoUrl={VIDEO_2_URL}
            lines={VIDEO_2_LINES}
            aiPrompt={VIDEO_2_PROMPT}
            referenceLabel="Use screenshots from your app."
            accentColor="#5A00D6"
            endingCard={{
              tag: 'Final Tagline',
              headline: 'ComplianceHR Infinity',
              role: 'Built from experience.',
              company: 'Designed for excellence.',
              extraLine: 'Created to give people their time back.',
              quote: 'ComplianceHR Infinity. Audit Ready. Every Day.',
            }}
          />
        </div>
      </div>
    </section>
  );
}