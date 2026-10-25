import React, { useState } from 'react';
import { Tv, Radio, Smartphone, Monitor, Target, DoorOpen, Sparkles, Compass, Music, Heart, BookOpen, Dumbbell, Palette, Sprout, Utensils, Play, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TV_CHANNELS = [
  {
    id: 'goals',
    channel: 'CH 1 · ACHIEVING GOALS TV',
    title: 'Setting & Achieving Meaningful Career & Life Goals',
    presenter: 'ComplianceHR Infinity Coaching Network',
    summary: 'Break big ambitions into weekly 90-day milestones. Celebrate every certificate, buddy shift, and participant outcome achieved.',
    highlights: [
      '1. Clarify your 90-day professional & personal goal in writing.',
      '2. Pair each goal with a mentor or supervisor check-in during your appraisal.',
      '3. Track micro-wins weekly — every completed module and skill builds momentum.',
    ],
  },
  {
    id: 'doors',
    channel: 'CH 2 · DOORS OF OPPORTUNITY',
    title: 'Opening New Doors — Leadership, Skills & Pathways',
    presenter: 'Workforce Growth & Career Doors Studio',
    summary: 'Every new qualification, placement, and community connection opens a new door — from Support Worker to Team Leader, Specialist Coordinator, or Allied Health partner.',
    highlights: [
      'Door 1: Master 17-Point Skill Competencies & First Aid / Medication endorsements.',
      'Door 2: Step into Buddy Shift mentoring & Student / Volunteer supervision.',
      'Door 3: Lead community programs, quality improvements, and NDIS excellence.',
    ],
  },
  {
    id: 'hobbies',
    channel: 'CH 3 · HOBBIES & WELLBEING LIFE',
    title: 'Thriving Outside Work — Hobbies, Balance & Joy',
    presenter: 'Staff & Participant Wellbeing Channel',
    summary: 'Great care starts with energised people. Sharing hobbies—music, gardening, sport, art, cooking, and coastal walks—strengthens team morale and participant rapport.',
    highlights: [
      'Share your favourite hobbies on your profile to match with participants who love the same activities.',
      'Join monthly team hobby challenges, community garden days, and art workshops.',
      'Use annual and study leave proactively to recharge and pursue personal passions.',
    ],
  },
];

const RADIO_STATIONS = [
  {
    freq: '98.4 FM',
    name: 'Goal Getter & Motivation Radio',
    nowPlaying: 'Morning Momentum: Turning Daily Habits into Achieved Goals',
    tip: 'Daily 5-minute reflection: What is one door I can knock on today?',
  },
  {
    freq: '101.7 FM',
    name: 'Open Doors Career & Learning Broadcast',
    nowPlaying: 'Unlocking New Doors Through Continuous Learning & Volunteering',
    tip: 'New doors open when preparation meets kindness and initiative.',
  },
  {
    freq: '105.3 FM',
    name: 'Hobbies, Music & Chill Lounge',
    nowPlaying: 'Acoustic Focus & Weekend Hobby Inspiration (Gardening, Art, Surf & Books)',
    tip: 'Dedicate 30 minutes tonight to a hobby that brings you energy and calm.',
  },
];

const PHONE_APPS = [
  {
    key: 'goal-check',
    label: 'Goal Tracker & Micro-Wins',
    badge: '3 Active Goals',
    detail: 'Quick-check your 90-day career goals, log a milestone, or message your mentor for feedback.',
    items: [
      'Complete NDIS High-Intensity Skill Sign-Off (85% done)',
      'Mentor 1 new Volunteer / Student Placement this month',
      'Maintain 100% on-time shift notes & personal wellbeing routine',
    ],
  },
  {
    key: 'doors-map',
    label: 'Doors of Opportunity Alerts',
    badge: '4 Open Doors',
    detail: 'Live internal opportunities, upskilling scholarships, leadership expressions of interest, and project roles.',
    items: [
      'Open Door: Community Program Facilitator (Expressions Open)',
      'Open Door: Team Leader Shadowing & Rostering Certificate',
      'Open Door: Quality & Safety Champion Micro-Credential',
    ],
  },
  {
    key: 'hobby-club',
    label: 'Staff & Participant Hobby Clubs',
    badge: '8 Clubs',
    detail: 'Connect with colleagues and participants who share your hobbies and weekend interests.',
    items: [
      'Coastal Walking & Running Club · Saturday 7:30 AM',
      'Creative Arts, Photography & Music Jam · Wednesday 4:00 PM',
      'Cooking, Baking & Community Garden Exchange · Friday 12:30 PM',
    ],
  },
];

const COMPUTER_TABS = [
  {
    key: 'goals-planner',
    label: 'Achieving Goals Blueprint',
    icon: Target,
    heading: 'Interactive Goal Achievement Workbench',
    description: 'Map your short-term and long-term goals across Career, Skills, Wellbeing, and Community Impact.',
    cards: [
      { title: 'Step 1 · Vision & Target', body: 'Define the exact outcome you want to achieve this quarter and why it matters to your future.' },
      { title: 'Step 2 · Weekly Habits', body: 'Break your goal into two simple weekly actions tracked inside your HR Performance & Goals tab.' },
      { title: 'Step 3 · Evidence & Celebration', body: 'Record your certificate or milestone in Recognition & My Certificates to celebrate with the team.' },
    ],
  },
  {
    key: 'doors-portal',
    label: 'Opening Doors Portal',
    icon: DoorOpen,
    heading: 'Doors of Opportunity — Career & Personal Growth Pathways',
    description: 'Every door below represents a pathway you can unlock through training, volunteering, and leadership.',
    cards: [
      { title: 'Door A · Clinical & High-Support Mastery', body: 'Unlock complex care, medication management, and positive behaviour support endorsements.' },
      { title: 'Door B · Leadership & Coordination', body: 'Progress from frontline support into Team Leadership, Rostering Coordination, or Intake Management.' },
      { title: 'Door C · Community & Program Innovation', body: 'Design and lead new participant lifestyle programs, creative workshops, and local partnerships.' },
    ],
  },
  {
    key: 'hobbies-directory',
    label: 'Hobbies & Lifestyle Hub',
    icon: Sparkles,
    heading: 'Hobbies, Passions & Life Balance Directory',
    description: 'Celebrating the diverse hobbies that inspire our workforce and enrich participant support sessions.',
    cards: [
      { title: 'Creative & Musical Hobbies', body: 'Painting, photography, guitar, choir, crafts, and digital design — great for expressive support sessions.' },
      { title: 'Outdoor, Fitness & Nature Hobbies', body: 'Bushwalking, swimming, cycling, gardening, fishing, and team sports for healthy body and mind.' },
      { title: 'Culinary, Reading & Community Hobbies', body: 'Cooking, baking, book clubs, board games, volunteering, and cultural exchange events.' },
    ],
  },
];

export default function HrMediaGoalsHobbiesHub() {
  const [tvIdx, setTvIdx] = useState(0);
  const [radioIdx, setRadioIdx] = useState(0);
  const [phoneKey, setPhoneKey] = useState('goal-check');
  const [compKey, setCompKey] = useState('goals-planner');

  const tv = TV_CHANNELS[tvIdx] || TV_CHANNELS[0];
  const radio = RADIO_STATIONS[radioIdx] || RADIO_STATIONS[0];
  const phone = PHONE_APPS.find((a) => a.key === phoneKey) || PHONE_APPS[0];
  const comp = COMPUTER_TABS.find((c) => c.key === compKey) || COMPUTER_TABS[0];

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#00C6FF]" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">
              HR Hub Interactive Media &amp; Inspiration Lounge
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              TV · Radio · Phone · Computer — Achieving Goals, Opening Doors &amp; Hobbies Hub
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="border border-white bg-[#00C6FF] font-extrabold text-[#0A2B6D]">Achieving Goals</Badge>
          <Badge className="border border-white bg-[#FF2E9A] font-extrabold text-white">Opening Doors</Badge>
          <Badge className="border border-white bg-white font-extrabold text-[#5A00D6]">Hobbies &amp; Wellbeing</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-2 bg-[#F5F0FF]/45">
        {/* 1. INTERACTIVE TV: ACHIEVING GOALS, OPENING DOORS & HOBBIES */}
        <div className="flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-3 shadow-sm">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#0A2B6D] bg-[#0072FF] text-white">
                  <Tv className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">1. HR Smart TV Broadcast</span>
                  <h4 className="text-xs font-extrabold text-[#0A2B6D]">{tv.channel}</h4>
                </div>
              </div>
              <div className="flex gap-1">
                {TV_CHANNELS.map((ch, idx) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setTvIdx(idx)}
                    className={`rounded-md border-2 border-[#0A2B6D] px-2 py-0.5 text-[10px] font-extrabold transition ${
                      tvIdx === idx ? 'bg-[#5A00D6] text-white' : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                    }`}
                  >
                    CH {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* TV Screen Frame */}
            <div
              className="mt-2.5 rounded-xl border-4 border-[#0A2B6D] p-3 text-white shadow-inner"
              style={{ background: 'linear-gradient(135deg, #0A2B6D 0%, #5A00D6 55%, #0072FF 100%)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9.5px] font-extrabold text-white">
                  <Play className="h-2.5 w-2.5 fill-current text-[#00C6FF]" /> LIVE ON SCREEN
                </span>
                <span className="text-[9.5px] font-bold text-[#00C6FF]">{tv.presenter}</span>
              </div>
              <h5 className="mt-1.5 text-sm font-extrabold text-white">{tv.title}</h5>
              <p className="mt-1 text-[11px] font-medium text-white/95 leading-snug">{tv.summary}</p>
              <ul className="mt-2 space-y-1">
                {tv.highlights.map((h) => (
                  <li key={h} className="rounded-lg border border-white/30 bg-white/15 px-2 py-1 text-[10.5px] font-bold text-white">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[#0A2B6D]">
            <span>Switch channels for Goals (CH 1), Doors (CH 2) &amp; Hobbies (CH 3)</span>
            <span className="rounded border border-[#0A2B6D] bg-[#F5F0FF] px-2 py-0.5">HD · Studio</span>
          </div>
        </div>

        {/* 2. INTERACTIVE RADIO: MOTIVATION, OPEN DOORS & HOBBIES FM */}
        <div className="flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-3 shadow-sm">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#0A2B6D] bg-[#A100FF] text-white">
                  <Radio className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">2. HR Digital Radio Tuner</span>
                  <h4 className="text-xs font-extrabold text-[#0A2B6D]">{radio.freq} — {radio.name}</h4>
                </div>
              </div>
              <div className="flex gap-1">
                {RADIO_STATIONS.map((st, idx) => (
                  <button
                    key={st.freq}
                    type="button"
                    onClick={() => setRadioIdx(idx)}
                    className={`rounded-md border-2 border-[#0A2B6D] px-2 py-0.5 text-[10px] font-extrabold transition ${
                      radioIdx === idx ? 'bg-[#FF2E9A] text-white' : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                    }`}
                  >
                    {st.freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Radio Dial Display */}
            <div className="mt-2.5 rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg border-2 border-[#0A2B6D] bg-[#0A2B6D] px-3 py-1.5 text-white">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#00C6FF]">
                  <Volume2 className="h-4 w-4 text-[#FF2E9A]" /> {radio.freq} STEREO
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">ON AIR</span>
              </div>
              <div className="rounded-lg border-2 border-[#0A2B6D] bg-white p-2.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">Now Broadcasting</p>
                <p className="mt-0.5 text-xs font-extrabold text-[#0A2B6D]">{radio.nowPlaying}</p>
                <p className="mt-1.5 rounded-md border border-[#0A2B6D]/40 bg-[#F5F0FF] px-2 py-1 text-[11px] font-bold text-[#0A2B6D]">
                  Daily Thought: &ldquo;{radio.tip}&rdquo;
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-lg border border-[#0A2B6D] bg-white p-1.5">
                  <Target className="mx-auto h-3.5 w-3.5 text-[#0072FF]" />
                  <p className="mt-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]">Goal Focus</p>
                </div>
                <div className="rounded-lg border border-[#0A2B6D] bg-white p-1.5">
                  <DoorOpen className="mx-auto h-3.5 w-3.5 text-[#5A00D6]" />
                  <p className="mt-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]">Open Doors</p>
                </div>
                <div className="rounded-lg border border-[#0A2B6D] bg-white p-1.5">
                  <Music className="mx-auto h-3.5 w-3.5 text-[#FF2E9A]" />
                  <p className="mt-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]">Hobby Beats</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[#0A2B6D]">
            <span>Tune across 98.4 FM (Goals), 101.7 FM (Doors) &amp; 105.3 FM (Hobbies)</span>
            <span className="rounded border border-[#0A2B6D] bg-[#F5F0FF] px-2 py-0.5">Live Stream</span>
          </div>
        </div>

        {/* 3. INTERACTIVE SMART PHONE: GOAL CHECK-INS, DOORS ALERTS & HOBBY CLUBS */}
        <div className="flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-3 shadow-sm">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#0A2B6D] bg-[#FF2E9A] text-white">
                  <Smartphone className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">3. HR Mobile Companion Phone</span>
                  <h4 className="text-xs font-extrabold text-[#0A2B6D]">{phone.label}</h4>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {PHONE_APPS.map((app) => (
                  <button
                    key={app.key}
                    type="button"
                    onClick={() => setPhoneKey(app.key)}
                    className={`rounded-md border-2 border-[#0A2B6D] px-2 py-0.5 text-[10px] font-extrabold transition ${
                      phoneKey === app.key ? 'bg-[#0072FF] text-white' : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                    }`}
                  >
                    {app.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2.5 rounded-2xl border-4 border-[#0A2B6D] bg-[#F5F0FF] p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-[#0A2B6D]/30 pb-1.5">
                <span className="text-[11px] font-extrabold text-[#0A2B6D]">{phone.label}</span>
                <span className="rounded-full border border-[#0A2B6D] bg-[#00C6FF] px-2 py-0 text-[9.5px] font-extrabold text-[#0A2B6D]">
                  {phone.badge}
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#0A2B6D]">{phone.detail}</p>
              <div className="space-y-1.5">
                {phone.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg border-2 border-[#0A2B6D] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0A2B6D]">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF2E9A]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[#0A2B6D]">
            <span>Mobile Pocket Hub for Goals, Career Doors &amp; Social Hobby Clubs</span>
            <span className="rounded border border-[#0A2B6D] bg-[#F5F0FF] px-2 py-0.5">5G Connected</span>
          </div>
        </div>

        {/* 4. INTERACTIVE COMPUTER WORKSTATION: GOALS BLUEPRINT, DOORS PORTAL & HOBBIES SHOWCASE */}
        <div className="flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-3 shadow-sm">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#0A2B6D] bg-[#0A2B6D] text-white">
                  <Monitor className="h-4 w-4 text-[#00C6FF]" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">4. HR Desktop Computer Station</span>
                  <h4 className="text-xs font-extrabold text-[#0A2B6D]">{comp.heading}</h4>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {COMPUTER_TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setCompKey(t.key)}
                    className={`rounded-md border-2 border-[#0A2B6D] px-2 py-0.5 text-[10px] font-extrabold transition ${
                      compKey === t.key ? 'bg-[#0A2B6D] text-white' : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
                    }`}
                  >
                    {t.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2.5 rounded-xl border-4 border-[#0A2B6D] bg-white p-3 space-y-2">
              <p className="text-[11px] font-semibold text-[#5A00D6]">{comp.description}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {comp.cards.map((c) => (
                  <div key={c.title} className="rounded-lg border-2 border-[#0A2B6D] bg-[#F5F0FF]/60 p-2">
                    <p className="text-[10.5px] font-extrabold text-[#0A2B6D]">{c.title}</p>
                    <p className="mt-1 text-[10px] font-medium text-[#0A2B6D]/85 leading-snug">{c.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  { label: 'Art & Painting', Icon: Palette },
                  { label: 'Gardening & Nature', Icon: Sprout },
                  { label: 'Cooking & Baking', Icon: Utensils },
                  { label: 'Sport & Fitness', Icon: Dumbbell },
                  { label: 'Reading & Study', Icon: BookOpen },
                  { label: 'Volunteering', Icon: Heart },
                ].map(({ label, Icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D] bg-white px-2 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]"
                  >
                    <Icon className="h-3 w-3 text-[#5A00D6]" /> {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[#0A2B6D]">
            <span>Workstation — Plan Goals, Unlock Doors &amp; Share Hobbies</span>
            <span className="rounded border border-[#0A2B6D] bg-[#F5F0FF] px-2 py-0.5">Desktop OS</span>
          </div>
        </div>
      </div>
    </section>
  );
}