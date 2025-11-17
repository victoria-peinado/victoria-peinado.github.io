// src/components/player/PlayerAnswerButton.jsx
import React from 'react';
import { useAudio } from '../../hooks/useAudio'; 

// --- THIS IS THE FIX ---
// 1. Remove the broken 'text-on-primary' class from the 'primary' variant.
const variants = {
  primary: 'bg-primary hover:bg-primary-dark', // Text color will be handled by the style prop
  neutral: 'bg-accent-black hover:bg-neutral-950 text-neutral-100 border border-neutral-700',
};
// --- END FIX ---

export function PlayerAnswerButton({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '',
  disabled = false
}) {
  const { playSound } = useAudio(); 

  // --- THIS IS THE FIX ---
  // Removed the extra '.' before the '=>'
  const handleClick = (e) => {
  // --- END FIX ---
    if (disabled) {
      return;
    }
    
    playSound('click');
    
    if (onClick) {
      onClick(e);
    }
  };

  // 2. Conditionally apply the text color using an inline style.
  // This will read the '--color-text-on-primary' variable set by PlayerPage.jsx
  const buttonStyle = variant === 'primary' 
    ? { color: 'var(--color-text-on-primary)' } 
    : {};

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      style={buttonStyle} // 3. Apply the style here
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