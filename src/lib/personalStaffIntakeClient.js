import { base44 } from '@/api/base44Client';

export default function personalStaffIntakeClient(profile) {
  let snapshot;
  const invoke = async (action, payload = {}) => {
    const { data } = await base44.functions.invoke('myStaffIntakeDocuments', { action, profile_id: profile.id, ...payload });
    if (data.error) throw new Error(data.error);
    return data;
  };
  return {
    cases: {
      filter: async () => {
        snapshot = await invoke('load');
        return { items: [snapshot.intakeCase] };
      },
      update: async (_id, updates) => invoke('update', { updates }),
    },
    documents: {
      filter: async () => ({ items: snapshot?.documents || [] }),
      create: async (document) => (await invoke('attach', { document })).document,
      delete: async (id) => invoke('remove', { document_id: id }),
    },
  };
}