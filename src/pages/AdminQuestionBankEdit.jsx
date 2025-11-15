// src/pages/AdminQuestionBankEdit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as bankService from '../services/bankService';
import CsvUploader from '../components/admin/CsvUploader';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingScreen from '../components/common/LoadingScreen';

// --- Helper: Initial state for the edit form ---
const initialEditForm = {
  question: '',
  answers: [
    { letter: 'A', text: '' },
    { letter: 'B', text: '' },
    { letter: 'C', text: '' },
    { letter: 'D', text: '' },
  ],
  correctLetter: 'A',
  duration: 30,
  id: null
};

export default function AdminQuestionBankEdit() {
  const { bankId } = useParams();
  const [bank, setBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // State for Add Question Form
  const [newQuestion, setNewQuestion] = useState('');
  const [ansA, setAnsA] = useState('');
  const [ansB, setAnsB] = useState('');
  const [ansC, setAnsC] = useState('');
  const [ansD, setAnsD] = useState('');
  const [correct, setCorrect] = useState('A');
  const [duration, setDuration] = useState(30);

  // State for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // --- NEW: State for Edit Modal ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);

  const handleMessage = (text, type, duration = 4000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  // Fetch bank details and questions on load
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const bankDetails = await bankService.getBankDetails(bankId);
      const bankQuestions = await bankService.getQuestionsForBank(bankId);
      setBank(bankDetails);
      setQuestions(bankQuestions);
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Add Question Handlers ---
  const resetAddForm = () => {
    setNewQuestion('');
    setAnsA('');
    setAnsB('');
    setAnsC('');
    setAnsD('');
    setCorrect('A');
    setDuration(30);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion || !ansA || !ansB || !ansC || !ansD) {
      handleMessage('Please fill out all fields for the new question', 'error');
      return;
    }
    const questionData = {
      question: newQuestion.trim(),
      answers: [
        { letter: 'A', text: ansA.trim() },
        { letter: 'B', text: ansB.trim() },
        { letter: 'C', text: ansC.trim() },
        { letter: 'D', text: ansD.trim() }
      ],
      correctLetter: correct,
      duration: parseInt(duration, 10),
    };
    try {
      await bankService.addQuestion(bankId, questionData);
      handleMessage('Question added successfully!', 'success');
      resetAddForm();
      loadData(); // Refresh the question list
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

  // --- Delete Question Handlers ---
  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setQuestionToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;
    try {
      await bankService.deleteQuestion(bankId, questionToDelete.id);
      handleMessage('Question deleted', 'success');
      setQuestions(questions.filter(q => q.id !== questionToDelete.id)); 
    } catch (error) {
      handleMessage(error.message, 'error');
    } finally {
      closeDeleteModal();
    }
  };

  // --- NEW: Edit Question Handlers ---
  const openEditModal = (question) => {
    setEditForm(question); // Load question data into the form
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditForm(initialEditForm); // Reset form
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditAnswerChange = (index, value) => {
    const newAnswers = [...editForm.answers];
    newAnswers[index] = { ...newAnswers[index], text: value };
    setEditForm(prev => ({ ...prev, answers: newAnswers }));
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      // We need to send clean data, not the ID
      const { id, ...dataToUpdate } = editForm;
      dataToUpdate.duration = parseInt(dataToUpdate.duration, 10); // Ensure duration is number
      
      await bankService.updateQuestion(bankId, id, dataToUpdate);
      handleMessage('Question updated successfully!', 'success');
      closeEditModal();
      loadData(); // Refresh the list
    } catch (error) {
      handleMessage(error.message, 'error');
    }
  };

  // --- CSV Upload Handler ---
  const handleUploadSuccess = () => {
    handleMessage('CSV uploaded successfully! Refreshing questions...', 'success');
    loadData(); // Refresh list after CSV upload
  };

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!bank) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p>{message.text || 'Could not load question bank.'}</p>
        <Link to="/admin/banks" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to All Banks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/admin/banks" className="text-blue-600 hover:underline">
          ← Back to All Banks
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-2">Edit: {bank.name}</h1>
      <p className="text-gray-500 mb-8">Total Questions: {questions.length}</p>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* --- Management Sections --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Add Question Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Add New Question</h2>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Question Text</label>
              <input type="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label>A:</label><input type="text" value={ansA} onChange={e => setAnsA(e.target.value)} className="w-full border rounded px-2 py-1" /></div>
              <div><label>B:</label><input type="text" value={ansB} onChange={e => setAnsB(e.target.value)} className="w-full border rounded px-2 py-1" /></div>
              <div><label>C:</label><input type="text" value={ansC} onChange={e => setAnsC(e.target.value)} className="w-full border rounded px-2 py-1" /></div>
              <div><label>D:</label><input type="text" value={ansD} onChange={e => setAnsD(e.target.value)} className="w-full border rounded px-2 py-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Correct Answer</label>
                <select value={correct} onChange={e => setCorrect(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded">
                  <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Duration (sec)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Add Question
            </button>
          </form>
        </div>

        {/* Upload CSV */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Add Questions via CSV</h2>
          <p className="text-sm text-gray-600 mb-4">This will add all questions from the CSV to this existing bank.</p>
          <CsvUploader bankId={bankId} onUploadSuccess={handleUploadSuccess} />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <h3 className="font-bold text-blue-900 mb-2 text-sm">CSV Format (semicolon-separated):</h3>
            <code className="bg-white px-2 py-1 rounded text-xs block">
              question;answerA;answerB;answerC;answerD;correctLetter;duration
            </code>
          </div>
        </div>
      </div>

      {/* --- Question List --- */}
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold p-6 border-b">All Questions in Bank</h2>
        <div className="divide-y divide-gray-200">
          {questions.length === 0 ? (
            <p className="p-6 text-gray-500">No questions in this bank yet.</p>
          ) : (
            questions.map(q => (
              <div key={q.id} className="p-4 flex justify-between items-start">
                <div>
                  <p className="font-bold">{q.question}</p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    {q.answers.map(ans => (
                      <li key={ans.letter} className={ans.letter === q.correctLetter ? 'font-bold text-green-700' : ''}>
                        {ans.letter}: {ans.text}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">Duration: {q.duration}s</p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  {/* --- UPDATED BUTTON --- */}
                  <button 
                    onClick={() => openEditModal(q)} 
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  <button onClick={() => openDeleteModal(q)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Delete Confirmation Modal --- */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Question"
        message={`Are you sure you want to delete this question: "${questionToDelete?.question}"? This cannot be undone.`}
      />

      {/* --- NEW: Edit Question Modal --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Question</h2>
            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                <input
                  type="text"
                  name="question"
                  value={editForm.question}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {editForm.answers.map((ans, index) => (
                  <div key={ans.letter}>
                    <label>Answer {ans.letter}:</label>
                    <input
                      type="text"
                      value={ans.text}
                      onChange={(e) => handleEditAnswerChange(index, e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Correct Answer</label>
                  <select
                    name="correctLetter"
                    value={editForm.correctLetter}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border rounded"
                  >
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Duration (sec)</label>
                  <input
                    type="number"
                    name="duration"
                    value={editForm.duration}
                    onChange={handleEditChange}
                    className="mt-1 block w-full px-3 py-2 border rounded"
                  Next Step
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}