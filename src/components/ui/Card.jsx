// src/components/ui/Card.jsx
import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div
      // "Swamp" background, "Stone" border, rounded corners, and a shadow
      className={`
        bg-neutral-800 
        border-2 border-neutral-700 
        rounded-xl 
        shadow-lg 
        overflow-hidden 
        transition-all duration-med
        hover:border-primary-dark
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Optional: You can export parts of the Card for consistency
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`p-6 border-b border-neutral-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h2 className={`font-display text-2xl font-bold text-neutral-100 ${className}`}>
      {children}
    </h2>
  );
}