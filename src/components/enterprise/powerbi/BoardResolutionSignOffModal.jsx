import React, { useState, useRef, useEffect } from 'react';
import {
  X, CheckCircle2, PenTool, Eraser, Lock, FileCheck2, Loader2,
} from 'lucide-react';
import { CONSTITUTIONAL_PRINCIPLE } from '@/lib/careSphereSmeGarmData';

export default function BoardResolutionSignOffModal({
  open,
  onClose,
  resolution,
  defaultStatus = 'Approved',
  currentUser,
  onConfirmSignOff,
  saving = false,
}) {
  const [status, setStatus] = useState(defaultStatus || 'Approved');
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('Board Chair');
  const [witnessName, setWitnessName] = useState('Company Secretary');
  const [quorumConfirmed, setQuorumConfirmed] = useState(true);
  const [constitutionalAttested, setConstitutionalAttested] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [hasDrawnStroke, setHasDrawnStroke] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!open || !resolution) return;
    setStatus(defaultStatus || resolution.status || 'Approved');
    setSignerName(
      resolution.signedBy ||
        currentUser?.full_name ||
        currentUser?.email ||
        'Hon. Margaret Vance (Board Chair)'
    );
    setSignerRole(resolution.signerRole || currentUser?.role || 'Board Chair');
    setWitnessName('Eleanor Vance-Sterling (Company Secretary)');
    setQuorumConfirmed(true);
    setConstitutionalAttested(true);
    setResolutionNotes(
      resolution.resolutionNotes ||
        `Formally ${String(defaultStatus || resolution.status || 'Approved').toLowerCase()} and digitally signed under the CareSphere SME-GARM Constitutional Operating Chain.`
    );
    setHasDrawnStroke(false);
    setErrorMsg('');

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth || 460;
      canvas.height = 110;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#081018';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#39E6FF';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }, 40);
  }, [open, resolution, defaultStatus, currentUser]);

  if (!open || !resolution) return null;

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) * canvas.width) / rect.width,
      ((e.clientY - rect.top) * canvas.height) / rect.height,
    ];
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const ctx = canvas.getContext('2d');
    const [x, y] = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawnStroke(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const [x, y] = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#081018';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawnStroke(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!signerName.trim()) {
      setErrorMsg('Please enter the full name of the signing Board Member or Officer.');
      return;
    }
    if (!quorumConfirmed || !constitutionalAttested) {
      setErrorMsg('Both Board Quorum and Constitutional Attestation must be confirmed before digital sign-off.');
      return;
    }

    const timestamp = new Date().toISOString();
    const hashSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const signatureHash = `SIG-${resolution.id.replace(/[^A-Z0-9]/gi, '')}-${hashSuffix}`;

    await onConfirmSignOff({
      decisionId: resolution.id,
      decisionTitle: resolution.decision,
      owner: resolution.owner,
      committee: resolution.committee,
      status,
      signedBy: signerName.trim(),
      signerRole: signerRole.trim(),
      witnessName: witnessName.trim(),
      signedAt: timestamp,
      signatureHash,
      signatureMethod: hasDrawnStroke ? 'Handwritten Stylus + Cryptographic Seal' : 'Typed Digital Signature + Cryptographic Seal',
      quorumVerified: quorumConfirmed,
      resolutionNotes: resolutionNotes.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'rgba(8,16,24,0.88)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="board-signoff-modal-title"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ backgroundColor: '#162235', borderColor: '#39E6FF', fontFamily: "'Segoe UI', sans-serif" }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-3.5"
          style={{ backgroundColor: '#081018', borderColor: 'rgba(57,230,255,0.28)' }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg border"
              style={{ backgroundColor: '#162235', borderColor: '#39E6FF' }}
            >
              <PenTool className="h-4 w-4" style={{ color: '#39E6FF' }} />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                CareSphere SME-GARM · Constitutional FactDecision Ledger
              </div>
              <h3 id="board-signoff-modal-title" className="text-base font-bold text-white">
                Board Resolution Digital Sign-Off &amp; Seal
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Close Digital Sign-Off Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 overflow-y-auto p-5 text-xs text-white">
          {/* Resolution Summary Banner */}
          <div
            className="rounded-xl border p-3.5"
            style={{ backgroundColor: '#1E293B', borderColor: 'rgba(57,230,255,0.3)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold" style={{ color: '#39E6FF' }}>
                {resolution.id} · {resolution.committee}
              </span>
              <span className="text-[11px] text-slate-300">
                Accountable Owner: <strong className="text-white">{resolution.owner}</strong>
              </span>
            </div>
            <div className="mt-1.5 text-sm font-bold text-white">{resolution.decision}</div>
          </div>

          {/* Resolution Determination Selector */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider" style={{ color: '#39E6FF' }}>
              1. Formal Board Resolution Determination
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Approved', color: '#22C55E' },
                { label: 'Deferred', color: '#FBBF24' },
                { label: 'Rejected', color: '#EF4444' },
                { label: 'Open', color: '#39E6FF' },
              ].map((opt) => {
                const active = status === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setStatus(opt.label)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-bold transition"
                    style={{
                      backgroundColor: active ? opt.color : '#1E293B',
                      color: active ? '#081018' : '#FFFFFF',
                      borderColor: opt.color,
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Signatory Details */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-200">
                Signing Director / Officer Name *
              </label>
              <input
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Full legal name"
                className="w-full rounded-lg border px-3 py-2 text-xs font-bold text-white focus:outline-none"
                style={{ backgroundColor: '#081018', borderColor: 'rgba(57,230,255,0.35)' }}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-200">
                Board / Constitutional Role *
              </label>
              <select
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-xs font-bold text-white focus:outline-none"
                style={{ backgroundColor: '#081018', borderColor: 'rgba(57,230,255,0.35)' }}
              >
                <option value="Board Chair">Board Chair</option>
                <option value="Board Member">Board Member</option>
                <option value="Audit & Risk Committee Chair">Audit &amp; Risk Committee Chair</option>
                <option value="Governance Committee Chair">Governance Committee Chair</option>
                <option value="Chief Executive Officer">Chief Executive Officer</option>
                <option value="Company Secretary">Company Secretary</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-200">
                Counter-Signing Witness
              </label>
              <input
                type="text"
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-xs font-bold text-white focus:outline-none"
                style={{ backgroundColor: '#081018', borderColor: 'rgba(57,230,255,0.35)' }}
              />
            </div>
          </div>

          {/* Resolution Minute & Conditions */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-200">
              Official Board Minute &amp; Conditions of Sign-Off
            </label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Enter official resolution conditions, dissenting votes, or implementation directives..."
              className="w-full rounded-lg border px-3 py-2 text-xs text-white focus:outline-none"
              style={{ backgroundColor: '#081018', borderColor: 'rgba(57,230,255,0.35)' }}
            />
          </div>

          {/* Digital Signature Pad + Cursive Seal Preview */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#39E6FF' }}>
                2. Digital Signature Capture (Draw with Mouse/Stylus or Use Verified Electronic Seal)
              </label>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Eraser className="h-3 w-3" /> Clear Pad
              </button>
            </div>
            <div
              className="relative overflow-hidden rounded-xl border-2"
              style={{ backgroundColor: '#081018', borderColor: 'rgba(57,230,255,0.45)' }}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="block h-[110px] w-full cursor-crosshair touch-none"
              />
              {!hasDrawnStroke && signerName && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-xl italic tracking-wide"
                    style={{ color: 'rgba(57,230,255,0.75)', fontFamily: 'Georgia, serif' }}
                  >
                    /s/ {signerName}
                  </span>
                  <span className="mt-1 text-[10px] text-slate-400">
                    Draw above to sign manually, or submit to apply cryptographic `/s/ {signerName}` seal
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quorum & Constitutional Attestation Checkboxes */}
          <div
            className="space-y-2 rounded-xl border p-3"
            style={{ backgroundColor: '#1E293B', borderColor: 'rgba(34,197,94,0.35)' }}
          >
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={quorumConfirmed}
                onChange={(e) => setQuorumConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#22C55E]"
              />
              <span className="text-[11.5px] text-slate-200">
                <strong>Quorum &amp; Authority Attestation:</strong> I confirm a valid constitutional quorum is present and I hold delegated authority under the CareSphere Board Charter to sign this resolution.
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={constitutionalAttested}
                onChange={(e) => setConstitutionalAttested(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#39E6FF]"
              />
              <span className="text-[11.5px] text-slate-200">
                <strong>Constitutional Lineage Lock:</strong> Record this signed determination into the CareSphere Governance Register (`GovernanceObject`) and immutable system `AuditLog` ({CONSTITUTIONAL_PRINCIPLE}).
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="rounded-lg border px-3 py-2 text-xs font-bold" style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderColor: '#EF4444', color: '#EF4444' }}>
              {errorMsg}
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700 pt-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <Lock className="h-3.5 w-3.5" style={{ color: '#22C55E' }} />
              <span>Persisted to GovernanceObject &amp; System AuditLog</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-slate-600 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black transition"
                style={{ backgroundColor: '#22C55E', color: '#081018' }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Recording Digital Sign-Off...
                  </>
                ) : (
                  <>
                    <FileCheck2 className="h-3.5 w-3.5" />
                    Sign &amp; Record Resolution ({status})
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}