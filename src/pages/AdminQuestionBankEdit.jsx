// src/pages/AdminQuestionBankEdit.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CsvUploader from '../components/admin/CsvUploader';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingScreen from '../components/common/LoadingScreen';
import { useQuestionBankEditor } from '../hooks/useQuestionBankEditor';

// Import UI Kit components
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';

export default function AdminQuestionBankEdit() {
  const { t } = useTranslation();
  const {
    bankId,
    bank,
    questions,
    loading,
    message,
    newQuestion, setNewQuestion,
    ansA, setAnsA,
    ansB, setAnsB,
    ansC, setAnsC,
    ansD, setAnsD,
    correct, setCorrect,
    duration, setDuration,
    isDeleteModalOpen,
    questionToDelete,
    isEditModalOpen,
    editForm,
    handleAddQuestion,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm,
    openEditModal,
    closeEditModal,
    handleEditChange,
    handleEditAnswerChange,
    handleUpdateQuestion,
    handleUploadSuccess
  } = useQuestionBankEditor();

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!bank) {
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
      {/* Header */}
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

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-secondary' : 'bg-primary-dark text-white'}`}>
          {message.text}
        </div>
      )}

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Add Question Form */}
        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-4">Add New Question</CardTitle>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <Label htmlFor="question">Question Text</Label>
                <Input
                  type="text"
                  id="question"
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ansA">Answer A</Label>
                  <Input
                    type="text"
                    id="ansA"
                    value={ansA}
                    onChange={e => setAnsA(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ansB">Answer B</Label>
                  <Input
                    type="text"
                    id="ansB"
                    value={ansB}
                    onChange={e => setAnsB(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ansC">Answer C</Label>
                  <Input
                    type="text"
                    id="ansC"
                    value={ansC}
                    onChange={e => setAnsC(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ansD">Answer D</Label>
                  <Input
                    type="text"
                    id="ansD"
                    value={ansD}
                    onChange={e => setAnsD(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="correct">Correct Answer</Label>
                  <Select
                    id="correct"
                    value={correct}
                    onChange={e => setCorrect(e.target.value)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    min="5"
                    max="300"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Add Question
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Upload CSV */}
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

      {/* Question List */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">All Questions in Bank</CardTitle>
          
          {questions.length === 0 ? (
            <p className="text-neutral-300 text-center py-4">
              No questions in this bank yet.
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map(q => (
                <div
                  key={q.id}
                  className="border-b border-neutral-700 p-4 flex justify-between items-start hover:bg-neutral-800"
                >
                  <div className="flex-1">
                    <p className="font-bold text-lg text-neutral-100 mb-2">
                      {q.question}
                    </p>
                    <ul className="text-sm text-neutral-300 space-y-1">
                      {q.answers.map(ans => (
                        <li
                          key={ans.letter}
                          className={ans.letter === q.correctLetter ? 'font-bold text-primary-light' : ''}
                        >
                          {ans.letter}: {ans.text}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-neutral-500 mt-2">
                      Duration: {q.duration}s
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <Button
                      onClick={() => openEditModal(q)}
                      variant="secondary"
                      className="py-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => openDeleteModal(q)}
                      variant="danger"
                      className="py-1"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Question"
        message={`Are you sure you want to delete this question: "${questionToDelete?.question}"? This cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Edit Question Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <CardTitle className="mb-6">Edit Question</CardTitle>
              <form onSubmit={handleUpdateQuestion} className="space-y-4">
                <div>
                  <Label htmlFor="edit-question">Question Text</Label>
                  <Input
                    type="text"
                    id="edit-question"
                    name="question"
                    value={editForm.question}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {editForm.answers.map((ans, index) => (
                    <div key={ans.letter}>
                      <Label htmlFor={`edit-ans-${ans.letter}`}>
                        Answer {ans.letter}
                      </Label>
                      <Input
                        type="text"
                        id={`edit-ans-${ans.letter}`}
                        value={ans.text}
                        onChange={(e) => handleEditAnswerChange(index, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-correct">Correct Answer</Label>
                    <Select
                      id="edit-correct"
                      name="correctLetter"
                      value={editForm.correctLetter}
                      onChange={handleEditChange}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-duration">Duration (seconds)</Label>
                    <Input
                      type="number"
                      id="edit-duration"
                      name="duration"
                      value={editForm.duration}
                      onChange={handleEditChange}
                      min="5"
                      max="300"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={closeEditModal}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}