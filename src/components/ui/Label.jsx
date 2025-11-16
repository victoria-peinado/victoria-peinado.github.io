// src/components/ui/Label.jsx
import React from 'react';

export function Label({ htmlFor, children, className = '' }) {
  return (
    <label
      htmlFor={htmlFor}
      // We use our "Parchment" text color and make it bold
      className={`block text-neutral-100 font-bold mb-2 ${className}`}
    >
      {children}
    </label>
  );
}