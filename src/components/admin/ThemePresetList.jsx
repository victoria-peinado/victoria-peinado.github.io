// src/components/admin/ThemePresetList.jsx
import React from 'react';
import { Card, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

export default function ThemePresetList({
  themePresets,
  onEditClick,
  onDeleteClick,
}) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <CardTitle className="mb-4">My Theme Presets</CardTitle>
        {themePresets.length === 0 ? (
          <p className="text-neutral-300 text-center py-4">
            You haven't saved any theme presets yet.
          </p>
        ) : (
          <div className="space-y-4">
            {themePresets.map((preset) => (
              <div
                key={preset.id}
                className="border-b border-neutral-700 p-4 flex justify-between items-center hover:bg-neutral-800"
              >
                <p className="font-bold text-lg text-neutral-100">
                  {preset.name}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onEditClick(preset)}
                    variant="neutral"
                    className="py-2"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDeleteClick(preset)}
                    variant="danger"
                    className="py-2"
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