import React from 'react';
import { Button } from '../ui/Button'; // 1. FIXED: Path is ../ui/Button
import { Modal } from '../ui/Modal';   // 2. FIXED: Import Modal, not WelcomeModal
import { FaVolumeUp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function WelcomeModal({ isOpen, onConfirm }) {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} hideCloseButton={true}>
      <div className="text-center text-neutral-100">
        <FaVolumeUp className="text-6xl text-primary mx-auto mb-6" />
        
        <h2 className="text-3xl font-display font-bold mb-4">
          {t('welcome.title')}
        </h2>
        
        <p className="text-lg text-neutral-300 mb-8">
          {t('welcome.message')}
        </p>

        <Button
          onClick={onConfirm}
          variant="primary"
          className="w-full text-xl"
        >
          {t('welcome.button')}
        </Button>
      </div>
    </Modal>
  );
}

export default WelcomeModal;