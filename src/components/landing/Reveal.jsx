import React from 'react';
import { motion } from 'framer-motion';

// Fades content in as it scrolls into view, with an optional stagger delay.
// Opacity only — so Tailwind hover transforms on the wrapped cards keep working.
export default function Reveal({ children, className, style, delay = 0, as = 'div', duration = 0.55 }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </Comp>
  );
}