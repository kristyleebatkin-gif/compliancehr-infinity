import { useEffect } from 'react';

const PASTELS = [
  'rgba(0, 198, 255, 0.22)',
  'rgba(0, 114, 255, 0.18)',
  'rgba(10, 43, 109, 0.14)',
  'rgba(90, 0, 214, 0.18)',
  'rgba(161, 0, 255, 0.18)',
  'rgba(255, 46, 154, 0.18)',
  'rgba(255, 110, 219, 0.22)',
  'rgba(192, 132, 252, 0.26)',
];

// Gives every tab and section header inside the container its own pastel colour.
export default function useSubjectPastels(ref, loading) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const paint = () => {
      root.querySelectorAll('[data-dashboard-tab], .app-section-card-header').forEach((el, index) => {
        if (el.closest('.app-page-header')) return;
        const colour = PASTELS[index % PASTELS.length];
        if (el.style.getPropertyValue('--subject-pastel') !== colour) el.style.setProperty('--subject-pastel', colour);
      });
    };
    paint();
    const observer = new MutationObserver(paint);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ref, loading]);
}