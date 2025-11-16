// src/components/ui/Modal.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card'; // Import our new Card

/**
 * A reusable base modal component.
 * It uses the <Card> component for its styling.
 */
export function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950 bg-opacity-75 z-40"
      />

      {/* 2. Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          {/* We use our CardHeader and CardTitle for a consistent look */}
          <CardHeader>
            <CardTitle>{title || 'Confirm'}</CardTitle>
          </CardHeader>
          
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </>
  );
}