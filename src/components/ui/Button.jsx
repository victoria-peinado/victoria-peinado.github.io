// src/components/ui/Button.jsx
import React from 'react';
import { useAudio } from '../../hooks/useAudio'; // 1. Import useAudio

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
  variant = 'primary', 
  className = '',
  disabled = false // 2. Add disabled prop
}) {
  const { playSound } = useAudio(); // 3. Get playSound from context

  const handleClick = (e) => {
    // 4. Create handleClick wrapper
    if (disabled) {
      return;
    }
    
    // Play the click sound
    playSound('click');
    
    // Call the original onClick prop if it exists
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick} // 5. Use the new wrapper
      disabled={disabled}   // 6. Pass disabled to the button
      // Base styles + dynamic variant styles + new disabled styles
      className={`
        w-full px-6 py-3 
        font-display font-bold text-lg 
        rounded-lg 
        shadow-md 
        transition-all duration-fast ease-in-out
        transform active:scale-95 
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-offset-neutral-900 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} 
        ${className}
      `}
    >
      {children}
    </button>
  );
}