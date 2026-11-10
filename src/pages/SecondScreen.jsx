import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Rostering from '@/pages/Rostering';
import InvoicingCentre from '@/pages/InvoicingCentre';
import QuoteCentre from '@/pages/QuoteCentre';
import SecondScreenBar from '@/components/shared/SecondScreenBar';
import { SECOND_SCREEN_VIEWS } from '@/lib/secondScreen';
import { useRole } from '@/lib/useRole';

const VIEWS = {
  roster: Rostering,
  invoicing: InvoicingCentre,
  quotes: QuoteCentre
};

export default function SecondScreen() {
  const [params, setParams] = useSearchParams();
  const { can } = useRole();
  const requested = params.get('module');
  const current = VIEWS[requested] ? requested : 'roster';
  const active = SECOND_SCREEN_VIEWS.find((view) => view.key === current);
  const View = VIEWS[current];

  return (
    <div className="min-h-screen bg-background pb-8">
      <SecondScreenBar current={current} onChange={(key) => setParams({ module: key }, { replace: true })} />
      {can(active.navKey) ? (
        <div className="pt-3">
          <View />
        </div>
      ) : (
        <div role="alert" className="m-4 rounded-lg border border-border bg-card p-4 text-sm font-semibold text-workspace-navy">
          Your role does not have access to {active.label}.
        </div>
      )}
    </div>
  );
}