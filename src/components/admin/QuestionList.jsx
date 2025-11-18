// src/components/admin/QuestionList.jsx
import React from 'react';
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

export default function QuestionList({
  questions,
  onEditClick,
  onDeleteClick,
}) {
  return (
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
                    onClick={() => onEditClick(q)}
                    variant="secondary"
                    className="py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDeleteClick(q)}
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
  );
}