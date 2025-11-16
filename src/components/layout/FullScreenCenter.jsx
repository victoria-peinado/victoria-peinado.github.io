// src/components/layout/FullScreenCenter.jsx
import React from 'react';

export default function FullScreenCenter({ children }) {
  return (
    // Uses flexbox to center its child in the middle of the screen
    <div className="min-h-screen flex items-center justify-center 
                    bg-neutral-900 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}