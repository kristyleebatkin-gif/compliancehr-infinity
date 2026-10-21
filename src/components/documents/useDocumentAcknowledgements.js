import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
export default function useDocumentAcknowledgements(entity, id, open) {
  const { user } = useRole();
  const client = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const key = ['document-acknowledgements', user?.id, entity, id];
  const query = useInfiniteQuery({ queryKey: key, enabled: open && !!id && !!user, initialPageParam: null,
    queryFn: async ({ pageParam }) => (await base44.functions.invoke('documentAcknowledgements', { action: 'list', entity, id, cursor: pageParam })).data,
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
  });
  const page = query.data?.pages[0];
  const save = useMutation({ mutationFn: async () => (await base44.functions.invoke('documentAcknowledgements', { action: 'acknowledge', entity, id, confirmed, version_key: page?.version_key })).data,
    onSuccess: async () => { setConfirmed(false); await client.invalidateQueries({ queryKey: key }); },
    onError: () => { setConfirmed(false); query.refetch(); },
  });
  const failure = save.error || query.error;
  return { query, save, page, confirmed, setConfirmed, records: query.data?.pages.flatMap((item) => item.items || []) || [], error: failure?.response?.data?.error || failure?.message };
}