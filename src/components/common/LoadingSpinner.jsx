// src/components/common/LoadingSpinner.jsx
import React from 'react';

/**
 * A simple, reusable loading spinner.
 * Uses Tailwind CSS for animations.
 */
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-4">
      <div
        className="w-10 h-10 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin"
        role="status"
        aria-label="loading"
      ></div>
    </div>
  );
}