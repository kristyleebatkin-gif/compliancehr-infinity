import React, { useEffect, useRef } from 'react';
import { Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CANVAS_HEIGHT = 150;

/**
 * Handwritten signature pad for online documents. Works with mouse, touch and
 * stylus, exports a compact JPEG data URL and restores a saved signature.
 */
export default function SignaturePad({ value = '', onChange, disabled = false }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const restored = useRef('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = Math.max(320, Math.min(560, canvas.offsetWidth || 480));
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e1e3a';
  }, []);

  // Restore a signature saved with a draft.
  useEffect(() => {
    if (!value || restored.current === value) return;
    restored.current = value;
    const canvas = canvasRef.current;
    const img = new window.Image();
    img.onload = () => canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = value;
  }, [value]);

  const point = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return [
      (event.clientX - rect.left) * canvas.width / rect.width,
      (event.clientY - rect.top) * canvas.height / rect.height,
    ];
  };

  const start = (event) => {
    if (disabled) return;
    event.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const [x, y] = point(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (event) => {
    if (!drawing.current) return;
    event.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const [x, y] = point(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const data = canvasRef.current.toDataURL('image/jpeg', 0.6);
    restored.current = data;
    onChange?.(data);
  };
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    restored.current = '';
    onChange?.('');
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border-2 border-primary/60 bg-white shadow-panel">
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: CANVAS_HEIGHT, touchAction: 'none', cursor: disabled ? 'default' : 'crosshair' }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Sign inside the box with your mouse, finger or stylus. It is recorded with the filed document.</p>
        <Button type="button" variant="outline" size="sm" onClick={clear} disabled={disabled}>
          <Eraser className="mr-2 h-4 w-4" /> Clear signature
        </Button>
      </div>
    </div>
  );
}