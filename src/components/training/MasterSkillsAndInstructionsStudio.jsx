import React, { useState, useMemo } from 'react';
import {
  Award, BookOpen, CheckCircle2, Download, FileText, Printer, Search, ShieldCheck, Wrench,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { downloadCsv } from '@/lib/csvExport';
import { useToast } from '@/components/ui/use-toast';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

export const MASTER_SKILLS_REGISTER = [
  {
    id: 'SKL-001',
    skillName: 'Safe Medication Administration & MAR Chart Verification',
    roleCategory: 'Support Worker / Clinical Endorsed',
    description: 'Safe preparation, 6-rights verification, administration, observation, and MAR signing for oral, topical, and PRN medications.',
    purpose: 'Prevent medication errors, adverse drug reactions, and omitted doses while upholding participant dignity and informed consent.',
    requiredKnowledge: '6 Rights of Medication (Right Person, Medication, Dose, Time, Route, Documentation), PRN protocols, storage temperatures, S8 dual-sign rules.',
    prerequisites: 'HLTHPS006 Assist clients with medication · NDIS Worker Orientation · Current First Aid & CPR.',
    requiredTools: 'Locked medication cabinet, Pharmacy Webster-Pak, Current GP-signed Medication Authority, MAR Chart (DOC-062), PRN Log (DOC-063), Disposable gloves.',
    stepByStep: '1. Wash hands & verify participant identity & consent.\n2. Cross-check Webster-Pak label against GP Authority & MAR Chart (6 Rights).\n3. Inspect blister pack integrity & expiry date.\n4. Assist participant with medication & water per swallowing/mealtime plan.\n5. Observe for immediate swallowing completion & wellbeing.\n6. Sign MAR Chart immediately in ink/digital log & lock cabinet.',
    safetyPrecautions: 'Never crush tablets unless explicitly authorised by Pharmacist/GP. Never sign MAR before the medication is actually taken. Report any refusal, dropped tablet, or error immediately.',
    relevantPolicies: 'DOC-061 Safe Medication Management Policy · DOC-025 Incident Management Policy.',
    relatedForms: 'DOC-062 MAR Signing Chart · DOC-063 PRN Protocol & Observation Log · DOC-026 Incident Report Form.',
    examples: 'Participant requests PRN pain relief -> Worker checks minimum 4-hour interval on MAR, verifies PRN protocol trigger, administers dose, signs MAR, and logs effectiveness 45 mins later.',
    commonMistakes: 'Pre-signing the MAR chart before administration; failing to record effectiveness after PRN dose; leaving Webster-Pak unattended on kitchen bench.',
    assessmentRequirements: '100% pass on 15-question Medication Knowledge Quiz + 3 supervised error-free practical administrations.',
    practicalDemonstration: 'Direct observation by Team Leader / Clinical Nurse across 3 separate medication rounds including 1 simulated refusal scenario.',
    competencyEvidence: 'Signed Practical Observation Form (DOC-046) + Completed MAR sample + Quiz score 100%.',
    supervisorApproval: 'Team Leader / Clinical Nurse Delegation Sign-Off',
    reviewDate: '2027-01-15 (Annual Mandatory Re-Assessment)',
  },
  {
    id: 'SKL-002',
    skillName: 'Manual Handling, Hoist Transfer & Falls Prevention',
    roleCategory: 'Support Worker / High-Intensity',
    description: 'Safe biomechanical positioning, ceiling/mobile hoist operation, sling inspection, and mobility transfer assistance.',
    purpose: 'Eliminate musculoskeletal injuries to workers and prevent participant skin tears, drops, or falls during transfers.',
    requiredKnowledge: 'No-lift policy principles, hoist SWL (Safe Working Load), sling colour sizing & loop configuration, pressure area care.',
    prerequisites: 'HLTWHS005 Conduct manual tasks safely · Site Buddy Shift Induction.',
    requiredTools: 'Serviced mobile/ceiling hoist (6-monthly tag current), participant-specific sling, slide sheet, gait belt, non-slip footwear.',
    stepByStep: '1. Conduct Take-5 hazard check of floor space, brakes & hoist battery.\n2. Inspect sling stitching, label legibility & SWL rating.\n3. Explain transfer steps clearly to participant & gain consent.\n4. Position sling smoothly without creasing skin; attach loops per OT plan.\n5. Raise slightly, pause to check balance & comfort, complete transfer smoothly.\n6. Lower gently, detach sling, document transfer in Shift Note.',
    safetyPrecautions: 'Never use a frayed or unlabelled sling. Never leave a participant suspended in a hoist unattended. Keep hoist brakes unlocked on mobile lifters during lift so base self-centres.',
    relevantPolicies: 'DOC-073 WHS Policy · DOC-079 Asset & Assistive Equipment Policy.',
    relatedForms: 'DOC-074 Take-5 Safety Check · DOC-082 Equipment Maintenance & Defect Log · DOC-057 Shift Progress Note.',
    examples: 'Worker notices frayed loop stitch on medium hoist sling -> Tags sling Out-of-Service immediately, logs defect in Asset Register, uses backup certified sling.',
    commonMistakes: 'Locking mobile hoist castors during lift (causes tipping hazard); mismatching left/right leg strap loop colours.',
    assessmentRequirements: 'Written WHS quiz + Practical demonstration of bed-to-wheelchair hoist transfer and slide-sheet repositioning.',
    practicalDemonstration: 'Observed live transfer with Occupational Therapist or Team Leader verifying sling loop selection and communication.',
    competencyEvidence: 'DOC-046 Practical Competency Sign-Off + Equipment Check Log.',
    supervisorApproval: 'Team Leader / WHS Coordinator',
    reviewDate: '2027-01-15',
  },
  {
    id: 'SKL-003',
    skillName: 'Positive Behaviour Support & Trauma-Informed De-Escalation',
    roleCategory: 'All Direct Support & Team Leaders',
    description: 'Proactive trigger recognition, low-arousal communication, environmental modification, and safe de-escalation aligned with a Behaviour Support Plan (BSP).',
    purpose: 'Safeguard participant emotional wellbeing, uphold human rights, and prevent crisis escalation or unauthorised restrictive practices.',
    requiredKnowledge: 'Functions of behaviour (EATS), early warning signs, low-arousal approach, NDIS Restrictive Practice rules & 5-day reporting.',
    prerequisites: 'NDIS Quality & Safeguards Orientation · Participant-Specific BSP Briefing.',
    requiredTools: 'Participant Behaviour Support Plan (DOC-068), Visual Communication Board, Sensory regulation tools, Duress/Phone comms.',
    stepByStep: '1. Monitor environment for known sensory or routine triggers.\n2. Recognise early warning signs (pacing, vocal changes, withdrawal).\n3. Adopt calm, non-threatening posture, lower voice tone & offer space/choice.\n4. Redirect to preferred regulation activity per proactive BSP strategies.\n5. If escalation occurs, prioritise safety of all persons & follow Crisis Plan.\n6. Conduct post-event debrief, log ABC behaviour chart & Incident Report if required.',
    safetyPrecautions: 'Never use an unauthorised restrictive practice (seclusion, physical hold, locked door, PRN chemical restraint without authorisation). Maintain clear exit path.',
    relevantPolicies: 'DOC-067 Positive Behaviour Support & Restrictive Practices Policy · DOC-001 Participant Rights Charter.',
    relatedForms: 'DOC-068 BSP Implementation Guide · DOC-070 RP Usage Log · DOC-071 Post-Event Debrief Form.',
    examples: 'Noise at shopping centre triggers distress -> Worker offers noise-cancelling headphones and quiet exit to car per BSP proactive strategy, preventing meltdown.',
    commonMistakes: 'Giving rapid verbal instructions during peak distress; failing to report an emergency unauthorised restrictive practice within 5 business days.',
    assessmentRequirements: 'Scenario case study assessment + Supervisor observation of proactive BSP strategy implementation.',
    practicalDemonstration: 'Role-play de-escalation and accurate completion of ABC behaviour observation & RP reporting decision tree.',
    competencyEvidence: 'DOC-046 Competency Sign-Off + Completed ABC & Debrief sample.',
    supervisorApproval: 'Compliance Administrator / Behaviour Support Lead',
    reviewDate: '2027-01-15',
  },
  {
    id: 'SKL-004',
    skillName: 'Mealtime Management, Dysphagia & IDDSI Safe Swallowing',
    roleCategory: 'Support Worker / Clinical Endorsed',
    description: 'Preparation of texture-modified foods and thickened fluids to exact IDDSI levels, upright positioning, and choking emergency response.',
    purpose: 'Prevent choking, aspiration pneumonia, malnutrition, and dehydration for participants with dysphagia.',
    requiredKnowledge: 'IDDSI Levels 0–7 framework, Speech Pathologist Mealtime Plan adherence, silent aspiration signs (wet voice, coughing, eye watering).',
    prerequisites: 'HLTAID011 First Aid · Participant-Specific Speech Pathology Mealtime Training.',
    requiredTools: 'Current Mealtime Management Plan (DOC-064), prescribed thickener & measuring scoop, fork-drip/spoon-tilt test guide.',
    stepByStep: '1. Review participant Mealtime Management Plan before food/drink prep.\n2. Prepare food to exact IDDSI texture (e.g. Level 4 Pureed / Level 5 Minced & Moist) & test consistency.\n3. Ensure participant is seated upright at 90 degrees.\n4. Provide small paced mouthfuls; never rush or feed while coughing/drowsy.\n5. Keep participant upright for 30 minutes post-meal & perform mouth care.\n6. Record fluid/food intake and any coughing/swallowing concerns in Shift Note.',
    safetyPrecautions: 'Never give thin fluids or high-risk foods (nuts, tough meat, dry bread) to a participant on a modified diet. If choking occurs, call 000 and commence First Aid immediately.',
    relevantPolicies: 'DOC-064 Mealtime Management & Nutrition Plan · DOC-025 Incident Management Policy.',
    relatedForms: 'DOC-064 Mealtime Plan · DOC-057 Shift Progress Note · DOC-026 Incident Form.',
    examples: 'Worker performs IDDSI fork-drip test on pureed meal before serving and keeps participant seated upright for 30 minutes after lunch.',
    commonMistakes: 'Guessing thickener scoop amounts; reclined feeding posture; ignoring subtle post-swallow throat clearing.',
    assessmentRequirements: 'IDDSI texture testing practical + Choking first aid drill + Written quiz.',
    practicalDemonstration: 'Prepare Level 2 Mildly Thick fluid and Level 5 Minced & Moist meal under supervisor observation.',
    competencyEvidence: 'DOC-046 Practical Competency Sign-Off + IDDSI test verification.',
    supervisorApproval: 'Team Leader / Clinical Educator',
    reviewDate: '2027-01-15',
  },
  {
    id: 'SKL-005',
    skillName: 'NDIS 24-Hour / 5-Day Reportable Incident Triage & Evidence Preservation',
    roleCategory: 'Team Leader / Compliance Administrator / All Staff',
    description: 'Immediate safety response, scene preservation, statutory NDIS Commission reportability assessment, and 24-hour/5-day notification filing.',
    purpose: 'Ensure participant safety, legal compliance with NDIS Commission timeframes, and thorough root-cause remediation.',
    requiredKnowledge: '6 categories of NDIS Reportable Incidents, 24-hour vs 5-business-day statutory deadlines, open disclosure, procedural fairness.',
    prerequisites: 'DOC-025 Incident Management Policy Induction.',
    requiredTools: 'Incident Clinic Portal (/incidents), DOC-026 Immediate Incident Form, DOC-027 Reportability Assessment, DOC-028 Investigation Report.',
    stepByStep: '1. Make participant & staff safe immediately; call 000 if medical/police needed.\n2. Preserve physical/digital evidence & take authorised hazard photos.\n3. Submit Immediate Incident Report within shift (< 4 hours).\n4. Compliance Admin assesses NDIS reportability & lodges 24-hour notification if reportable.\n5. Notify participant nominee/family (Open Disclosure) & offer support.\n6. Complete 5-day follow-up, root-cause analysis, Risk Register update & CAPA action.',
    safetyPrecautions: 'Never alter or delete original worker incident notes. Maintain strict confidentiality and trauma-informed support.',
    relevantPolicies: 'DOC-025 Incident Management Policy · DOC-013 Risk Management Policy.',
    relatedForms: 'DOC-026, DOC-027, DOC-028, DOC-029, DOC-030.',
    examples: 'Unexplained serious bruising observed -> Immediate GP review arranged, logged in Incident Clinic, 24h NDIS Commission notification submitted, safeguard plan activated.',
    commonMistakes: 'Waiting for internal investigation to finish before lodging the mandatory 24-hour initial NDIS Commission notification.',
    assessmentRequirements: 'Incident classification & SLA calculation practical exercise.',
    practicalDemonstration: 'Complete end-to-end simulated reportable incident entry, 24h deadline calculation, and CAPA linkage.',
    competencyEvidence: 'DOC-046 Competency Sign-Off + Simulated Incident Audit Record.',
    supervisorApproval: 'Provider Administrator / Compliance Administrator',
    reviewDate: '2027-01-15',
  },
  {
    id: 'SKL-006',
    skillName: 'Infection Prevention, PPE Donning/Doffing & Outbreak Containment',
    roleCategory: 'All Staff & Volunteers',
    description: 'Standard and transmission-based precautions, WHO 5 Moments for Hand Hygiene, correct PPE sequence, and biohazard/sharps disposal.',
    purpose: 'Prevent transmission of infectious diseases across participants, workers, and community settings.',
    requiredKnowledge: '5 Moments for Hand Hygiene, contact/droplet/airborne precautions, correct donning & doffing order, spill kit usage.',
    prerequisites: 'NDIS Infection Control Training Module.',
    requiredTools: 'ABHR hand rub, surgical/N95 masks, eye protection, gowns, nitrile gloves, clinical waste & sharps bins, spill kit.',
    stepByStep: '1. Perform hand hygiene (20–30 sec ABHR or 40–60 sec soap & water).\n2. Don PPE in sequence: Gown -> Mask/Respirator -> Eye Protection -> Gloves.\n3. Deliver support using aseptic non-touch technique.\n4. Doff PPE safely at doorway: Gloves -> Hand Hygiene -> Goggles -> Gown -> Mask -> Hand Hygiene.\n5. Seal clinical waste in yellow biohazard bag & disinfect high-touch surfaces.',
    safetyPrecautions: 'Never touch the front of a contaminated mask or goggles during removal. Never recap needles; place directly into Australian Standard sharps container.',
    relevantPolicies: 'DOC-073 WHS & Infection Control Policy · DOC-076 Emergency & Outbreak Plan.',
    relatedForms: 'DOC-074 Take-5 Check · DOC-075 SDS & Infection Kit Register.',
    examples: 'Participant tests positive for influenza -> Worker activates droplet precautions, dons PPE before entry, doffs in sequence, and logs outbreak welfare check.',
    commonMistakes: 'Removing mask before removing contaminated gloves; failing to perform hand hygiene between doffing steps.',
    assessmentRequirements: 'Practical glow-germ handwashing & PPE donning/doffing observation.',
    practicalDemonstration: 'Demonstrate error-free PPE donning and doffing sequence without cross-contamination.',
    competencyEvidence: 'DOC-046 Practical Competency Sign-Off.',
    supervisorApproval: 'Team Leader / WHS Officer',
    reviewDate: '2027-01-15',
  },
];

export default function MasterSkillsAndInstructionsStudio({ onChanged }) {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState(
    () => localStorage.getItem('chr_skill_business_name') || 'ComplianceHR Infinity'
  );
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedSkill, setSelectedSkill] = useState(MASTER_SKILLS_REGISTER[0]);
  const [staffName, setStaffName] = useState('');
  const [supervisorName, setSupervisorName] = useState('Kristy Lee Whelan');
  const [savingSignoff, setSavingSignoff] = useState(false);

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MASTER_SKILLS_REGISTER.filter((s) => {
      if (roleFilter !== 'ALL' && !s.roleCategory.toLowerCase().includes(roleFilter.toLowerCase())) return false;
      if (!q) return true;
      return (
        s.id.toLowerCase().includes(q) ||
        s.skillName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.requiredKnowledge.toLowerCase().includes(q)
      );
    });
  }, [search, roleFilter]);

  const handleSaveBusinessName = (val) => {
    setBusinessName(val);
    localStorage.setItem('chr_skill_business_name', val);
  };

  const handleRecordPracticalSignoff = async () => {
    if (!staffName.trim()) {
      toast({
        title: 'Employee name required',
        description: 'Enter the employee name to record their practical skill assessment sign-off.',
        variant: 'destructive',
      });
      return;
    }
    setSavingSignoff(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
      const certNum = `CERT-${selectedSkill.id}-${Date.now().toString().slice(-5)}`;

      await base44.entities.TrainingCompletion.create({
        learner_name: staffName.trim(),
        employee_name: staffName.trim(),
        learner_type: 'Employee',
        module_title: `${selectedSkill.id}: ${selectedSkill.skillName}`,
        completed_date: today,
        expiry_date: nextYear,
        score: 100,
        status: 'Completed',
        certificate_number: certNum,
        training_notes: `17-Point Practical Competency Verified by ${supervisorName} (${businessName}). Evidence: ${selectedSkill.competencyEvidence}`,
      });

      await base44.entities.Certificate.create({
        staff_name: staffName.trim(),
        module_title: `${selectedSkill.id}: ${selectedSkill.skillName}`,
        certificate_number: certNum,
        issue_date: today,
        expiry_date: nextYear,
        status: 'Active',
        issued_by: supervisorName,
      }).catch(() => null);

      toast({
        title: 'Practical Competency Verified & Certificate Issued',
        description: `${staffName} signed off on ${selectedSkill.skillName} (${certNum}).`,
      });
      setStaffName('');
      onChanged?.();
    } finally {
      setSavingSignoff(false);
    }
  };

  const handleDownloadSkillWord = (skl) => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${skl.id} - ${skl.skillName}</title>
