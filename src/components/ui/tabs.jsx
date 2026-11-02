import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import dashboardTabTone from '@/lib/dashboardTabTone';
import { getHeaderView } from '@/lib/fullColourTiles';
import { Image } from '@/components/ui/image';
import '@/components/dashboard/dashboardNavigation.css';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

const TAB_SUBTITLES = {
  details: 'Profile & Personal Details',
  'participant-details': 'Participant Plan & Profile',
  'intake-docs': '100-Pt Onboarding Files',
  forms: 'Online Fillable Forms',
  files: 'Mandatory File Checklist',
  participants: 'Approved Participant Links',
  personnel: 'Key Contacts & Directory',
  hr: 'Contracts, PDs & Reviews',
  intake: '1-Click Intake Workflow',
  visual: 'Visual Boards & Routines',
  goals: 'Outcomes & Goal Progress',
  'progress-notes': 'Shift & Support Notes',
  'progress-reports': '10-Weekly Review Reports',
  roster: 'Shifts, Calendar & SCHADS',
  community: 'Council & Local Programs',
  programs: 'Events & Activities',
  incidents: '24h / 5d NDIS Incident Log',
  risks: 'Risk Matrix & Controls',
  emergency: 'Drills & Safety Checks',
  ndis: 'Commission News & Alerts',
  receipts: 'Receipts & Reimbursements',
  communications: 'Inbox, Notes & Broadcasts',
  training: 'LMS Courses & AI Quizzes',
  feedback: 'Compliments & Complaints',
  'name-tag': 'Printable Staff ID Badges',
  documentation: 'Audit & Folder Checklist',
  work: 'My Shifts, Tasks & Goals',
  documents: 'Personal Document Vault',
  shoreline: '44×44px Heatmap & Cheers',
  leave: 'Leave Requests & Approvals',
  reviews: 'Performance Appraisals',
  volunteering: 'Volunteers & Placements',
  'media-goals': 'Achieving Goals & Hobbies',
  performance: 'Appraisal Compliance',
  paperwork: 'Contracts & Position PDs',
  'file-completeness': '100-Pt Evidence Check',
  templates: 'Official HR Templates',
  skills: '17-Pt Competency Studio',
  payroll: 'Pay Runs, Super & STP',
  calendar: 'Schedule & Dates View',
  shifts: 'Live Shift Register',
  approvals: 'Timesheet Sign-Offs',
  ops: 'Roster Operations Hub',
  coverage: 'Live Coverage Heatmap',
  patterns: 'Recurring Shift Patterns',
  'shift-details': 'Participant Shift Rules',
  availability: 'Worker Availability Log',
  benchmark: 'SCHADS & PRODA Suite',
  timesheets: 'Verified Shift Hours',
  payslips: 'Employee Payslip Vault',
  runs: 'Pay Runs & ABA Exports',
  reports: 'Financial & Tax Reports',
};

function resolveTabSubtitle(value, labelText, explicitHint) {
  if (explicitHint) return explicitHint;
  const key = String(value || '').toLowerCase();
  if (TAB_SUBTITLES[key]) return TAB_SUBTITLES[key];
  if (labelText && labelText.length > 0) return `${labelText} workspace`;
  return 'Interactive workspace view';
}

function extractTriggerParts(children) {
  const arr = React.Children.toArray(children);
  let iconNode = null;
  const textParts = [];

  arr.forEach((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      textParts.push(String(child));
    } else if (React.isValidElement(child)) {
      if (!iconNode && (child.type?.displayName || child.type?.render || typeof child.type === 'function' || child.props?.className?.includes('h-'))) {
        iconNode = React.cloneElement(child, {
          className: 'h-3 w-3 shrink-0 text-white',
          style: { color: '#FFFFFF' },
        });
      } else if (child.props?.children) {
        const nested = React.Children.toArray(child.props.children);
        nested.forEach((n) => {
          if (typeof n === 'string' || typeof n === 'number') {
            textParts.push(String(n));
          } else if (React.isValidElement(n) && typeof n.props?.children === 'string') {
            textParts.push(n.props.children);
          }
        });
      }
    }
  });

  const labelText = textParts[0] || 'Section';
  const inferredHint = textParts.length > 1 ? textParts.slice(1).join(' · ') : '';
  return { iconNode, labelText, inferredHint };
}

