import React from 'react';
import { Check, Monitor } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import ScreensaverArt from '@/components/screensaver/ScreensaverArt';
import '@/components/screensaver/screensaver.css';

export default function ScreensaverSettingsDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  designs = [],
  activeId,
  onSelect,
  onPreview
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-base font-extrabold text-[#0A2B6D]">
            <Monitor className="h-4 w-4" /> Screensaver
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-[#274675]">
            {subtitle || `Choose the screensaver for ${title}. It appears when this dashboard is left idle, and it is saved for you on this device.`}
          </DialogDescription>
        </DialogHeader>

        <div className="sa-tile-grid">
          {designs.map((design) => {
            const active = design.id === activeId;
            return (
              <button
                key={design.id}
                type="button"
                onClick={() => onSelect(design.id)}
                data-active={active}
                aria-pressed={active}
                className="sa-tile"
              >
                <div className="sa-tile-art">
                  <ScreensaverArt design={design} />
                </div>
                <div className="sa-tile-body">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-extrabold text-[#0A2B6D]">{design.name}</p>
                    <p className="truncate text-[10.5px] font-semibold text-[#274675]">{design.blurb}</p>
                  </div>
                  {active && (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#5A00D6] text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10.5px] font-semibold text-[#274675]">
            Saved automatically for your profile on this device.
          </p>
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
          >
            <Monitor className="h-3.5 w-3.5" /> Preview full screen
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}