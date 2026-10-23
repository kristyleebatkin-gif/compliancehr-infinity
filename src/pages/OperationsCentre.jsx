import React from 'react';
import ExecutiveOperationsCentre from '@/components/operations/ExecutiveOperationsCentre';

export default function OperationsCentre() {
  return (
    <div className="mx-auto max-w-6xl p-2 sm:p-3 space-y-2 bg-white">
      <ExecutiveOperationsCentre defaultSuite="all" />
    </div>
  );
}