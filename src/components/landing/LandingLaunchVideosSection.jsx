import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Sparkles, Copy, Check, FileText, Film, HeartHandshake, ShieldCheck,
} from 'lucide-react';

const VIDEO_1_URL =
  'https://media.base44.com/videos/public/6ac9f91f0d82b1f80ec6a25f/8b510a8f7_Kristy_s_Story_Video.mp4';
const VIDEO_2_URL =
  'https://media.base44.com/videos/public/6ac9f91f0d82b1f80ec6a25f/6a4c74eaf_Future_of_Compliance_Video.mp4';

const EMOTIONAL_PILLARS = ['Relief', 'Confidence', 'Time', 'Simplicity', 'Hope', 'Vision'];

const VIDEO_1_LINES = [
  'My name is Kristy Whelan.',
  "I've worked as a Case Manager, Compliance Manager, Business Owner, Sole Trader and Director.",
  "For years, I've watched genuinely caring people dedicate their lives to supporting others.",
  'People who wanted to make a difference.',
  'People who wanted to provide great services.',
  'People who wanted to improve lives.',
  'Yet every day, I watched those same people become overwhelmed.',
  'Not by the people they were helping.',
  'But by paperwork. Audits. Compliance. Policies. Evidence. Documentation.',
  'Hours and hours spent trying to prove they were doing the right thing.',
  'I remember thinking... There has to be a better way.',
  "Because compliance shouldn't be something that holds us back. It should be something that supports us.",
  'So I started building the platform I wished existed.',
  'A platform that gives people clarity.',
  'A platform that reduces stress.',
  'A platform that gives business owners confidence.',
  'A platform that helps organisations focus less on paperwork and more on people.',
  'That platform became ComplianceHR Infinity.',
  'Not just another software system. But a new way of thinking about compliance.',
  'A future where organisations always know where they stand.',
  'A future where quality comes naturally.',
  'A future where compliance is visible, understandable and achievable.',
  'Because our purpose was never paperwork.',
  'Our purpose is people.',
  "And that's why I built ComplianceHR Infinity.",
];

const VIDEO_1_PROMPT =
  'Cinematic founder story. Professional enterprise software founder. Stylised portrait matching uploaded cartoon image. Modern office environment. Soft blue and purple lighting. Scenes of compliance paperwork, audits, folders, spreadsheets and administrative burden. Transition into calm organised digital workspace. Inspirational atmosphere. Enterprise technology startup aesthetic. Premium SaaS advertisement. Smooth camera movement. Emotional storytelling. Professional corporate quality. No empty space. ComplianceHR Infinity blue-purple branding throughout.';

const VIDEO_2_LINES = [
  'Imagine starting your day knowing exactly where your organisation stands.',
  'No uncertainty. No searching. No guessing. No last-minute panic before an audit.',
  'Imagine having complete visibility across your entire organisation.',
  'Every document. Every responsibility. Every action. Every risk. Every review.',
  'Connected. Visible. Accountable.',
  'Now imagine a world where compliance becomes part of everyday operations instead of a stressful event that arrives once a year.',
  'Where quality is continuously monitored.',
  'Where evidence is captured as work happens.',
  'Where leaders can instantly understand the health of their organisation.',
  'Where teams can focus on delivering outcomes instead of chasing paperwork.',
  'That is the vision behind ComplianceHR Infinity.',
  'A complete operating system designed for organisations that want more than compliance.',
  'Organisations that want confidence. Organisations that want clarity. Organisations that want excellence.',
  'ComplianceHR Infinity connects governance, quality, risk, workforce capability, operational performance, evidence and accountability into a single source of truth.',
  'Not because software should replace people. But because great technology should empower people.',
  'It should remove barriers. Reduce stress. Create confidence.',
  'And help organisations focus on why they exist.',
  'To make a difference. To improve lives. To create better outcomes. To achieve their goals.',
  "This isn't software built around forms. It's software built around people. Built around outcomes. Built around excellence.",
  'Welcome to ComplianceHR Infinity.',
  'The future of compliance is not more paperwork.',
  'The future of compliance is visibility.',
];

