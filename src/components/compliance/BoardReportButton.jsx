import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateBoardReportPdf } from '@/lib/boardReportPdf';

// One-click monthly, board-ready compliance report with charts (PDF).
export default function BoardReportButton() {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => setBusy(false);
  }, []);

  const run = async () => {
    setBusy(true);
    try {
      await generateBoardReportPdf();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={run} disabled={busy}>
      <Download className="mr-2 h-4 w-4" />
      {busy ? 'Building report…' : 'Board report (PDF)'}
    </Button>
  );
}