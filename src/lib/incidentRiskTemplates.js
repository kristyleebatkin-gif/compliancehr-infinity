// Reusable templates for incident investigations and risk mitigation.
// Each template populates text fields when loaded via the TemplatePicker.

export const INVESTIGATION_TEMPLATES = [
  {
    id: 'general',
    name: 'General Incident Investigation',
    description: 'Standard root-cause investigation steps for any incident type',
    root_cause:
      "Apply the '5 Whys' technique to trace the incident to its underlying cause. Consider people, process, environment, equipment, and organisational factors.",
    findings:
      'Standard investigation steps:\n' +
      '1. Secure the scene and ensure participant/staff safety\n' +
      '2. Provide immediate first aid / medical attention\n' +
      '3. Notify next of kin / advocate within the required timeframe\n' +
      '4. Preserve evidence (photos, CCTV, equipment)\n' +
      '5. Interview those involved and witnesses separately within 48 hours\n' +
      '6. Review relevant records (rosters, care plans, training, prior incidents)\n' +
      '7. Identify contributing factors and root cause (5 Whys)\n' +
      '8. Assess whether the incident is reportable to the NDIS Commission\n' +
      '9. Document findings and assess risk of recurrence',
    recommendations:
      '1. Update participant care / support plan as required\n' +
      '2. Review and revise relevant policies and procedures\n' +
      '3. Provide refresher training to involved staff\n' +
      '4. Share lessons learned with the team\n' +
      '5. Schedule a follow-up review to verify effectiveness of controls\n' +
      '6. Log reportable incident via the NDIS Commission portal if applicable',
  },
  {
    id: 'medication',
    name: 'Medication Error Investigation',
    description: 'Steps for investigating a medication administration error',
    root_cause:
      "Identify which of the '7 Rights' was breached (right person, drug, dose, route, time, reason, documentation) and the system failure that allowed it.",
    findings:
      '1. Confirm the 7 Rights deviation and what actually occurred\n' +
      '2. Retrieve the medication chart, MAR and Webster-pak for review\n' +
      '3. Review staff competency and medication training records\n' +
      '4. Check for participant adverse effects and arrange medical review\n' +
      '5. Identify system failures (charting, double-check, storage, handover)\n' +
      '6. Confirm notification to GP / pharmacist / NDIS Commission',
    recommendations:
      '1. Complete a medication incident report and notify the GP\n' +
      '2. Conduct a medication competency reassessment\n' +
      '3. Reinforce independent double-check at administration\n' +
      '4. Review the medication management plan with the pharmacist\n' +
      '5. Update the participant care plan and risk assessment',
  },
  {
    id: 'behavioural',
    name: 'Behavioural Incident Investigation',
    description: 'Investigation steps for incidents of challenging behaviour',
    root_cause:
      'Identify antecedents (triggers) and setting events, and assess the adequacy of the current Behaviour Support Plan.',
    findings:
      '1. Identify antecedents (triggers) and setting events\n' +
      '2. Review the Behaviour Support Plan (BSP) and any restrictive practice authorisation\n' +
      '3. Document the observed behaviour, intensity and duration\n' +
      '4. Review staff de-escalation skills and training\n' +
      '5. Assess environmental and communication factors\n' +
      '6. Check restrictive practice reporting obligations',
    recommendations:
      '1. Review and update the Behaviour Support Plan with a practitioner\n' +
      '2. Provide Positive Behaviour Support training to the team\n' +
      '3. Adjust staffing ratios / roster if indicated\n' +
      '4. Report any restrictive practice via the NDIS portal if applicable\n' +
      '5. Schedule a multi-disciplinary review',
  },
  {
    id: 'abuse-neglect',
    name: 'Abuse / Neglect Investigation',
    description: 'Safeguarding-focused steps for alleged abuse or neglect',
    root_cause:
      'Determine the nature and extent of the alleged conduct and any failure of safeguarding controls or supervision.',
    findings:
      '1. Ensure immediate safety and separation from the alleged perpetrator\n' +
      '2. Preserve all evidence and communications\n' +
      '3. Make the mandatory report to the NDIS Commission within the required timeframe\n' +
      '4. Consider police notification\n' +
      '5. Interview the participant (with advocate / support person) and witnesses\n' +
      '6. Review safeguarding controls and supervision records\n' +
      '7. Suspend or redeploy staff pending investigation if required',
    recommendations:
      '1. Implement a safeguarding plan with increased monitoring\n' +
      '2. Conduct a disciplinary process per HR policy\n' +
      '3. Reinforce Code of Conduct and professional boundaries training\n' +
      '4. Review incident reporting culture and supervision\n' +
      '5. Notify family / advocate using approved communication',
  },
  {
    id: 'manual-handling',
    name: 'Manual Handling / Workplace Safety',
    description: 'Steps for investigating a manual handling or workplace injury',
    root_cause:
      'Assess the task, equipment, environment and staffing factors that contributed to the injury.',
    findings:
      '1. Confirm the injury and that first aid treatment was provided\n' +
      '2. Notify workplace health & safety and log in the hazard register\n' +
      '3. Review the task-specific manual handling assessment\n' +
      '4. Inspect equipment (hoists, slings, transfer boards)\n' +
      '5. Review staffing levels and time pressures\n' +
      '6. Interview staff and review training records',
    recommendations:
      '1. Complete workers compensation paperwork if injured\n' +
      '2. Update the manual handling care plan\n' +
      '3. Schedule equipment maintenance or replacement\n' +
      '4. Provide refresher manual handling training\n' +
      '5. Review the roster to allow safe task completion',
  },
];

