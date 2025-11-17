// src/components/admin/SavePresetModal.jsx
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Button } from "../ui/Button";

export function SavePresetModal({ isOpen, onClose, onSave }) {
  const [presetName, setPresetName] = useState("");

  // Clear the input when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setPresetName("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (presetName.trim()) {
      onSave(presetName.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Theme Preset">
      <div className="space-y-4">
        <Label htmlFor="presetName">Preset Name</Label>
        <Input
          id="presetName"
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="e.g., My Neon Theme"
        />
        <div className="flex gap-4 pt-4">
          <Button variant="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!presetName.trim()}
          >
            Save Preset
          </Button>
        </div>
      </div>
    </Modal>
  );
}