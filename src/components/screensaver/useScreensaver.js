import { useCallback, useEffect, useState } from 'react';
import { SCREENSAVER_DESIGNS, SCREENSAVER_WORKSPACES } from '@/components/screensaver/screensaverDesigns';

// Three minutes of stillness before a dashboard drifts into its screensaver.
const DEFAULT_IDLE_MS = 180000;

export default function useScreensaver({ workspace, idleMs = DEFAULT_IDLE_MS }) {
  const designs = SCREENSAVER_DESIGNS[workspace] || [];
  const meta = SCREENSAVER_WORKSPACES[workspace] || { label: '', storageKey: `cs-screensaver-${workspace}` };

  const [designId, setDesignId] = useState(() => {
    const stored = localStorage.getItem(meta.storageKey);
    return designs.some((design) => design.id === stored) ? stored : designs[0]?.id;
  });
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectDesign = useCallback(
    (id) => {
      if (!designs.some((design) => design.id === id)) return;
      setDesignId(id);
      localStorage.setItem(meta.storageKey, id);
    },
    [designs, meta.storageKey]
  );

  const closeScreensaver = useCallback(() => setOpen(false), []);

  const previewScreensaver = useCallback(() => {
    setSettingsOpen(false);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!idleMs || settingsOpen) return undefined;
    let timer;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setOpen(true), idleMs);
    };
    const reset = () => {
      if (!open) arm();
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    arm();
    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [idleMs, open, settingsOpen]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const design = designs.find((entry) => entry.id === designId) || designs[0] || null;

  return {
    designs,
    design,
    designId,
    selectDesign,
    roleLabel: meta.label,
    open,
    settingsOpen,
    setSettingsOpen,
    previewScreensaver,
    closeScreensaver
  };
}