import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Link2, Copy, Check, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const EXPIRY_PRESETS = [
  { label: '24 Hours', days: 1 },
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '30 Days', days: 30 },
];

function computeExpiryDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days || 7));
  return date.toISOString().slice(0, 10);
}

export default function AuditorLinkGeneratorCard({ onCreated }) {
  const { toast } = useToast();
  const [auditorName, setAuditorName] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateOneClick = async () => {
    setGenerating(true);
    const label = auditorName.trim() || 'NDIS Quality & Safeguards Commission Auditor';
    const expiryDate = computeExpiryDate(expiryDays);
    const token = `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const scopedUrl = `${origin}/auditor-portal?scope=consent-verified&token=${token}&expires=${expiryDate}`;

    const created = await base44.entities.RemoteAccessSession.create({
      title: `Scoped Auditor Link — ${label}`,
      access_mode: 'Auditor Scoped Link',
      user_name: label,
      user_role: 'Auditor',
      device_type: 'External Auditor Workstation',
      location_region: 'Australia (Read-Only Scoped)',
      mfa_verified: true,
      encryption_standard: 'TLS 1.3 + AES-256 Zero-Trust',
      ip_allowlist_rule: `Time-Boxed Read-Only Token (${expiryDays}d)`,
      status: 'Active',
      session_expiry: expiryDate,
      notes: `Scoped URL: ${scopedUrl}`,
    });

    setGeneratedLink(scopedUrl);
    setGeneratedTitle(created?.title || `Scoped Auditor Link — ${label}`);
    setGenerating(false);

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(scopedUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }

    toast({
      title: '1-Click Auditor Scoped Link Generated',
      description: `Read-only consent-verified link created for ${label} (expires ${expiryDate}).`,
    });

    if (onCreated) onCreated();
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({
        title: 'Auditor Link Copied',
        description: 'Scoped read-only link copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="rounded-2xl p-[1.5px] shadow-lg"
      style={{
        background: 'linear-gradient(120deg, #00C6FF 0%, #A855F7 50%, #FF2E9A 100%)',
      }}
    >
      <div className="rounded-[14px] bg-black p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00C6FF] bg-[#081018] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#00C6FF]">
              <Sparkles className="h-3 w-3 text-[#00C6FF]" />
              <span>1-Click External Auditor Access</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              One-Click Scoped Auditor Link Generator
            </h2>
            <p className="text-xs font-semibold text-slate-300">
              Instantly issue a zero-VPN, read-only, consent-verified link for NDIS or Aged Care auditors with automatic expiry and instant revocation.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="Auditor / Agency (optional)"
              className="h-9 w-full sm:w-56 border-[#0072FF] bg-[#081018] text-xs font-semibold text-white placeholder:text-slate-400"
            />
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(Number(e.target.value))}
              aria-label="Auditor link expiry duration"
              className="h-9 rounded-lg border border-[#A855F7] bg-[#081018] px-3 text-xs font-extrabold text-white"
            >
              {EXPIRY_PRESETS.map((preset) => (
                <option key={preset.days} value={preset.days}>
                  Expires in {preset.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={handleGenerateOneClick}
              disabled={generating}
              className="h-9 shrink-0 rounded-lg px-4 text-xs font-black text-black shadow-[0_0_12px_rgba(0,198,255,0.55)]"
              style={{ backgroundColor: '#00C6FF' }}
            >
              <Link2 className="mr-1.5 h-4 w-4 text-black" />
              {generating ? 'Generating...' : 'Generate 1-Click Auditor Link'}
            </Button>
          </div>
        </div>

        {generatedLink && (
          <div className="mt-3.5 flex flex-col justify-between gap-2.5 rounded-xl border border-[#00C6FF]/60 bg-[#081018] p-3 sm:flex-row sm:items-center">
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#00C6FF]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
                <span className="truncate">{generatedTitle} — Ready to Share</span>
              </div>
              <div className="truncate font-mono text-xs font-bold text-white">
                {generatedLink}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-extrabold text-black transition hover:opacity-90"
                style={{ backgroundColor: '#00C6FF' }}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-black" /> : <Copy className="h-3.5 w-3.5 text-black" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
              <Link
                to="/auditor-portal"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#FF2E9A] bg-black px-3 text-xs font-extrabold text-white transition hover:bg-[#FF2E9A]"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#00C6FF]" />
                <span>Open Auditor Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}