import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { canAccessNav } from '@/lib/roleMatrix';
import { enterpriseScope, readRegisterCounts } from '@/lib/enterpriseReadModel';
import { OPERATING_SYSTEMS } from '@/lib/enterpriseOS';

export default function useOsRecordCounts(registers = []) {
  const { user } = useAuth();
  const scope = enterpriseScope(user);
  const key = JSON.stringify([scope?.key, registers.map(item => item.entity)]);
  const [state, setState] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const allowedEntities = new Set(OPERATING_SYSTEMS
      .filter(os => (['executive', 'reporting'].includes(os.id) ? canAccessNav(user?.role, 'analytics') : os.moduleKeys.some(moduleKey => canAccessNav(user?.role, moduleKey))))
      .flatMap(os => os.registers.map(item => item.entity)));
    readRegisterCounts({ entities: base44.entities, registers, user, allowedEntities })
      .then(counts => { if (!cancelled) setState({ key, counts }); });
    return () => { cancelled = true; };
  }, [key]);
  return state?.key === key ? state.counts : null;
}
