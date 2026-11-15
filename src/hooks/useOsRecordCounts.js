import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Reads one live count per register for the selected operating system.
// A register the signed-in user may not read returns null rather than a wrong number.
export default function useOsRecordCounts(registers = []) {
  const key = registers.map((item) => item.entity).join(',');
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!registers.length) {
      setCounts({});
      return () => { cancelled = true; };
    }
    setCounts(null);
    Promise.all(
      registers.map(async ({ entity }) => {
        try {
          const store = base44.entities[entity];
          if (!store?.count) return { entity, count: null };
          return { entity, count: await store.count({}) };
        } catch {
          return { entity, count: null };
        }
      })
    ).then((rows) => {
      if (!cancelled) setCounts(Object.fromEntries(rows.map((row) => [row.entity, row.count])));
    });
    return () => { cancelled = true; };
  }, [key]);

  return counts;
}