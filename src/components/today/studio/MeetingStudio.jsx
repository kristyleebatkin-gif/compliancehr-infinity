import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, Square, Loader2, Sparkles, Save, Trash2, Upload, ListChecks } from 'lucide-react';
import { formatWhen, downloadFile } from '@/components/today/studio/studioStore';
import { listStudioItems, createStudioItem, deleteStudioItem, itemWhen } from '@/components/today/studio/studioData';

const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

const toMeeting = (item) => ({
  id: item.id,
  title: item.title || 'Untitled meeting',
  when: itemWhen(item),
  duration: item.payload?.duration || 0,
  transcript: item.payload?.transcript || '',
  summary: item.payload?.summary || null
});

export default function MeetingStudio() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState(null);
  const [recordingUri, setRecordingUri] = useState('');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    listStudioItems('meeting')
      .then((items) => {
        if (!cancelled) setMeetings(items.map(toMeeting));
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Your saved meetings could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const transcribe = async (blob, name) => {
    setBusy('transcribe');
    setError('');
    try {
      const file = new File([blob], name, { type: blob.type || 'audio/webm' });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setRecordingUri(file_uri);
      const res = await base44.functions.invoke('studioTranscribe', { file_uri });
      setTranscript(res?.data?.transcript || '');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'That recording could not be transcribed.');
    } finally {
      setBusy('');
    }
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        transcribe(blob, `meeting-${Date.now()}.webm`);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000);
    } catch {
      setError('Microphone access was not granted. You can upload a recording or paste a transcript instead.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    recorderRef.current?.stop();
  };

  const summarise = async () => {
    if (busy) return;
    setBusy('summary');
    setError('');
    try {
      const res = await base44.functions.invoke('studioAi', { task: 'meeting', transcript });
      setSummary(res?.data || null);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'The summary could not be created.');
    } finally {
      setBusy('');
    }
  };

  const save = async () => {
    if (busy === 'save') return;
    setBusy('save');
    setError('');
    try {
      const item = await createStudioItem('meeting', title.trim() || 'Untitled meeting', {
        duration: elapsed,
        transcript,
        summary,
        recordingUri,
        savedAt: new Date().toISOString()
      });
      setMeetings((prev) => [toMeeting(item), ...prev]);
      setTitle('');
      setTranscript('');
      setSummary(null);
      setRecordingUri('');
      setElapsed(0);
    } catch (err) {
      setError(err?.message || 'That meeting could not be saved.');
    } finally {
      setBusy('');
    }
  };

  const removeMeeting = async (id) => {
    setMeetings((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteStudioItem(id);
    } catch (err) {
      setError(err?.message || 'That meeting could not be removed.');
    }
  };

  return (
    <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-3">
        <div className="t-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            {recording ? (
              <button type="button" onClick={stopRecording} className="t-btn t-btn-primary">
                <Square className="h-4 w-4" /> Stop &amp; transcribe
              </button>
            ) : (
              <button type="button" onClick={startRecording} disabled={busy === 'transcribe'} className="t-btn t-btn-primary disabled:opacity-50">
                <Mic className="h-4 w-4" /> Record meeting
              </button>
            )}
            <span className="t-pill t-pill-pink flex items-center gap-1.5">
              {recording ? <span className="rec-pulse h-2 w-2 rounded-full bg-[#ff2e9a]" /> : null}
              {clock(elapsed)}
            </span>
            <label className="t-btn t-btn-ghost cursor-pointer">
              <Upload className="h-3.5 w-3.5" /> Upload recording
              <input
                type="file"
                accept="audio/*,video/mp4"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) transcribe(file, file.name);
                  event.target.value = '';
                }}
              />
            </label>
            {busy === 'transcribe' ? (
              <span className="t-muted flex items-center gap-1.5 text-[11.5px] font-semibold">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Transcribing privately…
              </span>
            ) : null}
          </div>
          <p className="t-muted mt-2 text-[10.5px] leading-relaxed">
            Recording stays private — it is stored privately with the meeting, and only a short-lived link is used for transcription.
          </p>
        </div>

        <div className="t-card space-y-1.5 p-3">
          <span className="studio-label">Meeting title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Monday team huddle" className="studio-input" />
          <span className="studio-label mt-2">Transcript</span>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={9}
            placeholder="Record, upload, or paste the transcript here…"
            className="studio-textarea min-h-[180px]"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={summarise} disabled={busy !== '' || transcript.trim().length < 40} className="t-btn t-btn-primary disabled:opacity-50">
              {busy === 'summary' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Summarise &amp; find actions
            </button>
            <button type="button" onClick={save} disabled={!transcript.trim() && !summary} className="t-btn t-btn-ghost disabled:opacity-50">
              <Save className="h-3.5 w-3.5" /> Save meeting
            </button>
          </div>
        </div>

        {summary ? (
          <div className="t-card space-y-2 p-3">
            <div>
              <span className="studio-label">Summary</span>
              <p className="t-title text-[12.5px] leading-relaxed">{summary.summary}</p>
            </div>
            {summary.decisions ? (
              <div>
                <span className="studio-label">Decisions</span>
                <p className="t-muted whitespace-pre-wrap text-[12px] leading-relaxed">{summary.decisions}</p>
              </div>
            ) : null}
            {(summary.actions || []).length ? (
              <div>
                <span className="studio-label flex items-center gap-1"><ListChecks className="h-3 w-3" /> Action items</span>
                <ul className="space-y-1">
                  {summary.actions.map((action, index) => (
                    <li key={index} className="t-row px-2 py-1.5 text-[12px] leading-relaxed">
                      <span className="t-title font-semibold">{action.action}</span>
                      <span className="t-muted">
                        {action.owner ? ` · ${action.owner}` : ''}
                        {action.due ? ` · ${action.due}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="text-[11px] font-semibold text-[#FF2E9A]">{error}</p> : null}
      </div>

      <div className="t-card p-3">
        <p className="t-title text-[13px] font-extrabold">Past meetings</p>
        {loading ? (
          <p className="t-muted mt-2 flex items-center gap-1.5 text-[11.5px]">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading your meetings…
          </p>
        ) : meetings.length === 0 ? (
          <p className="t-muted mt-2 text-[11.5px]">Saved meetings appear here with their summary and actions.</p>
        ) : (
          <div className="mt-1.5 max-h-[430px] space-y-1 overflow-y-auto">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="t-row px-2 py-1.5">
                <div className="flex items-start gap-2">
                  <button type="button" onClick={() => setOpenId(openId === meeting.id ? null : meeting.id)} className="min-w-0 flex-1 text-left">
                    <span className="t-title block truncate text-[12px] font-bold">{meeting.title}</span>
                    <span className="t-muted block text-[10px]">{formatWhen(meeting.when)} · {clock(meeting.duration || 0)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile(`${meeting.title.replace(/[^\w\- ]+/g, '').trim() || 'meeting'}.txt`, `${meeting.title}\n${formatWhen(meeting.when)}\n\nSUMMARY\n${meeting.summary?.summary || ''}\n\nTRANSCRIPT\n${meeting.transcript || ''}`)}
                    aria-label={`Download ${meeting.title}`}
                    className="t-muted shrink-0 hover:text-[#5a00d6]"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMeeting(meeting.id)}
                    aria-label={`Delete ${meeting.title}`}
                    className="t-muted shrink-0 hover:text-[#FF2E9A]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {openId === meeting.id ? (
                  <div className="mt-1.5 space-y-1 border-l-2 border-[#5a00d6]/40 pl-2">
                    <p className="t-title text-[11.5px] leading-relaxed">{meeting.summary?.summary || 'No summary saved.'}</p>
                    {(meeting.summary?.actions || []).map((action, index) => (
                      <p key={index} className="t-muted text-[11px]">• {action.action}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}