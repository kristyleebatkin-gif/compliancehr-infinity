import React from 'react';

export default function SupportLineDetails({ line }) {
  return <div className="mt-1 space-y-0.5 text-xs">
    <div><strong>Support worker:</strong> {line.support_worker || '—'}</div>
    <div><strong>Date:</strong> {line.service_date || '—'}</div>
    <div><strong>Time:</strong> {[line.start_time, line.end_time].filter(Boolean).join(' – ') || '—'}</div>
  </div>;
}