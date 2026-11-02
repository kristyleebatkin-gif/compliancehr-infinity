import React from 'react';

// Renders children visibly right away so no landing page section or card is ever hidden by scroll-observer opacity.
export default function Reveal({ children, className = undefined, style, as: Tag = 'div' }) {
  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}