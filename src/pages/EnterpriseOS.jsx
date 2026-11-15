import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OsCard from '@/components/enterprise/os/OsCard';
import OsDetailPanel from '@/components/enterprise/os/OsDetailPanel';
import RoleWorkspaceTable from '@/components/enterprise/os/RoleWorkspaceTable';
import PlatformAuditPanel from '@/components/enterprise/os/PlatformAuditPanel';
import RoadmapPanel from '@/components/enterprise/os/RoadmapPanel';
import { OPERATING_SYSTEMS, OS_BY_ID, PLATFORM_COVERAGE, PLATFORM_AUDIT } from '@/lib/enterpriseOS';
import { ROLE_WORKSPACES } from '@/lib/enterpriseRoleWorkspaces';

const SUMMARY = [
  { label: 'Operating systems', value: OPERATING_SYSTEMS.length },
  { label: 'Capabilities with source', value: PLATFORM_COVERAGE.live },
  { label: 'Capabilities partial', value: PLATFORM_COVERAGE.partial },
  { label: 'Capabilities missing', value: PLATFORM_COVERAGE.gap },
  { label: 'Role workspaces mapped', value: ROLE_WORKSPACES.length },
  { label: 'Connected modules', value: PLATFORM_AUDIT.modules },
];

export default function EnterpriseOS() {
  const [osId, setOsId] = useState(OPERATING_SYSTEMS[0].id);
  const selected = OS_BY_ID[osId] || OPERATING_SYSTEMS[0];

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4 px-3 py-4 sm:px-5">
      <PageHeader
        title="Enterprise OS"
        subtitle="The Enterprise vNext operating layer: every operating system, the modules that serve it, live registers, and the gaps still to build."
        icon={Layers}
      />

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {SUMMARY.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <dt className="text-[11px] font-semibold leading-snug text-[#0A2B6D]/80">{item.label}</dt>
            <dd className="text-2xl font-extrabold leading-tight text-[#0A2B6D]">{item.value}</dd>
          </div>
        ))}
      </dl>

      <Tabs defaultValue="systems">
        <TabsList aria-label="Enterprise OS views" className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="systems">Operating systems</TabsTrigger>
          <TabsTrigger value="workspaces">Role workspaces</TabsTrigger>
          <TabsTrigger value="audit">Platform audit</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="mt-3 space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {OPERATING_SYSTEMS.map((os) => (
              <OsCard key={os.id} os={os} active={os.id === selected.id} onSelect={setOsId} />
            ))}
          </div>
          <OsDetailPanel os={selected} />
        </TabsContent>

        <TabsContent value="workspaces" className="mt-3">
          <RoleWorkspaceTable />
        </TabsContent>

        <TabsContent value="audit" className="mt-3">
          <PlatformAuditPanel />
        </TabsContent>

        <TabsContent value="roadmap" className="mt-3">
          <RoadmapPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}