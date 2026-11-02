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
            "flex w-full flex-wrap items-center gap-2 rounded-2xl border-2 border-[#5A00D6] bg-white p-2 text-[#0A2B6D] shadow-sm",
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
        {/* Top Blue -> Purple -> Pink Gradient Accent Strip */}
        <div className="col-span-full -mx-2 -mt-2 mb-0.5">
          <div className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />
        </div>

        {/* Illuminated Remote Control Tab Triggers */}
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
          "inline-flex min-h-[32px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#0072FF] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] [&_svg]:mr-0 [&_svg]:size-3.5 [&_svg]:shrink-0 ring-offset-background transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#5A00D6] data-[state=active]:border-[#5A00D6] data-[state=active]:text-white data-[state=active]:shadow-sm",
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
  const tileIdx = Number(props['data-tile-index'] || 0);
  const symColor = APP_DESIGN_ICON_COLOURS[tileIdx % APP_DESIGN_ICON_COLOURS.length];
  const coloredIcon =
    iconNode && React.isValidElement(iconNode)
      ? React.cloneElement(iconNode, {
          className: 'h-3 w-3 shrink-0',
          style: { color: symColor },
        })
      : null;

  return (
    <TabsPrimitive.Trigger
      data-dashboard-tab=""
      data-dashboard-tone={dashboardTabTone(props.value)}
      ref={ref}
      className={cn(
        "group relative flex h-full min-h-[64px] w-full flex-col rounded-2xl p-[2px] text-left shadow-[0_0_12px_rgba(90,0,214,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(0,198,255,0.75)] focus-visible:outline-none data-[state=active]:shadow-[0_0_20px_rgba(0,198,255,0.85)] data-[state=active]:scale-[1.01] disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      style={{ background: BRAND_GRADIENT }}
      {...props}
    >
      <span
        className="flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[14px]"
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        {/* Top White Title Bar: Dark Blue Heading Changing to App Design Colours (Slightly Larger than White Writing Below) */}
        <span className="flex min-h-[30px] w-full items-center justify-between gap-1.5 bg-white px-2.5 py-1">
          <span className="flex min-w-0 items-center gap-1.5">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF] shadow-2xs"
              style={{ border: `1.5px solid ${symColor}` }}
            >
              {coloredIcon}
            </span>
            <span
              className="min-w-0 bg-clip-text text-[10.5px] font-extrabold leading-tight tracking-tight text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                wordBreak: 'normal',
                overflowWrap: 'normal',
              }}
            >
              <span style={{ color: symColor }}>◉</span> {labelText}
            </span>
          </span>
          {/* Illuminated LED Status Pill */}
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F5F0FF] px-1.5 py-0 text-[7px] font-black uppercase text-[#5A00D6] group-data-[state=active]:bg-[#0A2B6D] group-data-[state=active]:text-[#00C6FF]">
            <span
              className="h-1.5 w-1.5 rounded-full group-data-[state=active]:bg-[#00C6FF]"
              style={{
                backgroundColor: symColor,
                boxShadow: `0 0 6px 1px ${symColor}`,
              }}
            />
            <span>LIVE</span>
          </span>
        </span>

        {/* Bottom Dark Navy Body: Smaller Crisp White Writing */}
        <span className="qa-tab-body flex min-h-[32px] w-full flex-1 items-center justify-between gap-1 px-2.5 py-1">
          <span
            className="min-w-0 flex-1 break-words text-[8.5px] font-bold leading-snug text-white"
            style={{ color: '#FFFFFF' }}
          >
            {subtitle}
          </span>
          <ArrowRight className="h-2.5 w-2.5 shrink-0 transition group-hover:translate-x-0.5" style={{ color: symColor }} />
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