// src/components/admin/QuestionForm.jsx
import React from 'react';
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';

// This is a "dumb" component. It just takes state and handlers.
export default function QuestionForm({
  title,
  formState,
  onFormStateChange,
  onSubmit,
}) {
  const { question, answers, correctLetter, duration } = formState;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFormStateChange({ ...formState, [name]: value });
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], text: value };
    onFormStateChange({ ...formState, answers: newAnswers });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <CardTitle className="mb-4">{title}</CardTitle>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question">Question Text</Label>
            <Input
              type="text"
              id="question"
              name="question" // Use name for edit form
              value={question}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {answers.map((ans, index) => (
              <div key={ans.letter}>
                <Label htmlFor={`ans-${ans.letter}`}>Answer {ans.letter}</Label>
                <Input
                  type="text"
                  id={`ans-${ans.letter}`}
                  value={ans.text}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="correct">Correct Answer</Label>
              <Select
                id="correct"
                name="correctLetter" // Use name for edit form
                value={correctLetter}
                onChange={handleChange}
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
                name="duration" // Use name for edit form
                value={duration}
                onChange={handleChange}
                min="5"
                max="300"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            {title}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}