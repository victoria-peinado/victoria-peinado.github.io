// src/components/ui/Input.jsx
import React from 'react';

export function Input({ type = 'text', className = '', ...props }) {
  return (
    <input
      type={type}
      // Base styles for the input
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
        ${className}
      `}
      {...props}
    />
  );
}