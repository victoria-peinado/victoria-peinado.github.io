// src/components/ui/Modal.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
// 1. Import framer-motion
import { motion, AnimatePresence } from 'framer-motion';
// 2. Import our new animation variant
import { modalPopIn } from '../../utils/animations';

export function Modal({ isOpen, onClose, children, title }) {
  return (
    // 3. Wrap in AnimatePresence to handle exit animations
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 4. Animate the backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950 bg-opacity-75 z-40"
          />

          {/* 5. Animate the modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal-content"
              variants={modalPopIn} // 6. Use our pop-in variant
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-lg"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{title || 'Confirm'}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  {children}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}