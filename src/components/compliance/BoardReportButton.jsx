import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ClipboardCheck } from 'lucide-react';
import { generateBoardReportPdf } from '@/lib/boardReportPdf';

// One-click monthly, board-ready compliance report with charts (PDF).
export default function BoardReportButton({ checklist = false }) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => setBusy(false);
  }, []);

  const run = async () => {
    setBusy(true);
    try {
      await generateBoardReportPdf({ checklist });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={run} disabled={busy}>
      {checklist ? <ClipboardCheck className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
      {busy ? 'Building…' : checklist ? 'Compliance Audit Checklist' : 'Compliance Audit Report'}
    </Button>
  );
}