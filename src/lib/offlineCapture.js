import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { recordSafetyEvent } from '@/lib/safetyEvent';

// Offline-first capture queue: field safety records are stored locally when the
// device is offline and pushed to the database automatically when back online.
const STORAGE_KEY = 'chr_offline_capture_queue';

const readQueue = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
};

const writeQueue = (queue) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(queue)); } catch { /* storage full */ }
  window.dispatchEvent(new Event('offline-capture-updated'));
};

export function queueCapture(entity, record) {
  const queue = readQueue();
  queue.push({
    key: `cap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    entity,
    record,
    queued_at: new Date().toISOString(),
  });
  writeQueue(queue);
}

export function getQueue() { return readQueue(); }

export function queueCount() { return readQueue().length; }

export function removeQueued(key) {
  writeQueue(readQueue().filter((item) => item.key !== key));
}

export async function flushQueue() {
  const queue = readQueue();
  const remaining = [];
  let synced = 0;
  for (const item of queue) {
    try {
      const record = await base44.entities[item.entity].create(item.record);
      if (item.entity === 'TakeFive') {
        try { await recordSafetyEvent('TakeFive', record.id); } catch { /* alert is best-effort */ }
      }
      synced += 1;
    } catch {
      remaining.push(item);
    }
  }
  if (synced > 0) writeQueue(remaining);
  return { synced, remaining: remaining.length };
}

export function useOfflineCapture() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [queuedCount, setQueuedCount] = useState(queueCount());
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(() => setQueuedCount(queueCount()), []);

  const sync = useCallback(async () => {
    if (!navigator.onLine || syncing || queueCount() === 0) return { synced: 0, remaining: queueCount() };
    setSyncing(true);
    try {
      return await flushQueue();
    } finally {
      setSyncing(false);
      refresh();
    }
  }, [syncing, refresh]);

  useEffect(() => {
    const goOnline = () => { setOnline(true); sync(); };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('offline-capture-updated', refresh);
    if (navigator.onLine) sync();
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('offline-capture-updated', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(async (entity, record) => {
    if (navigator.onLine) {
      const created = await base44.entities[entity].create(record);
      if (entity === 'TakeFive') {
        try { await recordSafetyEvent('TakeFive', created.id); } catch { /* best-effort */ }
      }
      return { stored: 'online', id: created.id };
    }
    queueCapture(entity, record);
    return { stored: 'offline' };
  }, []);

  return { online, queuedCount, syncing, sync, save, refresh };
}