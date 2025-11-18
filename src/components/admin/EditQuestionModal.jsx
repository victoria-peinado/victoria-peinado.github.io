// src/components/admin/EditQuestionModal.jsx
import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import QuestionForm from './QuestionForm'; // Import our new form

export default function EditQuestionModal({
  isOpen,
  onClose,
  formState,
  onFormStateChange,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <QuestionForm
            title="Edit Question"
            formState={formState}
            onFormStateChange={onFormStateChange}
            onSubmit={onSubmit}
          />
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="w-full mt-4"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}