const DashboardTabsContext = React.createContext({ isDashboard: false });

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>} props */
({ className = undefined, children, ...props }, ref) => {
  const hasExplicitUndefined =
    Object.prototype.hasOwnProperty.call(props, 'data-dashboard-tabs') &&
    props['data-dashboard-tabs'] === undefined;
  const isDashboard = !hasExplicitUndefined;

  if (!isDashboard) {
    return (
      <DashboardTabsContext.Provider value={{ isDashboard: false }}>
        <TabsPrimitive.List
          ref={ref}
          className={cn(
            "flex w-full flex-wrap items-center gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-2 text-[#0A2B6D] shadow-sm",
            className
          )}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </DashboardTabsContext.Provider>
    );
  }

  let tileCounter = 0;
  const indexedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    const idx = tileCounter++;
    return React.cloneElement(child, { 'data-tile-index': idx });
  });

  return (
    <DashboardTabsContext.Provider value={{ isDashboard: true }}>
      <TabsPrimitive.List
        data-dashboard-tabs=""
        ref={ref}
        className={cn(
          "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel",
          className
        )}
        {...props}
      >
        {/* Platform Name on Top + Smaller-Length Logo Below App Name + Blue/Purple/Pink Slogan */}
        <div className="col-span-full -mx-3 -mt-3 mb-0.5">
          <div className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />
          <div className="flex flex-col items-center px-3.5 pb-1.5 pt-2.5 text-center sm:px-4">
            <span className="font-editorial text-[13px] font-extrabold leading-tight tracking-tight text-[#0A2B6D] whitespace-nowrap">
              Compliance
              <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                Infinity
              </span>
            </span>
            <Image
              src={CHR_LOGO}
              alt="ComplianceHR Infinity"
              fittingType="fit"
              className="mt-1 h-5 w-14 rounded-md border border-slate-200 bg-white px-1 py-0.5 shadow-2xs"
            />
            <span className="mt-1 text-[8.5px] font-extrabold leading-tight">
              <span style={{ color: '#0072FF' }}>Complete Control.</span>{' '}
              <span style={{ color: '#5A00D6' }}>Greater Confidence.</span>{' '}
              <span style={{ color: '#FF2E9A' }}>Brighter Success.</span>
            </span>
          </div>
        </div>

        {/* Screens / Modules Only Underneath */}
        {indexedChildren}
      </TabsPrimitive.List>
    </DashboardTabsContext.Provider>
  );
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>} props */
({ className = undefined, children, ...props }, ref) => {
  const { isDashboard } = React.useContext(DashboardTabsContext);

  if (!isDashboard) {
    return (
      <TabsPrimitive.Trigger
        data-dashboard-tab=""
        data-dashboard-tone={dashboardTabTone(props.value)}
        ref={ref}
        className={cn(
          "inline-flex min-h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#0A2B6D] [&_svg]:mr-0 [&_svg]:size-3.5 [&_svg]:shrink-0 ring-offset-background transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white data-[state=active]:shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Trigger>
    );
  }

  const tileIdx =
    props['data-tile-index'] ?? props['data-module-index'] ?? 0;
  const headerBg = getHeaderView(tileIdx);
  const { iconNode, labelText, inferredHint } = extractTriggerParts(children);
  const subtitle = resolveTabSubtitle(
    props.value,
    labelText,
    props['data-hint'] || inferredHint
  );

  return (
    <TabsPrimitive.Trigger
      data-dashboard-tab=""
      data-dashboard-tone={dashboardTabTone(props.value)}
      ref={ref}
      className={cn(
        "group flex h-full min-h-[98px] w-full flex-col gap-[3px] rounded-xl border-2 border-[#0A2B6D] bg-[#0A2B6D] p-[3px] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md focus-visible:outline-none data-[state=active]:border-[#5A00D6] data-[state=active]:shadow-md data-[state=active]:ring-2 data-[state=active]:ring-[#5A00D6]/25 data-[state=active]:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* iPad-Style Screen Matching Quick Access */}
      <span className="flex w-full flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
        {/* Coloured Header Inside Screen */}
        <span
          className="qa-tab-header flex min-h-[38px] w-full items-center justify-between gap-1 px-1.5 py-1 text-white"
          style={{ background: headerBg }}
        >
          <span className="flex min-w-0 items-center gap-1">
            {iconNode}
            <span
              className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white"
              style={{ color: '#FFFFFF', wordBreak: 'normal', overflowWrap: 'normal' }}
            >
              {labelText}
            </span>
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/75 group-data-[state=active]:bg-[#00C6FF]" />
        </span>

        {/* White Writing Area Inside Screen */}
        <span className="qa-tab-body flex min-h-[40px] w-full flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
          <span
            className="min-w-0 flex-1 break-words text-[10px] font-bold leading-[12.5px] text-[#0A2B6D]/85"
            style={{ color: '#0A2B6D' }}
          >
            {subtitle}
          </span>
          <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF] transition group-hover:translate-x-0.5 group-hover:text-[#FF2E9A]" />
        </span>
      </span>

      {/* iPad Home Indicator Bar */}
      <span className="flex h-[5px] w-full items-center justify-center">
        <span className="h-[2.5px] w-6 rounded-full bg-white/45 transition-all group-hover:bg-white/80 group-data-[state=active]:w-8 group-data-[state=active]:bg-[#00C6FF]" />
      </span>
    </TabsPrimitive.Trigger>
  );
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(
  /** @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>} props */
({ className = undefined, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }