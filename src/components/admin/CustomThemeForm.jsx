// src/components/admin/CustomThemeForm.jsx
import React, { useState, useCallback } from 'react';
// 1. Switched back to SketchPicker, it's safer.
import { SketchPicker } from 'react-color';
import { useTranslation } from 'react-i18next';
import { Label } from '../ui/Label';

// A small wrapper for the color picker to manage its popover state
function ColorPickerInput({ label, color, onChange }) {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  const handleClick = useCallback(() => {
    setDisplayColorPicker((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setDisplayColorPicker(false);
  }, []);

  const handleChange = useCallback((color) => {
    onChange(color.hex);
  }, [onChange]);

  return (
    <div className="relative">
      <Label>{label}</Label>
      <div
        className="p-2 border-2 border-neutral-700 rounded-lg cursor-pointer"
        onClick={handleClick}
      >
        <div
          style={{ backgroundColor: color }}
          className="h-8 w-full rounded"
        />
      </div>
      {displayColorPicker ? (
        <div className="absolute z-10" style={{ left: 0, top: '100%' }}>
          <div
            className="fixed inset-0"
            onClick={handleClose}
            aria-hidden="true"
          />
          {/* 2. Make sure this wrapper div is here */}
          <div className="react-color-override">
            <SketchPicker 
              color={color} 
              onChangeComplete={handleChange} 
              disableAlpha={true}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

// The main form component (unchanged)
export function CustomThemeForm({ themeData, onChange }) {
  const { t } = useTranslation();

  const handleColorChange = (key, value) => {
    onChange({
      ...themeData,
      [key]: value,
    });
  };

  return (
    <div className="w-full p-4 mt-4 border-2 border-neutral-700 rounded-lg bg-neutral-950">
      <h4 className="text-lg font-bold font-display mb-4">
        {t('admin.dashboard.customThemeTitle', 'Custom Theme')}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ColorPickerInput
          label="Primary"
          color={themeData.primary}
          onChange={(value) => handleColorChange('primary', value)}
        />
        <ColorPickerInput
          label="Primary Light"
          color={themeData.primaryLight}
          onChange={(value) => handleColorChange('primaryLight', value)}
        />
        <ColorPickerInput
          label="Primary Dark"
          color={themeData.primaryDark}
          onChange={(value) => handleColorChange('primaryDark', value)}
        />
        <ColorPickerInput
          label="Secondary"
          color={themeData.secondary}
          onChange={(value) => handleColorChange('secondary', value)}
        />
        <ColorPickerInput
          label="Secondary Dark"
          color={themeData.secondaryDark}
          onChange={(value) => handleColorChange('secondaryDark', value)}
        />
      </div>
    </div>
  );
}