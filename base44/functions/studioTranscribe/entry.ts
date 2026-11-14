import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { authorizeAndLogAiAction } from '../../shared/aiGovernance.ts';
import { ALL_ROLES } from '../../shared/roleMatrix.ts';

// Transcribes a private meeting recording for the Today workbench.
// The stored file stays private: a short-lived signed URL is sent to the
// transcription service and only the transcript comes back.

export default perBusiness(async function (req: Request): Promise<Response> {
  try {
    const base44 = createScopedClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const fileUri = String(body.file_uri || '').trim();

    if (!fileUri || fileUri.length > 600) {
      return Response.json({ error: 'A meeting recording is required.' }, { status: 400 });
    }

    const gate = await authorizeAndLogAiAction(base44, {
      feature: 'studioTranscribe',
      allowedRoles: ALL_ROLES,
      recordTitle: 'Meeting recording transcription',
    });
    if (!gate.authorized) return gate.response;

    const { signed_url: signedUrl } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: fileUri,
      expires_in: 900,
    });

    const transcript = await base44.asServiceRole.integrations.Core.TranscribeAudio({ audio_url: signedUrl });

    await gate.logSuccess('Meeting recording transcribed');
    return Response.json({ transcript: String(transcript || '').slice(0, 60000) });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'That recording could not be transcribed.' }, { status: 500 });
  }
});