import React from 'react';
import SectionExportButton from '@/components/profile/SectionExportButton';

// Right-aligned export control placed at the top of a profile tab.
export default function ExportRow({ kind, person, section }) {
  return (
    <div className="mb-3 flex justify-end">
      <SectionExportButton kind={kind} person={person} section={section} />
    </div>
  );
}