export const MITIGATION_TEMPLATES = [
  {
    id: 'manual-handling',
    name: 'Manual Handling / Musculoskeletal',
    description: 'Hierarchy-of-controls actions for manual handling risk',
    elimination_actions:
      'Redesign the task to remove manual handling where possible (e.g. mechanical lift instead of manual transfer; relocate frequently used items to waist height).',
    minimise_actions:
      'Use approved manual handling techniques; two-person assists for high-risk transfers; rotate tasks; reduce transfer frequency.',
    isolate_actions:
      'Use mechanical aids (hoists, standing hoists, transfer boards) and ensure equipment is serviced and accessible; keep pathways clear.',
    staff_training_controls:
      'Annual manual handling refresher; competency assessment before independent transfers; supervisor sign-off on each participant transfer plan.',
    compliance_controls:
      'Align with NDIS Practice Standards and WHS manual handling policy; document each transfer in the care plan; review after any incident.',
  },
  {
    id: 'challenging-behaviour',
    name: 'Challenging Behaviour',
    description: 'Mitigation actions for risks from participant behaviour',
    elimination_actions:
      'Remove identified triggers where possible (noise, crowding, unmet needs); adjust environment and routine to prevent escalation.',
    minimise_actions:
      'Implement proactive Behaviour Support Plan strategies; de-escalation techniques; reduce demands during high-risk periods.',
    isolate_actions:
      'Create a safe space; remove hazards / objects that could cause harm; ensure other participants are kept at a safe distance.',
    staff_training_controls:
      'Positive Behaviour Support training; de-escalation and restrictive practice training; scenario-based competency checks.',
    compliance_controls:
      'Restrictive practice authorisation and reporting via the NDIS portal; BSP reviewed by a registered practitioner; document all incidents.',
  },
  {
    id: 'medication',
    name: 'Medication Management',
    description: 'Controls for medication administration risk',
    elimination_actions:
      'Use dose-administration aids (Webster-paks) prepared by the pharmacist; eliminate high-risk medications where alternatives exist.',
    minimise_actions:
      'Independent double-check at administration; standardised MAR charting; limited staff authorised to administer.',
    isolate_actions:
      'Locked medication storage; separate storage for PRN and S8 medications; clear labelling.',
    staff_training_controls:
      'Medication competency assessment annually; PRN and S8 handling training; high-alert medication protocols.',
    compliance_controls:
      'Align with the NDIS Medication Management Practice Standard; incident reporting for any error; regular pharmacy review.',
  },
  {
    id: 'infection-control',
    name: 'Infection Prevention & Control',
    description: 'Controls for infection prevention risk',
    elimination_actions:
      'Exclude symptomatic staff / participants; vaccinate per schedule; remove shared items where possible.',
    minimise_actions:
      'Hand hygiene audits; standard precautions; PPE availability; reduce face-to-face contact during outbreaks.',
    isolate_actions:
      'Isolate infectious participants; dedicate equipment; cohort staffing during outbreaks.',
    staff_training_controls:
      'Infection control training annually; donning / doffing PPE; outbreak management procedures.',
    compliance_controls:
      'Align with the NDIS IPC Practice Standard; maintain the IPC plan; report notifiable diseases to public health.',
  },
  {
    id: 'absconding',
    name: 'Participant Absconding / Elopement',
    description: 'Controls for participants at risk of absconding',
    elimination_actions:
      'Assess absconding risk at intake; review triggers; avoid unnecessary triggers in routine.',
    minimise_actions:
      'Supervision levels matched to risk; GPS / tracker where appropriate; buddy system on community access.',
    isolate_actions:
      'Secure exits; alarms on doors; fencing; visual barriers; controlled access.',
    staff_training_controls:
      'Absconding response training; search procedures; quarterly scenario drills.',
    compliance_controls:
      'Document risk in the participant care plan; review after any incident; notify family / advocate and police per protocol.',
  },
  {
    id: 'falls',
    name: 'Falls Risk',
    description: 'Mitigation actions for participant falls risk',
    elimination_actions:
      'Remove trip hazards; repair flooring; relocate the participant to a ground floor where possible.',
    minimise_actions:
      'Falls risk assessment and care plan; mobility aids; footwear checks; vision / hearing reviews.',
    isolate_actions:
      'Bed / chair alarms; non-slip mats; grab rails; supervised transfers.',
    staff_training_controls:
      'Falls prevention training; post-fall response protocol; mobility aid competency.',
    compliance_controls:
      'Align with the falls prevention policy; document assessments and review after each fall; report serious falls.',
  },
];

// Merge template text into an existing field value (append with a blank-line separator).
export const mergeTemplateField = (existing, add) =>
  add ? (existing && existing.trim() ? `${existing.trim()}\n\n${add}` : add) : existing;