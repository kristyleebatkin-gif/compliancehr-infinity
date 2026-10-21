import { useEffect } from 'react';

const PASTELS = ['#e9d5ff', '#bae6fd', '#bbf7d0', '#fed7aa', '#fbcfe8', '#fef08a', '#c7d2fe', '#a7f3d0', '#fecaca', '#fde68a', '#99f6e4', '#ddd6fe', '#bfdbfe', '#d9f99d', '#fbb6ce', '#fcd5b5'];

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