<style>
  body { font-family: Arial, sans-serif; color: #12214B; margin: 28px; }
  .banner { border-top: 10px solid #12214B; background: #F4EAFB; padding: 14px; border-bottom: 3px solid #7138B6; }
  h1 { font-size: 18px; margin: 4px 0; color: #12214B; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11.5px; }
  th { width: 28%; background: #442078; color: #fff; text-align: left; padding: 7px; border: 1px solid #7138B6; }
  td { padding: 7px; border: 1px solid #A45CDE; white-space: pre-line; }
</style></head><body>
<div class="banner">
  <div style="font-size:10px;font-weight:bold;color:#7138B6;">${businessName.toUpperCase()} · SECTION 13 &amp; 14 MASTER SKILL INSTRUCTION &amp; ASSESSMENT</div>
  <h1>${skl.id}: ${skl.skillName}</h1>
  <div style="font-size:11px;color:#184A9C;">Role Scope: ${skl.roleCategory} · Review Date: ${skl.reviewDate}</div>
</div>
<table>
  <tr><th>1. Skill Name</th><td>${skl.skillName} (${skl.id})</td></tr>
  <tr><th>2. Skill Description</th><td>${skl.description}</td></tr>
  <tr><th>3. Purpose</th><td>${skl.purpose}</td></tr>
  <tr><th>4. Required Knowledge</th><td>${skl.requiredKnowledge}</td></tr>
  <tr><th>5. Prerequisites</th><td>${skl.prerequisites}</td></tr>
  <tr><th>6. Required Tools &amp; Equipment</th><td>${skl.requiredTools}</td></tr>
  <tr><th>7. Step-by-Step Instructions</th><td>${skl.stepByStep}</td></tr>
  <tr><th>8. Safety Precautions</th><td>${skl.safetyPrecautions}</td></tr>
  <tr><th>9. Relevant Policies</th><td>${skl.relevantPolicies}</td></tr>
  <tr><th>10. Related Forms</th><td>${skl.relatedForms}</td></tr>
  <tr><th>11. Practical Examples</th><td>${skl.examples}</td></tr>
  <tr><th>12. Common Mistakes to Avoid</th><td>${skl.commonMistakes}</td></tr>
  <tr><th>13. Assessment Requirements</th><td>${skl.assessmentRequirements}</td></tr>
  <tr><th>14. Practical Demonstration</th><td>${skl.practicalDemonstration}</td></tr>
  <tr><th>15. Competency Evidence</th><td>${skl.competencyEvidence}</td></tr>
  <tr><th>16. Supervisor Approval</th><td>${skl.supervisorApproval}</td></tr>
  <tr><th>17. Scheduled Review Date</th><td>${skl.reviewDate}</td></tr>
</table>
</body></html>`;
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skl.id}-${skl.skillName.replace(/[^a-z0-9]+/gi, '-')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="overflow-hidden rounded-2xl border-4 border-[#0072FF] bg-white shadow-xl">
      <div className="px-4 py-2.5 text-white" style={{ background: HEADER_GRADIENT }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-blue-950">
              <BookOpen className="h-3 w-3 text-purple-700" /> SECTIONS 13 &amp; 14 — MASTER SKILLS REGISTER &amp; 17-POINT SKILL INSTRUCTIONS
            </span>
            <h2 className="mt-0.5 text-sm sm:text-base font-black text-white">
              {businessName} — Business-Specific Skill Assessments, 17-Point Instructions &amp; Supervisor Competency Sign-Off
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Input
              value={businessName}
              onChange={(e) => handleSaveBusinessName(e.target.value)}
              placeholder="Configurable Business Name"
              className="h-7 w-48 bg-white text-xs font-black text-blue-950"
            />
            <Button
              size="sm"
              onClick={() =>
                downloadCsv(
                  'master-skills-register-17-point.csv',
                  [
                    { key: 'id', label: 'Skill ID' },
                    { key: 'skillName', label: '1. Skill Name' },
                    { key: 'roleCategory', label: 'Role Scope' },
                    { key: 'description', label: '2. Description' },
                    { key: 'purpose', label: '3. Purpose' },
                    { key: 'requiredKnowledge', label: '4. Required Knowledge' },
                    { key: 'prerequisites', label: '5. Prerequisites' },
                    { key: 'requiredTools', label: '6. Required Tools' },
                    { key: 'stepByStep', label: '7. Step-by-Step Instructions' },
                    { key: 'safetyPrecautions', label: '8. Safety Precautions' },
                    { key: 'relevantPolicies', label: '9. Relevant Policies' },
                    { key: 'relatedForms', label: '10. Related Forms' },
                    { key: 'examples', label: '11. Examples' },
                    { key: 'commonMistakes', label: '12. Common Mistakes' },
                    { key: 'assessmentRequirements', label: '13. Assessment Requirements' },
                    { key: 'practicalDemonstration', label: '14. Practical Demonstration' },
                    { key: 'competencyEvidence', label: '15. Competency Evidence' },
                    { key: 'supervisorApproval', label: '16. Supervisor Approval' },
                    { key: 'reviewDate', label: '17. Review Date' },
                  ],
                  MASTER_SKILLS_REGISTER
                )
              }
              className="h-7 bg-white px-2.5 text-[8.5px] font-black text-purple-950 hover:bg-purple-50"
            >
              <Download className="mr-1 h-3 w-3 text-purple-700" /> Export Master Skills Register (CSV)
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2.5 bg-white">
        {/* Skill Selector Strip */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-teal-700" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills by name, role, tools, or policy..."
              className="h-7 pl-8 text-xs"
            />
          </div>
          {['ALL', 'Support Worker', 'Clinical', 'Team Leader', 'All Staff'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg border px-2 py-1 text-[8px] font-black ${
                roleFilter === r
                  ? 'border-[#0072FF] bg-[#0072FF] text-white'
                  : 'border-teal-300 bg-white text-blue-950'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {filteredSkills.map((skl) => {
            const active = selectedSkill?.id === skl.id;
            return (
              <button
                key={skl.id}
                type="button"
                onClick={() => setSelectedSkill(skl)}
                className={`rounded-xl border p-2 text-left transition-all ${
                  active
                    ? 'border-2 border-[#0072FF] bg-teal-50/70 shadow-sm'
                    : 'border-teal-200 bg-white hover:bg-teal-50/30'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[8px] font-black text-teal-700">{skl.id}</span>
                  <Badge className="bg-[#0072FF] text-white text-[7px]">{skl.roleCategory}</Badge>
                </div>
                <div className="mt-0.5 text-[9.5px] font-black text-blue-950">{skl.skillName}</div>
                <p className="mt-0.5 line-clamp-2 text-[7.5px] font-semibold text-purple-800">
                  {skl.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Full 17-Point Skill Instruction Sheet + Practical Competency Sign-Off */}
        {selectedSkill && (
          <div className="rounded-xl border-2 border-[#0072FF] bg-teal-50/30 p-3 space-y-2.5" style={{ borderTopWidth: '4px' }}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200 pb-2">
              <div>
                <span className="text-[8px] font-black uppercase text-teal-800">
                  17-POINT STRUCTURED SKILL INSTRUCTION &amp; PRACTICAL COMPETENCY PROTOCOL ({selectedSkill.id})
                </span>
                <h3 className="text-sm font-black text-blue-950">{selectedSkill.skillName}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() => handleDownloadSkillWord(selectedSkill)}
                  className="h-7 bg-[#2563eb] px-2.5 text-[8px] font-black text-white"
                >
                  <FileText className="mr-1 h-3 w-3" /> Download Word (.doc)
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="h-7 bg-[#7c3aed] px-2.5 text-[8px] font-black text-white"
                >
                  <Printer className="mr-1 h-3 w-3" /> Print A4 Sheet
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-[8.5px]">
              {[
                ['1. Skill Name', `${selectedSkill.skillName} (${selectedSkill.id})`],
                ['2. Skill Description', selectedSkill.description],
                ['3. Purpose', selectedSkill.purpose],
                ['4. Required Knowledge', selectedSkill.requiredKnowledge],
                ['5. Prerequisites', selectedSkill.prerequisites],
                ['6. Required Tools & Equipment', selectedSkill.requiredTools],
                ['7. Step-by-Step Instructions', selectedSkill.stepByStep],
                ['8. Safety Precautions', selectedSkill.safetyPrecautions],
                ['9. Relevant Policies', selectedSkill.relevantPolicies],
                ['10. Related Forms', selectedSkill.relatedForms],
                ['11. Practical Examples', selectedSkill.examples],
                ['12. Common Mistakes to Avoid', selectedSkill.commonMistakes],
                ['13. Assessment Requirements', selectedSkill.assessmentRequirements],
                ['14. Practical Demonstration', selectedSkill.practicalDemonstration],
                ['15. Competency Evidence', selectedSkill.competencyEvidence],
                ['16. Supervisor Approval Authority', selectedSkill.supervisorApproval],
                ['17. Scheduled Review Date', selectedSkill.reviewDate],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg border border-teal-200 bg-white p-2">
                  <div className="font-black uppercase text-teal-800 text-[7.5px]">{label}</div>
                  <div className="mt-0.5 whitespace-pre-line font-semibold text-blue-950">{val}</div>
                </div>
              ))}
            </div>

            {/* Supervisor Practical Competency Sign-Off Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#0072FF] bg-white p-2.5">
              <div>
                <div className="text-[9px] font-black uppercase text-blue-950">
                  Supervisor Practical Demonstration &amp; Competency Sign-Off
                </div>
                <div className="text-[7.5px] font-semibold text-purple-800">
                  Saves verified TrainingCompletion + issues active Certificate in the live database
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Input
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Employee Name (e.g. Sarah Jenkins)"
                  className="h-7 w-44 text-xs"
                />
                <Input
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="Approving Supervisor"
                  className="h-7 w-44 text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleRecordPracticalSignoff}
                  disabled={savingSignoff}
                  className="h-7 bg-emerald-600 px-3 text-[8.5px] font-black text-white hover:bg-emerald-700"
                >
                  <Award className="mr-1 h-3 w-3" />
                  {savingSignoff ? 'Recording...' : 'Verify Competency & Issue Certificate'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}