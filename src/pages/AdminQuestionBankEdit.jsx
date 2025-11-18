// src/pages/AdminQuestionBankEdit.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuestionBankEditor } from '../hooks/useQuestionBankEditor';

// --- Import our new dumb components ---
import CsvUploader from '../components/admin/CsvUploader';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingScreen from '../components/common/LoadingScreen';
import QuestionForm from '../components/admin/QuestionForm';
import QuestionList from '../components/admin/QuestionList';
import EditQuestionModal from '../components/admin/EditQuestionModal';

// --- Import UI Kit components ---
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function AdminQuestionBankEdit() {
  const { t } = useTranslation();
  
  // One hook call gets all logic
  const {
    bankId,
    bank,
    questions,
    loading,
    message,
    // Add form
    addFormState,
    setAddFormState,
    handleAddQuestion,
    // Edit modal
    isEditModalOpen,
    editFormState,
    setEditFormState,
    openEditModal,
    closeEditModal,
    handleUpdateQuestion,
    // Delete modal
    isDeleteModalOpen,
    questionToDelete,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm,
    // CSV
    handleUploadSuccess
  } = useQuestionBankEditor();

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!bank) {
    // ... (Error handling unchanged) ...
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-secondary mb-4">Error</h1>
        <p className="text-neutral-300 mb-6">{message.text || 'Could not load question bank.'}</p>
        <Link to="/admin/question-banks">
          <Button variant="secondary">← Back to All Banks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header (Unchanged) */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold">
            Edit: {bank.name}
          </h1>
          <p className="text-neutral-300 mt-2">
            Total Questions: {questions.length}
          </p>
        </div>
        <Link to="/admin/question-banks">
          <Button variant="secondary">← Back to All Banks</Button>
        </Link>
      </div>

      {/* Message (Unchanged) */}
      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-secondary' : 'bg-primary-dark text-white'}`}>
          {message.text}
        </div>
      )}

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Add Question Form (Now a component) */}
        <QuestionForm
          title="Add New Question"
          formState={addFormState}
          onFormStateChange={setAddFormState}
          onSubmit={handleAddQuestion}
        />

        {/* Upload CSV (Unchanged) */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Add Questions via CSV</CardTitle>
            <p className="text-sm text-neutral-300 mb-4">
              This will add all questions from the CSV to this existing bank.
            </p>
            <CsvUploader bankId={bankId} onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>
      </div>

      {/* Question List (Now a component) */}
      <QuestionList
        questions={questions}
        onEditClick={openEditModal}
        onDeleteClick={openDeleteModal}
      />

      {/* Delete Confirmation Modal (Unchanged) */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Question"
        message={`Are you sure you want to delete this question: "${questionToDelete?.question}"? This cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Edit Question Modal (Now a component) */}
      <EditQuestionModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        formState={editFormState}
        onFormStateChange={setEditFormState}
        onSubmit={handleUpdateQuestion}
      />
    </div>
  );
}