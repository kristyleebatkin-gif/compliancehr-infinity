import { base44 } from '@/api/base44Client';
const call = async (action, values, id) => (await base44.functions.invoke('employeePersonalRecords', { action, values, id })).data;
export default {
  completion: { create: async (values) => (await call('trainingCompletion', values)).record },
  certificate: { create: async (values) => (await call('trainingCertificate', values)).record },
  attach: (id, file_uri) => call('certificateFile', { file_uri }, id),
};