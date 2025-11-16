// src/components/ui/Select.jsx
import React from 'react';

export function Select({ children, className = '', ...props }) {
  return (
    <select
      // Base styles for the select (matches Input.jsx)
      className={`
        w-full px-4 py-3 
        bg-accent-black 
        text-neutral-100 
        border-2 border-neutral-700 
        rounded-lg 
        focus:outline-none 
        focus:ring-2 focus:ring-primary 
        focus:border-primary 
        transition-colors duration-fast
        appearance-none // Removes default OS styling
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}