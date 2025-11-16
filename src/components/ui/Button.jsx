// src/components/ui/Button.jsx
import React from 'react';

// Define our color variants
const variants = {
  // "Island" Blue for primary actions
  primary: 'bg-accent-blue hover:bg-blue-900 text-white',
  // "Mountain" Red for destructive actions
  danger: 'bg-secondary hover:bg-secondary-dark text-white',
  // "Swamp" Black for secondary/neutral actions
  neutral: 'bg-accent-black hover:bg-neutral-950 text-neutral-100 border border-neutral-700',
};

export function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', // 'primary' is the default
  className = '' 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      // Base styles + dynamic variant styles
      className={`
        w-full px-6 py-3 
        font-display font-bold text-lg 
        rounded-lg 
        shadow-md 
        transition-all duration-200 ease-in-out
        transform active:scale-95 
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-offset-neutral-900 
        ${variants[variant]} 
        ${className}
      `}
    >
      {children}
    </button>
  );
}