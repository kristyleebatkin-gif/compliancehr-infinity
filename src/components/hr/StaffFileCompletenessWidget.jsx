import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import HrFileCompletenessRow from '@/components/hr/HrFileCompletenessRow';
import useHrFileCompleteness from '@/components/hr/useHrFileCompleteness';
import HrFileCompletenessSummary from '@/components/hr/HrFileCompletenessSummary';

// Staff file completeness widget: percentage of required employee documents
// on file for each staff member, so missing files surface quickly.
export default function StaffFileCompletenessWidget() {
  const [cursors, setCursors] = useState([null]);
  const cursor = cursors[cursors.length - 1];
  const { data, isLoading, isFetching, error, refetch } = useHrFileCompleteness(cursor);
  if (isLoading) return <Card><CardContent className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Calculating staff file completeness...</CardContent></Card>;
  return (
    <Card><CardContent className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="font-heading font-semibold">Staff file completeness</h2><p className="mt-1 text-xs text-muted-foreground">{data?.total ?? '—'} staff profiles. Registered documents, issued certificates, signed contracts and verified checklist entries are matched to the correct employee.</p></div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />Refresh</Button>
      </div>
      {!error && <HrFileCompletenessSummary summary={data?.summary} />}
      <p className="text-xs text-muted-foreground">On-file completeness does not certify document currency or legal compliance. Expiry and suitability must still be reviewed in the employee profile.</p>
      {!!data?.ambiguous_names?.length && <p className="text-xs text-warning">Name-only records for {data.ambiguous_names.join(', ')} are excluded because those names are shared by multiple employees. Link older records by employee ID to include them.</p>}
      {error ? <p role="alert" className="text-sm text-danger">Unable to calculate file completeness: {error.message}</p> : !data?.rows.length ? <p className="py-5 text-sm text-muted-foreground">No staff profiles on this page.</p> : <div className="space-y-4">{data.rows.map((row) => <HrFileCompletenessRow key={row.id} row={row} />)}</div>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button size="sm" variant="outline" disabled={cursors.length === 1 || isFetching} onClick={() => setCursors((previous) => previous.slice(0, -1))}>Previous</Button>
        <span className="text-xs text-muted-foreground">Page {cursors.length}</span>
        <Button size="sm" variant="outline" disabled={!data?.has_more || isFetching || !!error} onClick={() => setCursors((previous) => [...previous, data.next_cursor])}>Next</Button>
      </div>
    </CardContent></Card>
  );
}