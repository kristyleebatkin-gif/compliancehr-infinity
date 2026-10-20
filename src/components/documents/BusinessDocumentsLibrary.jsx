import React from 'react';
import BusinessPlanTemplates from '@/components/documents/BusinessPlanTemplates';
import PolicyTemplates from '@/components/documents/PolicyTemplates';
import RegisterTemplates from '@/components/documents/RegisterTemplates';

export default function BusinessDocumentsLibrary() {
  return <div className="space-y-4">
    <BusinessPlanTemplates />
    <PolicyTemplates />
    <RegisterTemplates />
  </div>;
}