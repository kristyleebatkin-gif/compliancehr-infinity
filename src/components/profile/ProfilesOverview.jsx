import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, Heart } from 'lucide-react';
import OurProfilesTab from '@/components/profile/OurProfilesTab';

// Dashboard "Profiles overview": every employee and participant profile in the
// organisation, shown the same way each person sees their own profile.
const OVERVIEW_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager'];

export default function ProfilesOverview({ defaultTab = 'participants' }) {
  const [tab, setTab] = useState(defaultTab);
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="participants"><Heart className="mr-1.5 h-4 w-4" />Our participant profiles</TabsTrigger>
        <TabsTrigger value="staff"><Users className="mr-1.5 h-4 w-4" />Our employee profiles</TabsTrigger>
      </TabsList>
      <TabsContent value="participants" className="mt-4">
        <OurProfilesTab kind="participant" />
      </TabsContent>
      <TabsContent value="staff" className="mt-4">
        <OurProfilesTab kind="staff" />
      </TabsContent>
    </Tabs>
  );
}

export { OVERVIEW_ROLES };