import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Download, FileImage, Loader2, Sparkles, Trash2, Wand2 } from 'lucide-react';
import { TEMPLATES, PALETTES, LAYOUTS } from '@/components/today/studio/designTemplates';
import { downloadFile, formatWhen } from '@/components/today/studio/studioStore';
import { listStudioItems, createStudioItem, deleteStudioItem, itemWhen } from '@/components/today/studio/studioData';

const BLANK = {
  headline: 'Support that fits your life',
  subhead: 'NDIS and aged care services planned around your goals, delivered by a team that knows you.',
  footer: 'compliancehrinfinity.com',
  brand: 'ComplianceHR Infinity'
};

export default function DesignStudio() {
  const [templateId, setTemplateId] = useState('social');
  const [paletteId, setPaletteId] = useState('midnight');
  const [layout, setLayout] = useState('left');
  const [fields, setFields] = useState(BLANK);
  const [designs, setDesigns] = useState([]);
  const [designsReady, setDesignsReady] = useState(false);
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filed, setFiled] = useState('');
  const [scale, setScale] = useState(0.32);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  const template = TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0];
  const palette = PALETTES.find((item) => item.id === paletteId) || PALETTES[0];

  useEffect(() => {
    let cancelled = false;
    listStudioItems('design')
      .then((items) => {
        if (!cancelled) setDesigns(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Your saved designs could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setDesignsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const fit = () => {
      const width = stage.clientWidth - 24 || 320;
      setScale(Math.min(width / template.w, 520 / template.h));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [template.w, template.h]);

  const setField = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));

  const writeCopy = async () => {
    if (!brief.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('studioAi', { task: 'copy', brief, format: template.label });
      const data = res?.data || {};
      setFields((prev) => ({
        ...prev,
        headline: data.headline || prev.headline,
        subhead: data.subhead || prev.subhead,
        footer: data.footer || prev.footer
      }));
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Copy could not be written right now.');
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    setError('');
    try {
      const canvas = await html2canvas(canvasRef.current, { scale: 1, useCORS: true, backgroundColor: null });
      canvas.toBlob((blob) => {
        if (blob) {
          downloadFile(`${(fields.brand || 'design').replace(/\s+/g, '-').toLowerCase()}-${template.id}.png`, blob);
        }
      }, 'image/png');
    } catch {
      setError('The image could not be created on this device.');
    } finally {
      setBusy(false);
    }
  };

  const saveDesign = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const item = await createStudioItem('design', fields.headline || 'Design', {
        templateId,
        paletteId,
        layout,
        fields: { ...fields },
        savedAt: new Date().toISOString()
      });
      setDesigns((prev) => [item, ...prev]);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'That design could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const filePng = async () => {
    if (!canvasRef.current || busy) return;
    setBusy(true);
    setError('');
    setFiled('');
    try {
      const canvas = await html2canvas(canvasRef.current, { scale: 1, useCORS: true, backgroundColor: null });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('The image could not be created on this device.');
      const fileName = `${(fields.brand || 'design').replace(/\s+/g, '-').toLowerCase()}-${template.id}.png`;
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({
        file: new File([blob], fileName, { type: 'image/png' })
      });
      await createStudioItem(
        'filed_design',
        fields.headline || 'Design',
        { templateId, paletteId, layout, fields: { ...fields }, fileName, savedAt: new Date().toISOString() },
        { file_uri, file_name: fileName }
      );
      setFiled('Filed to Documents');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'That design could not be filed.');
    } finally {
      setBusy(false);
    }
  };

  const removeDesign = async (id) => {
    setDesigns((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteStudioItem(id);
    } catch (err) {
      setError(err?.message || 'That design could not be removed.');
    }
  };

  const align = layout === 'centre' ? 'center' : layout === 'left' ? 'left' : 'left';

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        <div className="design-stage" ref={stageRef}>
          <div style={{ width: template.w * scale, height: template.h * scale }}>
            <div
              ref={canvasRef}
              className="design-canvas"
              style={{
                width: template.w,
                height: template.h,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                background: palette.bg,
                color: palette.ink
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '7%', textAlign: align }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: layout === 'centre' ? 'center' : 'space-between',
                    gap: 18,
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: palette.soft
                  }}
                >
                  <span>{fields.brand}</span>
                  {layout === 'centre' ? null : <span>{template.label}</span>}
                </div>

                <div
                  style={
                    layout === 'band'
                      ? { background: palette.accent, color: palette.onAccent, padding: '5% 5%', borderRadius: 18 }
                      : undefined
                  }
                >
                  <h3 style={{ fontSize: template.headline, fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.03em', margin: 0 }}>
                    {fields.headline}
                  </h3>
                  <p style={{ marginTop: 20, fontSize: template.subhead, fontWeight: 600, lineHeight: 1.4, color: layout === 'band' ? palette.onAccent : palette.soft, opacity: layout === 'band' ? 0.85 : 1 }}>
                    {fields.subhead}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: layout === 'centre' ? 'center' : 'space-between',
                    gap: 16,
                    borderTop: `3px solid ${palette.accent}`,
                    paddingTop: 20,
                    fontSize: 22,
                    fontWeight: 700,
                    color: palette.ink
                  }}
                >
                  <span>{fields.footer}</span>
                  <span style={{ background: palette.accent, color: palette.onAccent, padding: '10px 24px', borderRadius: 999, fontSize: 20, fontWeight: 900 }}>
                    Get in touch
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={download} disabled={busy} className="t-btn t-btn-primary disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PNG
          </button>
          <button type="button" onClick={saveDesign} disabled={busy} className="t-btn t-btn-ghost disabled:opacity-50">Save to my designs</button>
          <button type="button" onClick={filePng} disabled={busy} className="t-btn t-btn-ghost disabled:opacity-50">
            <FileImage className="h-3.5 w-3.5" /> File PNG in Documents
          </button>
        </div>

        {filed ? (
          <p className="t-muted text-[11px] font-semibold">
            {filed} — <Link to="/documents" className="underline">open the Documents section</Link>
          </p>
        ) : null}

        {designs.length ? (
          <div className="space-y-1.5">
            <span className="studio-label mb-0">My designs ({designs.length})</span>
            <div className="flex max-h-[140px] flex-wrap items-center gap-1.5 overflow-y-auto">
              {designs.map((design) => (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => {
                    const saved = design.payload || {};
                    setTemplateId(saved.templateId || TEMPLATES[0].id);
                    setPaletteId(saved.paletteId || PALETTES[0].id);
                    setLayout(saved.layout || 'left');
                    setFields({ ...BLANK, ...(saved.fields || {}) });
                  }}
                  className="studio-chip flex items-center gap-1"
                  title={`Saved ${formatWhen(itemWhen(design))}`}
                >
                  {String(design.payload?.fields?.headline || design.title || 'Design').slice(0, 22)}
                  <Trash2
                    className="h-3 w-3 opacity-60"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeDesign(design.id);
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        ) : designsReady ? null : (
          <p className="t-muted text-[11px]">Loading your saved designs…</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="t-card space-y-2 p-3">
          <span className="studio-label">Template</span>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTemplateId(item.id)}
                className="studio-chip"
                style={item.id === templateId ? { borderColor: '#5a00d6', color: '#5a00d6' } : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>

          <span className="studio-label mt-2">Palette</span>
          <div className="flex flex-wrap gap-1.5">
            {PALETTES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPaletteId(item.id)}
                className="studio-chip"
                style={item.id === paletteId ? { borderColor: '#5a00d6', color: '#5a00d6' } : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>

          <span className="studio-label mt-2">Layout</span>
          <div className="flex flex-wrap gap-1.5">
            {LAYOUTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLayout(item.id)}
                className="studio-chip"
                style={item.id === layout ? { borderColor: '#5a00d6', color: '#5a00d6' } : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="t-card space-y-2 p-3">
          <div>
            <span className="studio-label">Headline</span>
            <input value={fields.headline} onChange={(event) => setField('headline', event.target.value)} className="studio-input" />
          </div>
          <div>
            <span className="studio-label">Supporting line</span>
            <textarea value={fields.subhead} onChange={(event) => setField('subhead', event.target.value)} className="studio-textarea" rows={3} />
          </div>
          <div>
            <span className="studio-label">Footer / contact</span>
            <input value={fields.footer} onChange={(event) => setField('footer', event.target.value)} className="studio-input" />
          </div>
        </div>

        <div className="t-card space-y-2 p-3">
          <span className="studio-label">Write it for me</span>
          <textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            rows={2}
            placeholder="e.g. Let families know we have two respite places opening in March"
            className="studio-textarea"
          />
          <button type="button" onClick={writeCopy} disabled={busy || !brief.trim()} className="t-btn t-btn-primary w-full disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Draft the copy
          </button>
          <p className="t-muted flex items-center gap-1 text-[10.5px]">
            <Sparkles className="h-3 w-3" /> Headline, line and contact text are filled from your brief.
          </p>
          {error ? <p className="text-[11px] font-semibold text-[#FF2E9A]">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}