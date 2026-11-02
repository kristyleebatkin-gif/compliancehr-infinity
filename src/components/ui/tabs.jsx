import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import dashboardTabTone from '@/lib/dashboardTabTone';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import '@/components/dashboard/dashboardNavigation.css';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const LANDING_TOP_LOGO_BLUE =
  'radial-gradient(circle at 50% 35%, rgba(0, 198, 255, 0.42) 0%, #0072FF 44%, #0A2B6D 86%, #061539 100%)';

const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

const APP_DESIGN_ICON_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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
        iconNode = child;
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
          "preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-xl",
          className
        )}
        style={{ background: DARK_NAVY_CHASSIS }}
        {...props}
      >
        {/* TOP 1/4 WHITE: Header with Centred Logo -> Name -> Slogan */}
        <div className="col-span-full -mx-2 -mt-2 mb-1 border-b border-white/15 bg-white">
          <div className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />
          <div className="flex flex-col items-center justify-center px-3 py-2 text-center">
            <BrandLogoLockup size="xs" theme="light" showSlogan={true} />
          </div>
        </div>

        {/* BOTTOM 3/4 DARK BLUE: Remote Control Tab Triggers */}
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
          "inline-flex min-h-[32px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#0072FF] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] [&_svg]:mr-0 [&_svg]:size-3.5 [&_svg]:shrink-0 ring-offset-background transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white data-[state=active]:shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Trigger>
    );
  }

  const { iconNode, labelText, inferredHint } = extractTriggerParts(children);
  const subtitle = resolveTabSubtitle(
    props.value,
    labelText,
    props['data-hint'] || inferredHint
  );
  const whiteIcon =
    iconNode && React.isValidElement(iconNode)
      ? React.cloneElement(iconNode, {
          className: 'h-3 w-3 shrink-0 text-white',
          style: { color: '#FFFFFF' },
        })
      : null;

  return (
    <TabsPrimitive.Trigger
      data-dashboard-tab=""
      data-dashboard-tone={dashboardTabTone(props.value)}
      ref={ref}
      className={cn(
        "group relative flex h-full min-h-[72px] w-full flex-col rounded-2xl p-[2px] text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(161,0,255,0.5)] focus-visible:outline-none data-[state=active]:shadow-[0_0_20px_rgba(0,198,255,0.75)] data-[state=active]:scale-[1.01] disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      style={{ background: BRAND_GRADIENT }}
      {...props}
    >
      <span className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px] bg-[#0A2B6D]/90 backdrop-blur-md">
        {/* Top 1/4 White Title Background */}
        <span className="flex min-h-[32px] w-full items-center justify-between gap-1.5 bg-white px-2.5 py-1">
          <span className="flex min-w-0 items-center gap-1.5">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
              style={{ background: BRAND_GRADIENT }}
            >
              {whiteIcon}
            </span>
            <span
              className="min-w-0 text-[9.5px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]"
              style={{ color: '#0A2B6D', wordBreak: 'normal', overflowWrap: 'normal' }}
            >
              {labelText}
            </span>
          </span>
          {/* Status Indicator + LED Active Glow */}
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F5F0FF] px-1.5 py-0 text-[7px] font-black uppercase text-[#5A00D6] group-data-[state=active]:bg-[#0A2B6D] group-data-[state=active]:text-[#00C6FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF2E9A] group-data-[state=active]:bg-[#00C6FF] group-data-[state=active]:shadow-[0_0_6px_1px_#00C6FF]" />
            <span>LIVE</span>
          </span>
        </span>

        {/* Bottom 3/4 Dark Navy Glassmorphic Body */}
        <span className="qa-tab-body flex min-h-[34px] w-full flex-1 items-center justify-between gap-1 px-2.5 py-1">
          <span
            className="min-w-0 flex-1 break-words text-[9px] font-bold leading-snug text-white/95"
            style={{ color: '#FFFFFF' }}
          >
            {subtitle}
          </span>
          <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#00C6FF] transition group-hover:translate-x-0.5" />
        </span>

        {/* iPad LED Home Indicator Bar */}
        <span className="flex h-[5px] w-full items-center justify-center pb-0.5">
          <span className="h-[2.5px] w-6 rounded-full bg-white/40 transition-all group-hover:bg-white/80 group-data-[state=active]:w-9 group-data-[state=active]:bg-[#00C6FF] group-data-[state=active]:shadow-[0_0_8px_#00C6FF]" />
        </span>
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