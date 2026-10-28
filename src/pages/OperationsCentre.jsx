import React from 'react';
import ExecutiveOperationsCentre from '@/components/operations/ExecutiveOperationsCentre';

export default function OperationsCentre() {
  return (
    <div className="mx-auto w-full max-w-[1440px] bg-white px-4 py-4 sm:px-6 lg:px-8 space-y-4">
      <ExecutiveOperationsCentre defaultSuite="all" />
    </div>
  );
}