const VIDEO_2_PROMPT =
  'Premium enterprise SaaS product launch video. Futuristic compliance operating system. Large executive dashboards. AI powered business intelligence. Governance, risk, quality and compliance themes. Executive command centre aesthetic. Blue, purple and pink enterprise colour palette. Glassmorphism interface. Clean modern dashboards. Executive leaders using technology. Animated data visualisations. Enterprise software presentation. Microsoft and Atlassian style design quality. Professional camera fly-through of application. Premium startup launch video. Confidence, clarity, visibility and organisational excellence themes. No empty space. Highly polished commercial quality.';

function StoryVideoCard({
  badge,
  title,
  subtitle,
  durationLabel,
  videoUrl,
  lines,
  aiPrompt,
  endingCard,
  accentColor = '#0072FF',
}) {
  const videoRef = useRef(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [showScript, setShowScript] = useState(true);
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
      className="overflow-hidden rounded-3xl p-[2px] shadow-xl"
      style={{
        background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 30%, #5A00D6 68%, #FF2E9A 100%)',
      }}
    >
      <div className="rounded-[22px] bg-white p-5 sm:p-7 lg:p-8 space-y-6">
        {/* Card Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-sky-100 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                style={{
                  background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
                }}
              >
                <Film className="h-3.5 w-3.5 text-[#00C6FF]" />
                {badge}
              </span>
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-[#F0F7FF] px-3 py-1 text-xs font-extrabold text-[#0A2B6D]">
                {durationLabel}
              </span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-[#0A2B6D] sm:text-2xl">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm font-semibold text-[#0A2B6D]/75">{subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={startSynchronizedNarration}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:opacity-95"
              style={{
                background: isNarrating
                  ? '#FF2E9A'
                  : 'linear-gradient(120deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
              }}
            >
              {isNarrating ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Stop Voiceover &amp; Video</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>Play Video + Full Voiceover</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowScript((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-[#F0F7FF] px-3.5 py-2.5 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-sky-100"
            >
              <FileText className="h-3.5 w-3.5 text-[#0072FF]" />
              <span>{showScript ? 'Hide Script & Prompt' : 'Show Script & Prompt'}</span>
            </button>
          </div>
        </div>

        {/* Main Video + Ending Screen Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Video Player Column */}
          <div className="lg:col-span-8 flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-[#061A44] shadow-lg">
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

              {/* Live Synchronized Voiceover Subtitle Bar */}
              <div
                className="pointer-events-none absolute inset-x-3 bottom-12 rounded-xl border border-white/20 px-4 py-2.5 text-center backdrop-blur-md"
                style={{
                  background: 'rgba(6, 26, 68, 0.86)',
                }}
              >
                <p className="text-xs font-extrabold leading-relaxed text-white sm:text-sm">
                  “{lines[activeLineIndex] || lines[0]}”
                </p>
              </div>
            </div>

            {/* Bottom Caption Scrub Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/15 bg-[#0A2B6D] px-4 py-2.5 text-xs text-white">
              <span className="font-bold text-[#00C6FF]">
                {isNarrating ? '◉ Live Voiceover Narration Active' : '◉ Ready — Click Play Video + Full Voiceover'}
              </span>
              <span className="font-semibold text-white/80">
                Line {activeLineIndex + 1} of {lines.length}
              </span>
            </div>
          </div>

          {/* Ending / Closing Screen Card */}
          <div
            className="lg:col-span-4 flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] p-6 text-white shadow-lg"
            style={{
              background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
            }}
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                <Sparkles className="h-3.5 w-3.5" />
                {endingCard.tag}
              </span>
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#FF2E9A]" />
              <h4 className="text-2xl font-black tracking-tight text-white">
                {endingCard.headline}
              </h4>
              <p className="text-sm font-extrabold text-[#00C6FF]">
                {endingCard.role}
              </p>
              <p className="text-base font-bold text-white/95">
                {endingCard.company}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm font-extrabold italic leading-relaxed text-white">
                “{endingCard.quote}”
              </p>
            </div>
          </div>
        </div>

        {/* Full Voiceover Script & AI Video Prompt Drawer */}
        {showScript && (
          <div className="grid grid-cols-1 gap-4 pt-2 lg:grid-cols-12">
            {/* Voiceover Script */}
            <div className="lg:col-span-7 rounded-2xl border border-sky-200 bg-[#F8FAFC] p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-sky-200 pb-2.5">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#0072FF]">
                    Full Voiceover Script ({durationLabel})
                  </span>
                  <p className="text-xs font-semibold text-[#0A2B6D]/75">
                    Click any line to highlight or jump straight to that moment
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(lines.join('\n\n'), 'script')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F0F7FF]"
                >
                  {copiedKey === 'script' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied Script</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#0072FF]" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
                {lines.map((line, idx) => {
                  const active = idx === activeLineIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveLineIndex(idx)}
                      className={`w-full rounded-lg px-3 py-1.5 text-left text-xs transition ${
                        active
                          ? 'border border-[#0072FF] bg-[#F0F7FF] font-extrabold text-[#0A2B6D]'
                          : 'font-semibold text-[#0A2B6D]/85 hover:bg-white'
                      }`}
                    >
                      <span className="mr-2 font-black text-[#0072FF]">{idx + 1}.</span>
                      {line}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Video Prompt */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-purple-200 bg-[#F5F0FF]/60 p-4 sm:p-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 border-b border-purple-200 pb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-[#5A00D6]">
                    AI Video Prompt (Sora, Runway, Pika, Canva)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(aiPrompt, 'prompt')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs font-extrabold text-[#5A00D6] hover:bg-purple-50"
                  >
                    {copiedKey === 'prompt' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied Prompt</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[#5A00D6]" />
                        <span>Copy AI Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs font-semibold leading-relaxed text-[#0A2B6D]">
                  {aiPrompt}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-sky-200 bg-white p-3 text-xs font-bold text-[#0A2B6D]">
                <span style={{ color: accentColor }}>◉</span> Story-first launch format: sells the human purpose and executive vision before a single menu is listed.
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
      aria-label="ComplianceHR Infinity Launch Videos"
      className="space-y-8"
    >
      {/* Top Emotional Value Strip: Relief, Confidence, Time, Simplicity, Hope, Vision */}
      <div
        className="rounded-3xl p-5 sm:p-6 text-white shadow-xl"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#00C6FF]">
              <HeartHandshake className="h-3.5 w-3.5" />
              Because Our Purpose Is People
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              Built for Relief, Confidence, Time, Simplicity, Hope &amp; Vision
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EMOTIONAL_PILLARS.map((pillar) => (
              <span
                key={pillar}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-2xs"
              >
                <span className="h-2 w-2 rounded-full bg-[#0072FF]" />
                {pillar}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* VIDEO 1 — At the Top of the Homepage: Kristy's Story */}
      <StoryVideoCard
        badge="Video 1 · Founder Story"
        title={`KRISTY'S STORY — "Why I Built ComplianceHR Infinity"`}
        subtitle="The story of how compliance can support caring people instead of overwhelming them."
        durationLabel="90 Seconds Voiceover"
        videoUrl={VIDEO_1_URL}
        lines={VIDEO_1_LINES}
        aiPrompt={VIDEO_1_PROMPT}
        accentColor="#0072FF"
        endingCard={{
          tag: 'Ending Screen',
          headline: 'KRISTY WHELAN',
          role: 'Founder & Platform Owner',
          company: 'ComplianceHR Infinity',
          quote: 'Because our purpose is people.',
        }}
      />

      {/* Immediately Underneath: "See ComplianceHR Infinity in action" + VIDEO 2 */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-[#F0F7FF] px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
            <ShieldCheck className="h-4 w-4 text-[#0072FF]" />
            The Vision in Action
          </span>
          <h2 className="text-2xl font-black tracking-tight text-[#0A2B6D] sm:text-3xl">
            See ComplianceHR Infinity in action
          </h2>
          <p className="max-w-2xl text-sm font-semibold text-[#0A2B6D]/75">
            The future of compliance is not more paperwork — the future of compliance is visibility.
          </p>
        </div>

        <StoryVideoCard
          badge="Video 2 · The Future of Compliance"
          title="THE FUTURE OF COMPLIANCE — App Vision Video"
          subtitle="Complete visibility across every document, responsibility, action, risk, and review."
          durationLabel="2 Minutes Voiceover"
          videoUrl={VIDEO_2_URL}
          lines={VIDEO_2_LINES}
          aiPrompt={VIDEO_2_PROMPT}
          accentColor="#5A00D6"
          endingCard={{
            tag: 'Closing Screen',
            headline: 'COMPLIANCEHR INFINITY',
            role: 'Audit Ready. Every Day.',
            company: 'Built by Experience. Built for People.',
            quote: 'The future of compliance is not more paperwork. The future of compliance is visibility.',
          }}
        />
      </div>
    </section>
  );
}