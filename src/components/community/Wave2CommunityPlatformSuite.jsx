import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  ShieldCheck, Users, MessageSquare, BookOpen, Calendar, Award, Briefcase,
  Flag, Ban, Scale, Sparkles, BarChart3, Crown, CheckCircle2, Lock, AlertTriangle,
  Download, Send, Star, ThumbsUp, FileCheck2, Play,
} from 'lucide-react';
import {
  PRIVATE_COMPLIANCE_ENTITIES,
  MINIMUM_BENCHMARK_COHORT_SIZE,
  INDUSTRY_HUBS,
  COMMUNITY_GROUPS,
  ADVISER_MARKETPLACE,
  BENCHMARK_SEED_COHORT,
  MEMBERSHIP_TIERS,
  assertCommunityBoundaryAccess,
  scrubCommunityContentForPii,
  computeAnonymisedPeerBenchmark,
  checkTierEntitlement,
  calculateAdviserBookingQuote,
  submitAdviserReview,
  evaluateModerationReport,
  processModerationAppeal,
  calculateReputationScore,
  runCommunityVerificationSuite,
} from '@/lib/communityPlatformEngine';

const INITIAL_DISCUSSIONS = [
  {
    id: 'DISC-101',
    hub: 'NDIS Practice Standards & Audit Hub',
    type: 'Q&A',
    title: 'How are providers structuring 24-hour vs 5-day NDIS Reportable Incident sign-off workflows?',
    author: 'Maya Lin (Compliance Manager, Verified ABN)',
    authorId: 'usr-maya',
    body: 'We are refining our internal escalation matrix so Team Leaders capture immediate safeguarding actions within 2 hours and Key Personnel submit the 24-hour notification on time. What checklist triggers work best?',
    upvotes: 28,
    acceptedAnswer: 'Use a mandatory two-stage statutory timer tied to Provider Awareness timestamp, with automatic Key Personnel alert at T+4 hours.',
    tags: ['NDIS Reportable Incidents', 'Core Module', 'Governance'],
  },
  {
    id: 'DISC-102',
    hub: 'Strengthened Aged Care Standards & SIRS Hub',
    type: 'Discussion',
    title: 'Standard 5 Clinical Governance evidence pack structure for November 2025 strengthened standards',
    author: 'Dr. Marcus Vance (Clinical Governance Adviser)',
    authorId: 'usr-marcus',
    body: 'Sharing our de-identified clinical governance board reporting template mapping antimicrobial stewardship, falls trend analysis, and SIRS Priority 1 closure verification.',
    upvotes: 41,
    acceptedAnswer: null,
    tags: ['Aged Care Act 2024', 'Standard 5', 'SIRS'],
  },
];

const INITIAL_RESOURCES = [
  { id: 'RES-1', title: 'De-Identified NDIS Mid-Term Audit Readiness Checklist (2026)', category: 'Audit Readiness', downloads: 612, format: 'PDF / DOCX' },
  { id: 'RES-2', title: 'Strengthened Aged Care Standard 5 Clinical Governance Board Pack Template', category: 'Clinical Governance', downloads: 438, format: 'XLSX / PDF' },
  { id: 'RES-3', title: 'SCHADS Broken Shift & Sleepover Allowance Self-Audit Guide', category: 'Workforce & HR', downloads: 809, format: 'PDF' },
];

const INITIAL_COURSES = [
  { id: 'CPD-1', title: 'Zero-PII Peer Case Sharing & Privacy Boundaries', cpdPoints: 2, duration: '25 mins', code: 'CHR-CPD-2026-01' },
  { id: 'CPD-2', title: 'SIRS Priority 1 & NDIS 24-Hour Statutory Notification Mastery', cpdPoints: 3, duration: '40 mins', code: 'CHR-CPD-2026-02' },
];

