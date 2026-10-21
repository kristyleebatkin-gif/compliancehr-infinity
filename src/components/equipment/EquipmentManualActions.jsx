import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Download, History, Plus } from 'lucide-react';

export default function EquipmentManualActions({ targets, onAdd, onExport, onAccess, exportDisabled }) {
  const add = <Button onClick={onAdd}><Plus className="h-4 w-4" />Add manual</Button>;
  const exports = <><Button variant="outline" onClick={onExport} disabled={exportDisabled}><Download className="h-4 w-4" />Export register</Button><Button variant="outline" onClick={onAccess}><History className="h-4 w-4" />Access log</Button></>;
  return <>{targets?.manual ? createPortal(add, targets.manual) : add}{targets?.report ? createPortal(exports, targets.report) : exports}</>;
}