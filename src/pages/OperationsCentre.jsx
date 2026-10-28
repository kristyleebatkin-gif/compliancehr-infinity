import React from 'react';
import PageHeader from '@/components/PageHeader';
import ExecutiveOperationsCentre from '@/components/operations/ExecutiveOperationsCentre';
import FiveLayerEnterpriseAcceptanceSuite from '@/components/compliance/FiveLayerEnterpriseAcceptanceSuite';

export default function OperationsCentre() {
  return (
    <div className="mx-auto w-full max-w-[1440px] bg-white px-4 py-4 sm:px-6 lg:px-8 space-y-4">
      <PageHeader
        title="Executive Operations & Control Centre"
        description="Unified whole-of-enterprise command across NDIS Practice Standards, Aged Care Quality Standards, SIRS, ISO 31000 Risk, Workforce & Document Control."
      />
      <FiveLayerEnterpriseAcceptanceSuite />
      <ExecutiveOperationsCentre defaultSuite="all" />
    </div>
  );
}