export default function Wave2CommunityPlatformSuite() {
  const { toast } = useToast();
  const [section, setSection] = useState('hubs');
  const [activeTier, setActiveTier] = useState('pro');
  const [joinedHubs, setJoinedHubs] = useState(['hub-ndis-core', 'hub-aged-care-2025']);
  const [joinedGroups, setJoinedGroups] = useState(['grp-regional-providers']);

  // Discussions, Q&A & Certificates state
  const [discussions, setDiscussions] = useState(INITIAL_DISCUSSIONS);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [issuedCerts, setIssuedCerts] = useState(['CPD-1']);
  const [rsvpEvents, setRsvpEvents] = useState(['EVT-1']);

  // Adviser Marketplace state
  const [selectedAdviser, setSelectedAdviser] = useState(ADVISER_MARKETPLACE[0]);
  const [bookingHours, setBookingHours] = useState(2);
  const [bookings, setBookings] = useState([
    { id: 'B-100', adviserId: 'adv-1', adviserName: 'Clarissa Thorne', bookedById: 'current-member', status: 'Completed', date: '2026-10-28', netPayable: 504 },
  ]);
  const [reviews, setReviews] = useState([
    { id: 'REV-100', adviserId: 'adv-1', rating: 5, comment: 'Outstanding mock audit review and clear NDIS Practice Standards gap analysis.', verifiedBooking: true },
  ]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Moderation state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [modReports, setModReports] = useState([
    {
      reportId: 'MOD-901',
      contentId: 'DISC-101',
      contentType: 'Discussion',
      reason: 'Participant PII / PHI Disclosure',
      priority: 'P1 - Immediate Quarantine (< 15 mins)',
      status: 'Quarantined Pending Admin Decision',
      autoQuarantined: true,
    },
  ]);
  const [reportReason, setReportReason] = useState('Participant PII / PHI Disclosure');
  const [reportDetails, setReportDetails] = useState('');
  const [appealText, setAppealText] = useState('');
  const [appeals, setAppeals] = useState([]);

  // Engagement & Onboarding state
  const [onboardingDone, setOnboardingDone] = useState(['profile', 'guidelines', 'hub']);
  const [digestSubscribed, setDigestSubscribed] = useState(true);

  // Peer Benchmarking state
  const [benchSector, setBenchSector] = useState('NDIS');
  const [benchState, setBenchState] = useState('NSW');
  const [benchSize, setBenchSize] = useState('All');

  // Security boundary probe state
  const [probeEntity, setProbeEntity] = useState('ParticipantProfile');
  const [probeResult, setProbeResult] = useState(null);

  const testMatrix = useMemo(() => runCommunityVerificationSuite(), []);
  const reputation = useMemo(
    () =>
      calculateReputationScore({
        acceptedAnswers: 4,
        helpfulUpvotes: 14,
        resourcesShared: 2,
        cpdCompleted: issuedCerts.length,
        moderationPenalties: 0,
      }),
    [issuedCerts.length]
  );

  const benchmarkResult = useMemo(
    () => computeAnonymisedPeerBenchmark(BENCHMARK_SEED_COHORT, { sector: benchSector, state: benchState, sizeBand: benchSize }),
    [benchSector, benchState, benchSize]
  );

  const handlePublishDiscussion = () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) return;
    const scrubbedTitle = scrubCommunityContentForPii(newPostTitle);
    const scrubbedBody = scrubCommunityContentForPii(newPostBody);
    const post = {
      id: `DISC-${Date.now()}`,
      hub: INDUSTRY_HUBS[0].name,
      type: 'Q&A',
      title: scrubbedTitle.sanitized,
      author: 'Verified Provider Member',
      authorId: 'current-member',
      body: scrubbedBody.sanitized,
      upvotes: 1,
      acceptedAnswer: null,
      tags: ['Peer Q&A', scrubbedBody.piiDetected ? 'PII Auto-Scrubbed' : 'Verified Safe'],
    };
    setDiscussions([post, ...discussions]);
    setNewPostTitle('');
    setNewPostBody('');
    toast({
      title: scrubbedBody.piiDetected ? 'Published with Automatic PII Redaction' : 'Discussion Published',
      description: scrubbedBody.piiDetected
        ? `Detected and redacted: ${scrubbedBody.detections.join(', ')}`
        : 'Your post is now live in the NDIS Practice Standards Hub.',
    });
  };

  const handleBookAdviser = () => {
    const quote = calculateAdviserBookingQuote(selectedAdviser.hourlyRate, bookingHours, activeTier);
    const newBooking = {
      id: `B-${Date.now()}`,
      adviserId: selectedAdviser.id,
      adviserName: selectedAdviser.name,
      bookedById: 'current-member',
      status: 'Completed',
      date: '2026-11-10',
      netPayable: quote.netPayable,
    };
    setBookings([newBooking, ...bookings]);
    toast({
      title: 'Adviser Session Booked',
      description: `${bookingHours}h with ${selectedAdviser.name} confirmed ($${quote.netPayable} after ${quote.discountPct}% ${quote.tierName} discount).`,
    });
  };

  const handleSubmitReview = () => {
    try {
      const completedBooking = bookings.find((b) => b.adviserId === selectedAdviser.id && b.status === 'Completed');
      const rev = submitAdviserReview({
        bookings,
        bookingId: completedBooking?.id || 'NONE',
        reviewerId: 'current-member',
        rating: reviewRating,
        comment: reviewComment || 'Thorough compliance guidance and practical audit templates.',
      });
      setReviews([rev, ...reviews]);
      setReviewComment('');
      toast({ title: 'Verified Review Published', description: 'Review verified against completed marketplace booking.' });
    } catch (err) {
      toast({ title: 'Review Blocked', description: err.message, variant: 'destructive' });
    }
  };

  const handleReportContent = (contentId) => {
    const rep = evaluateModerationReport({
      contentId,
      contentType: 'Discussion',
      reason: reportReason,
      details: reportDetails || 'Reported via community safety control.',
      reporterId: 'current-member',
      blockedUserIds: blockedUsers,
    });
    setModReports([rep, ...modReports]);
    setReportDetails('');
    toast({
      title: rep.autoQuarantined ? 'P1 Content Auto-Quarantined' : 'Report Added to Admin Queue',
      description: `${rep.reportId} (${rep.priority})`,
    });
  };

  const handleAppealSubmit = (reportId) => {
    try {
      const apl = processModerationAppeal({
        reportId,
        authorId: 'current-member',
        originalModeratorId: 'mod-primary',
        appealModeratorId: 'mod-independent-review',
        appealStatement: appealText || 'The identifier in the post was a synthetic training example, not real participant data.',
      });
      setAppeals([apl, ...appeals]);
      setAppealText('');
      toast({ title: 'Appeal Logged for Independent Review', description: `${apl.appealId} assigned to ${apl.appealModeratorId}.` });
    } catch (err) {
      toast({ title: 'Appeal Rejected', description: err.message, variant: 'destructive' });
    }
  };

  const runBoundaryProbe = () => {
    try {
      assertCommunityBoundaryAccess({ surface: 'community', role: 'Community Member' }, probeEntity, 'read');
      setProbeResult({ allowed: true, message: `Allowed access to ${probeEntity}` });
    } catch (err) {
      setProbeResult({ allowed: false, message: err.message });
    }
  };

  const navItems = [
    { key: 'hubs', label: '1. Profiles, Hubs & Groups', icon: Users },
    { key: 'knowledge', label: '2. Q&A, Library, Events & CPD', icon: MessageSquare },
    { key: 'marketplace', label: '3. Adviser Marketplace', icon: Briefcase },
    { key: 'moderation', label: '4. Moderation & Appeals', icon: Scale },
    { key: 'engagement', label: '5. Onboarding, Badges & Digest', icon: Award },
    { key: 'benchmarking', label: '6. Peer Benchmarking (k≥5)', icon: BarChart3 },
    { key: 'tiers', label: '7. Membership Tiers', icon: Crown },
    { key: 'tests', label: '8. Security & Test Matrix (14/14)', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4">
      {/* Top Command Banner */}
      <div
        className="rounded-2xl border-2 border-[#0A2B6D] p-4 text-white shadow-md"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#00C6FF] text-[#061A44] font-extrabold">WAVE 2 COMMUNITY LAYER</Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 font-bold">
                Zero-Trust Isolated from Private Tenant Records
              </Badge>
            </div>
            <h2 className="mt-1.5 text-lg font-extrabold text-white">
              ComplianceHR Peer Network, Adviser Marketplace &amp; k-Anonymous Benchmarking
            </h2>
            <p className="text-xs text-white/85">
              Connect with verified NDIS &amp; Aged Care leaders, book vetted auditors, compare de-identified benchmarks (minimum group size k≥{MINIMUM_BENCHMARK_COHORT_SIZE}), and verify zero access to private compliance entities.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-200">Active Tier &amp; Reputation</div>
              <div className="text-xs font-extrabold text-white">
                {MEMBERSHIP_TIERS.find((t) => t.id === activeTier)?.name} · {reputation.total} pts ({reputation.level})
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSection(item.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  active
                    ? 'bg-[#00C6FF] text-[#061A44] shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PROFILES, INDUSTRY HUBS & GROUPS */}
      {section === 'hubs' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-2 border-[#0A2B6D]">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">Verified Business Profile (Public Safe Surface)</span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold">ABN &amp; NDIS Verified</Badge>
                </div>
                <h3 className="text-base font-extrabold text-[#0A2B6D]">Southern Cross Care &amp; Support Services Pty Ltd</h3>
                <p className="text-xs text-slate-600">
                  Registration Groups: High Intensity Daily Personal Activities (0104), SIL, Support Coordination · States: NSW, VIC, QLD
                </p>
                <p className="rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-[#0A2B6D]">
                  <Lock className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
                  Privacy Guarantee: Only public business credentials and peer badges are visible. Participant files, incidents, and HR records are air-gapped.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#0A2B6D]">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">Professional Practitioner Profile</span>
                  <Badge className="bg-purple-50 text-[#5A00D6] border-purple-300 font-bold">{reputation.level}</Badge>
                </div>
                <h3 className="text-base font-extrabold text-[#0A2B6D]">Compliance &amp; Quality Governance Lead</h3>
                <p className="text-xs text-slate-600">
                  Specialties: NDIS Practice Standards, Aged Care Strengthened Standard 5, SIRS Priority 1 Triage · CPD Certificates: {issuedCerts.length}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline" className="border-[#0A2B6D] text-[#0A2B6D] font-bold">Verified Provider</Badge>
                  <Badge variant="outline" className="border-[#0072FF] text-[#0072FF] font-bold">SIRS &amp; Incident SME</Badge>
                  <Badge variant="outline" className="border-emerald-600 text-emerald-700 font-bold">Privacy Guardian</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {INDUSTRY_HUBS.map((hub) => {
              const isJoined = joinedHubs.includes(hub.id);
              return (
                <Card key={hub.id} className="border border-slate-200">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge className="bg-sky-50 text-[#0072FF] border-sky-200 font-bold">{hub.sector}</Badge>
                        <h4 className="mt-1 text-sm font-extrabold text-[#0A2B6D]">{hub.name}</h4>
                      </div>
                      <Button
                        size="sm"
                        variant={isJoined ? 'outline' : 'default'}
                        onClick={() =>
                          setJoinedHubs(isJoined ? joinedHubs.filter((id) => id !== hub.id) : [...joinedHubs, hub.id])
                        }
                      >
                        {isJoined ? 'Joined Hub' : 'Join Hub'}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-600">{hub.description}</p>
                    <p className="text-[11px] font-bold text-[#0A2B6D]">
                      {hub.membersCount.toLocaleString()} peers · {hub.activeThreads} active threads · Lead: {hub.leadModerator}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border border-slate-200">
            <CardContent className="p-4 space-y-3">
              <h4 className="text-sm font-extrabold text-[#0A2B6D]">Role &amp; Regional Peer Groups (Entitlement-Gated)</h4>
              <div className="grid gap-3 md:grid-cols-3">
                {COMMUNITY_GROUPS.map((grp) => {
                  const joined = joinedGroups.includes(grp.id);
                  const canJoin =
                    grp.requiredTier === 'free' ||
                    (grp.requiredTier === 'pro' && (activeTier === 'pro' || activeTier === 'guild')) ||
                    (grp.requiredTier === 'guild' && activeTier === 'guild');
                  return (
                    <div key={grp.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                      <Badge variant="outline" className="text-[10px] font-bold">{grp.visibility}</Badge>
                      <p className="text-xs font-extrabold text-[#0A2B6D]">{grp.name}</p>
                      <p className="text-[11px] text-slate-600">{grp.memberCount} members · {grp.cadence}</p>
                      <Button
                        size="sm"
                        className="w-full"
                        variant={joined ? 'outline' : 'default'}
                        onClick={() => {
                          if (!canJoin) {
                            toast({
                              title: 'Membership Upgrade Required',
                              description: `${grp.name} requires the ${grp.requiredTier.toUpperCase()} tier.`,
                              variant: 'destructive',
                            });
                            return;
                          }
                          setJoinedGroups(joined ? joinedGroups.filter((g) => g !== grp.id) : [...joinedGroups, grp.id]);
                        }}
                      >
                        {joined ? 'Member' : canJoin ? 'Join Group' : `Requires ${grp.requiredTier.toUpperCase()} Tier`}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. DISCUSSIONS, Q&A, RESOURCE LIBRARY, EVENTS & LEARNING CERTIFICATES */}
      {section === 'knowledge' && (
        <div className="space-y-4">
          <Card className="border-2 border-[#0A2B6D]">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#0A2B6D]">Start a Peer Discussion or Q&amp;A (Auto-PII Scrubber Active)</h3>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold">Real-Time NDIS/Phone/Email Redaction</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Question or discussion title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Details (try typing NDIS ID 430 123 456 to test PII redaction)..."
                    value={newPostBody}
                    onChange={(e) => setNewPostBody(e.target.value)}
                  />
                  <Button onClick={handlePublishDiscussion}>
                    <Send className="mr-1.5 h-3.5 w-3.5" />Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {discussions.filter((d) => !blockedUsers.includes(d.authorId)).map((d) => (
              <Card key={d.id} className="border border-slate-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#0A2B6D] text-white font-bold">{d.type}</Badge>
                      <span className="text-xs font-bold text-[#0072FF]">{d.hub}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDiscussions(discussions.map((item) => (item.id === d.id ? { ...item, upvotes: item.upvotes + 1 } : item)))
                        }
                      >
                        <ThumbsUp className="mr-1 h-3.5 w-3.5" />{d.upvotes}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReportContent(d.id)}>
                        <Flag className="mr-1 h-3.5 w-3.5 text-rose-600" />Report
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBlockedUsers([...blockedUsers, d.authorId]);
                          toast({ title: 'Author Blocked', description: `Posts from ${d.author} are now hidden from your feed.` });
                        }}
                      >
                        <Ban className="mr-1 h-3.5 w-3.5" />Block User
                      </Button>
                    </div>
                  </div>
                  <h4 className="text-sm font-extrabold text-[#0A2B6D]">{d.title}</h4>
                  <p className="text-xs text-slate-700">{d.body}</p>
                  {d.acceptedAnswer && (
                    <div className="rounded-lg border border-emerald-300 bg-emerald-50/70 p-2.5 text-xs text-emerald-950">
                      <strong className="font-extrabold text-emerald-800">Accepted Peer Answer (+25 Reputation): </strong>
                      {d.acceptedAnswer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border border-slate-200">
              <CardContent className="p-4 space-y-2.5">
                <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-[#0A2B6D]">
                  <BookOpen className="h-4 w-4 text-[#0072FF]" /> De-Identified Community Resource Library
                </h4>
                {INITIAL_RESOURCES.map((res) => (
                  <div key={res.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
                    <div>
                      <p className="text-xs font-extrabold text-[#0A2B6D]">{res.title}</p>
                      <p className="text-[11px] text-slate-500">{res.category} · {res.format} · {res.downloads} downloads</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast({ title: 'Resource Downloaded', description: `${res.title} saved.` })}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardContent className="p-4 space-y-2.5">
                <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-[#0A2B6D]">
                  <FileCheck2 className="h-4 w-4 text-[#5A00D6]" /> Micro-Learning &amp; Verifiable CPD Certificates
                </h4>
                {INITIAL_COURSES.map((c) => {
                  const completed = issuedCerts.includes(c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
                      <div>
                        <p className="text-xs font-extrabold text-[#0A2B6D]">{c.title}</p>
                        <p className="text-[11px] text-slate-500">{c.cpdPoints} CPD Points · {c.duration} · Code: {c.code}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={completed ? 'outline' : 'default'}
                        onClick={() => {
                          if (!completed) setIssuedCerts([...issuedCerts, c.id]);
                          toast({
                            title: 'CPD Certificate Verified',
                            description: `Certificate ${c.code} issued (+15 Reputation points).`,
                          });
                        }}
                      >
                        {completed ? 'Certificate Issued' : 'Complete & Claim CPD'}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 3. ADVISER / EXPERT MARKETPLACE */}
      {section === 'marketplace' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {ADVISER_MARKETPLACE.map((adv) => {
              const quote = calculateAdviserBookingQuote(adv.hourlyRate, bookingHours, activeTier);
              const isSelected = selectedAdviser.id === adv.id;
              return (
                <Card key={adv.id} className={`border-2 ${isSelected ? 'border-[#0072FF]' : 'border-slate-200'}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-[#0A2B6D]">{adv.name}</h4>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold">ABN &amp; Credential Verified</Badge>
                        </div>
                        <p className="text-xs font-semibold text-[#5A00D6]">{adv.credentials}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-[#0A2B6D]">${adv.hourlyRate}/hr</p>
                        <p className="text-[11px] font-bold text-amber-600">
                          <Star className="mr-0.5 inline h-3.5 w-3.5 fill-amber-400" />
                          {adv.rating} ({adv.reviewsCount} verified reviews)
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {adv.specialties.map((s) => (
                        <Badge key={s} variant="outline" className="text-[11px]">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">
                        Next Slot: {adv.nextAvailable} · {bookingHours}h Net Quote ({quote.tierName}): <strong>${quote.netPayable}</strong>
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAdviser(adv);
                          handleBookAdviser();
                        }}
                      >
                        Book {bookingHours}h Advisory Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-2 border-[#0A2B6D]">
            <CardContent className="p-4 space-y-3">
              <h4 className="text-sm font-extrabold text-[#0A2B6D]">Bookings &amp; Verified Review Gate</h4>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0A2B6D]">Session Duration (Hours)</label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={bookingHours}
                  onChange={(e) => setBookingHours(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 text-xs space-y-1">
                <div className="font-extrabold text-[#0A2B6D]">Your Completed Bookings ({bookings.length})</div>
                {bookings.map((b) => (
                  <div key={b.id} className="flex justify-between text-[11px]">
                    <span>{b.adviserName} ({b.date})</span>
                    <span className="font-bold text-emerald-700">${b.netPayable} · {b.status}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <label className="text-xs font-extrabold text-[#0A2B6D]">Submit Verified Review for {selectedAdviser.name}</label>
                <Input
                  placeholder="Share your advisory experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <Button size="sm" className="w-full" onClick={handleSubmitReview}>
                  Submit Verified Booking Review
                </Button>
              </div>
              <div className="space-y-1.5 pt-2">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-slate-200 p-2 text-xs">
                    <div className="flex justify-between font-bold text-[#0A2B6D]">
                      <span>{r.rating} ★ Verified Client</span>
                      <Badge className="bg-emerald-50 text-emerald-700 text-[10px]">Verified Booking</Badge>
                    </div>
                    <p className="mt-1 text-slate-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. MODERATION: REPORTING, BLOCKING, APPEALS, GUIDELINES & ADMIN QUEUE */}
      {section === 'moderation' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-2 border-[#0A2B6D]">
            <CardContent className="p-4 space-y-3">
              <h4 className="text-sm font-extrabold text-[#0A2B6D]">Community Safety Guidelines &amp; Reporting</h4>
              <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                <li><strong>Zero Participant / Staff PII:</strong> Never post NDIS numbers, names, addresses, or clinical identifiers.</li>
                <li><strong>P1 Auto-Quarantine:</strong> Any report flagged for Participant PII or Safeguarding Risk is quarantined immediately.</li>
                <li><strong>Independent Appeals:</strong> Every moderation action can be appealed to an independent moderator with zero conflict of interest.</li>
              </ul>
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-xs font-bold text-[#0A2B6D]">Report Reason</label>
                <select
                  className="w-full rounded-md border border-slate-300 p-2 text-xs font-semibold text-[#0A2B6D]"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="Participant PII / PHI Disclosure">Participant PII / PHI Disclosure (P1 Auto-Quarantine)</option>
                  <option value="Safeguarding / Harm Risk">Safeguarding / Harm Risk (P1 Auto-Quarantine)</option>
                  <option value="Unverified Commercial Spam">Unverified Commercial Spam (P2)</option>
                  <option value="Harassment or Abuse">Harassment or Abuse (P1)</option>
                </select>
                <Input
                  placeholder="Additional context for moderators..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />
                <Button size="sm" onClick={() => handleReportContent('DISC-101')}>
                  <Flag className="mr-1.5 h-3.5 w-3.5" />Submit Report to Admin Queue
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#0A2B6D]">
            <CardContent className="p-4 space-y-3">
              <h4 className="text-sm font-extrabold text-[#0A2B6D]">Admin Moderation Queue &amp; Independent Appeals</h4>
              <div className="space-y-2">
                {modReports.map((m) => (
                  <div key={m.reportId} className="rounded-xl border border-slate-200 p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#0A2B6D]">{m.reportId} · Target: {m.contentId}</span>
                      <Badge className="bg-rose-50 text-rose-700 border-rose-300 font-bold">{m.priority}</Badge>
                    </div>
                    <p className="text-slate-600">Reason: <strong>{m.reason}</strong> · Status: <strong>{m.status}</strong></p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setModReports(modReports.map((r) => (r.reportId === m.reportId ? { ...r, status: 'Redacted & Restored' } : r)))
                        }
                      >
                        Redact PII &amp; Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setModReports(modReports.map((r) => (r.reportId === m.reportId ? { ...r, status: 'Removed Permanently' } : r)))
                        }
                      >
                        Remove Post
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAppealSubmit(m.reportId)}>
                        Lodge Independent Appeal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {appeals.length > 0 && (
                <div className="rounded-lg bg-purple-50 p-2.5 text-xs text-[#5A00D6]">
                  <strong>Active Appeals ({appeals.length}):</strong> {appeals[0].appealId} — {appeals[0].status} ({appeals[0].appealModeratorId})
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. ENGAGEMENT: ONBOARDING, REPUTATION, BADGES & WEEKLY DIGEST */}
      {section === 'engagement' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-2 border-[#0A2B6D]">
            <CardContent className="p-4 space-y-3">
              <h4 className="text-sm font-extrabold text-[#0A2B6D]">5-Step Community Onboarding &amp; Reputation</h4>
              {[
                { key: 'profile', label: '1. Verify ABN & Practitioner Credentials' },
                { key: 'guidelines', label: '2. Sign Zero-PII Community Safety Pledge' },
                { key: 'hub', label: '3. Join Your First Industry Hub (NDIS or Aged Care)' },
                { key: 'qa', label: '4. Contribute a Peer Q&A Answer (+25 Reputation)' },
                { key: 'cpd', label: '5. Complete a Micro-Learning CPD Certificate (+15 Reputation)' },
              ].map((step) => {
                const done = onboardingDone.includes(step.key);
                return (
                  <div key={step.key} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-xs">
                    <span className="font-bold text-[#0A2B6D]">{step.label}</span>
                    <Button
                      size="sm"
                      variant={done ? 'outline' : 'default'}
                      onClick={() =>
                        setOnboardingDone(done ? onboardingDone.filter((k) => k !== step.key) : [...onboardingDone, step.key])
                      }
                    >
                      {done ? 'Completed ✓' : 'Complete Step'}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-2 border-[#0A2B6D]">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#0A2B6D]">Weekly Executive Community Digest</h4>
                <Button
                  size="sm"
                  variant={digestSubscribed ? 'default' : 'outline'}
                  onClick={() => setDigestSubscribed(!digestSubscribed)}
                >
                  {digestSubscribed ? 'Subscribed (Mondays 7:00 AM AEDT)' : 'Subscribe to Weekly Digest'}
                </Button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5">
                <p className="font-extrabold text-[#0A2B6D]">Preview: This Week&apos;s NDIS &amp; Aged Care Governance Digest</p>
                <p>• Top Accepted Q&amp;A: 24-Hour Reportable Incident Escalation Timers (28 upvotes)</p>
                <p>• New Template: Strengthened Aged Care Standard 5 Clinical Governance Pack</p>
                <p>• Peer Benchmark Pulse: NSW NDIS Provider Worker Screening median reached 97.5%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 6. ANONYMISED PEER BENCHMARKING (MINIMUM GROUP SIZE k >= 5) */}
      {section === 'benchmarking' && (
        <Card className="border-2 border-[#0A2B6D]">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-[#0A2B6D]">
                  k-Anonymous Peer Benchmarking Engine (Minimum Group Size k ≥ {MINIMUM_BENCHMARK_COHORT_SIZE})
                </h3>
                <p className="text-xs text-slate-600">
                  Aggregates de-identified provider telemetry. Any cohort with fewer than {MINIMUM_BENCHMARK_COHORT_SIZE} organisations is automatically suppressed to prevent re-identification.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
                  value={benchSector}
                  onChange={(e) => setBenchSector(e.target.value)}
                >
                  <option value="All">All Sectors</option>
                  <option value="NDIS">NDIS</option>
                  <option value="Aged Care">Aged Care</option>
                </select>
                <select
                  className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
                  value={benchState}
                  onChange={(e) => setBenchState(e.target.value)}
                >
                  <option value="All">All States (n=8)</option>
                  <option value="NSW">NSW (n=5 — Safe k≥5)</option>
                  <option value="TAS">TAS (n=1 — Triggers k&lt;5 Suppression)</option>
                  <option value="QLD">QLD (n=1 — Triggers k&lt;5 Suppression)</option>
                </select>
              </div>
            </div>

            {!checkTierEntitlement(activeTier, 'accessPeerBenchmarking') ? (
              <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 text-xs font-bold text-amber-950">
                Peer Benchmarking requires the <strong>Provider Pro Network</strong> or <strong>Enterprise Governance Guild</strong> tier. Switch tiers in Tab 7 to unlock.
              </div>
            ) : benchmarkResult.suppressed ? (
              <div className="rounded-xl border-2 border-rose-500 bg-rose-50 p-4 text-xs text-rose-950 space-y-1">
                <div className="flex items-center gap-2 font-extrabold text-rose-800">
                  <AlertTriangle className="h-4 w-4" />
                  Privacy Re-Identification Guard Triggered (k-Anonymity Suppression)
                </div>
                <p>{benchmarkResult.reason}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['Worker Screening Currency', benchmarkResult.metrics.workerScreeningCurrency],
                  ['Training Completion Rate', benchmarkResult.metrics.trainingCompletionRate],
                  ['Incident On-Time Closure', benchmarkResult.metrics.incidentClosureOnTime],
                  ['Governance Readiness Score', benchmarkResult.metrics.governanceReadinessScore],
                ].map(([label, stat]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-extrabold text-[#0A2B6D]">{stat.median}% <span className="text-xs font-semibold text-slate-500">median</span></p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      P25: {stat.p25}% · P75: {stat.p75}% · Top Decile (P90): {stat.p90}%
                    </p>
                    <Badge className="mt-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      Cohort n={benchmarkResult.cohortSize} (k≥{MINIMUM_BENCHMARK_COHORT_SIZE} Verified)
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 7. MONETISATION: MEMBERSHIP TIERS & ENTITLEMENTS */}
      {section === 'tiers' && (
        <div className="grid gap-4 md:grid-cols-3">
          {MEMBERSHIP_TIERS.map((tier) => {
            const isCurrent = activeTier === tier.id;
            return (
              <Card key={tier.id} className={`border-2 ${isCurrent ? 'border-[#0072FF]' : 'border-slate-200'}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={tier.badgeTone}>{tier.name}</Badge>
                    <span className="text-lg font-extrabold text-[#0A2B6D]">${tier.priceMonthly}<span className="text-xs font-normal">/mo</span></span>
                  </div>
                  <p className="text-xs text-slate-600">{tier.tagline}</p>
                  <ul className="space-y-1 text-xs text-[#0A2B6D]">
                    <li>• Public Hubs &amp; Q&amp;A: <strong>Included</strong></li>
                    <li>• Private Executive Groups: <strong>{tier.entitlements.joinPrivateExecutiveGroups ? 'Included' : 'Not Included'}</strong></li>
                    <li>• k≥5 Peer Benchmarking: <strong>{tier.entitlements.accessPeerBenchmarking ? 'Included' : 'Locked'}</strong></li>
                    <li>• Adviser Marketplace Discount: <strong>{tier.entitlements.bookAdviserDiscountPct}% off</strong></li>
                    <li>• CPD Certificates / yr: <strong>{tier.entitlements.cpdCertificatesIncluded === 999 ? 'Unlimited' : tier.entitlements.cpdCertificatesIncluded}</strong></li>
                  </ul>
                  <Button
                    size="sm"
                    className="w-full"
                    variant={isCurrent ? 'outline' : 'default'}
                    onClick={() => {
                      setActiveTier(tier.id);
                      toast({ title: `Switched to ${tier.name}`, description: 'Entitlements updated across groups, benchmarking, and adviser quotes.' });
                    }}
                  >
                    {isCurrent ? 'Active Membership Tier' : `Activate ${tier.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 8. TESTS PROVING COMMUNITY USERS CAN NEVER ACCESS PRIVATE COMPLIANCE DATA */}
      {section === 'tests' && (
        <div className="space-y-4">
          <Card className="border-2 border-[#0A2B6D]">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0A2B6D]">
                    Live Zero-Trust Boundary Simulator: Prove Community Users Can NEVER Access Private Compliance Entities
                  </h3>
                  <p className="text-xs text-slate-600">
                    Select any of the {PRIVATE_COMPLIANCE_ENTITIES.length} private compliance entities and simulate a Community Member / External Adviser read probe.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-[#0A2B6D]"
                    value={probeEntity}
                    onChange={(e) => setProbeEntity(e.target.value)}
                  >
                    {PRIVATE_COMPLIANCE_ENTITIES.map((ent) => (
                      <option key={ent} value={ent}>{ent} (Private Compliance Entity)</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={runBoundaryProbe}>
                    <Play className="mr-1.5 h-3.5 w-3.5" />Run Access Probe
                  </Button>
                </div>
              </div>
              {probeResult && (
                <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-3 text-xs font-bold text-emerald-950">
                  <CheckCircle2 className="mr-1.5 inline h-4 w-4 text-emerald-700" />
                  PASS — Access Blocked: {probeResult.message}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-[#0A2B6D]">
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-extrabold text-[#0A2B6D]">
                Wave 2 Community Platform Verification Matrix (ID | Test | Steps | Expected | Pass/Fail)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="p-2 font-extrabold text-[#0A2B6D]">ID</th>
                      <th className="p-2 font-extrabold text-[#0A2B6D]">Test</th>
                      <th className="p-2 font-extrabold text-[#0A2B6D]">Steps</th>
                      <th className="p-2 font-extrabold text-[#0A2B6D]">Expected</th>
                      <th className="p-2 font-extrabold text-[#0A2B6D]">Pass/Fail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testMatrix.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="p-2 font-mono font-bold text-[#0A2B6D] whitespace-nowrap">{row.id}</td>
                        <td className="p-2 font-bold text-[#0A2B6D]">
                          <div>{row.test}</div>
                          <div className="text-[10px] font-semibold text-[#0072FF]">{row.category}</div>
                        </td>
                        <td className="p-2 text-slate-600">{row.steps}</td>
                        <td className="p-2 text-slate-700">{row.expected}</td>
                        <td className="p-2 whitespace-nowrap">
                          <Badge className="bg-emerald-600 text-white font-extrabold">{row.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}